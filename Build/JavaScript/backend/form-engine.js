/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
/**
 * contains all JS functions related to TYPO3 TCEforms/FormEngine
 *
 * there are separate issues in this main object
 *   - functions, related to Element Browser ("Popup Window") and select fields
 *   - filling select fields (by wizard etc) from outside, formerly known via "setFormValueFromBrowseWin"
 *   - select fields: move selected items up and down via buttons, remove items etc
 */
import DocumentService from '@typo3/core/document-service';
import $ from 'jquery';
import FormEngineValidation from '@typo3/backend/form-engine-validation';
import { default as Modal } from '@typo3/backend/modal';
import * as MessageUtility from '@typo3/backend/utility/message-utility';
import Severity from '@typo3/backend/severity';
import * as BackendExceptionModule from '@typo3/backend/backend-exception';
import InteractionRequestMap from '@typo3/backend/event/interaction-request-map';
import Utility from '@typo3/backend/utility';
import { selector } from '@typo3/core/literals';
import '@typo3/backend/form-engine/element/extra/char-counter';
import Hotkeys, { ModifierKeys } from '@typo3/backend/hotkeys';
import RegularEvent from '@typo3/core/event/regular-event';
/**
 * Module: @typo3/backend/form-engine
 */
export default (function () {
    function handleConsumeResponse(interactionRequest, response) {
        if (response) {
            FormEngine.interactionRequestMap.resolveFor(interactionRequest);
        }
        else {
            FormEngine.interactionRequestMap.rejectFor(interactionRequest);
        }
    }
    const onFieldChangeHandlers = new Map();
    // @see \TYPO3\CMS\Backend\Form\Behavior\UpdateValueOnFieldChange
    onFieldChangeHandlers.set('typo3-backend-form-update-value', (data) => {
        const valueField = document.querySelector(selector `[name="${data.elementName}"]`);
        const humanReadableField = document.querySelector(selector `[data-formengine-input-name="${data.elementName}"]`);
        FormEngine.Validation.updateInputField(data.elementName);
        if (valueField !== null) {
            FormEngine.Validation.markFieldAsChanged(valueField);
            FormEngine.Validation.validateField(valueField);
        }
        if (humanReadableField !== null && humanReadableField !== valueField) {
            FormEngine.Validation.validateField(humanReadableField);
        }
    });
    // @see \TYPO3\CMS\Backend\Form\Behavior\ReloadOnFieldChange
    onFieldChangeHandlers.set('typo3-backend-form-reload', (data) => {
        const saveDocumentWithoutValidation = () => {
            // Shortcut method to suspend FormEngine validation on purpose as user attempts to switch to another document type
            // and fields may become irrelevant after switching the type (e.g. the "URL" field when switching a page's doktype from "External URL" to "Standard").
            // This is a workaround! FormEngine must be able to determine on a field basis whether the field is still relevant or not.
            FormEngine.Validation.suspend();
            FormEngine.saveDocument();
            FormEngine.Validation.resume();
        };
        if (!data.confirmation) {
            saveDocumentWithoutValidation();
            return;
        }
        const modal = Modal.advanced({
            title: TYPO3.lang['FormEngine.refreshRequiredTitle'],
            content: TYPO3.lang['FormEngine.refreshRequiredContent'],
            severity: Severity.warning,
            staticBackdrop: true,
            buttons: [
                {
                    text: TYPO3.lang['button.cancel'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                    trigger: () => {
                        modal.hideModal();
                    }
                },
                {
                    text: TYPO3.lang['button.ok'] || 'OK',
                    btnClass: 'btn-' + Severity.getCssClass(Severity.warning),
                    name: 'ok',
                    trigger: () => {
                        FormEngine.closeModalsRecursive();
                        saveDocumentWithoutValidation();
                    }
                }
            ]
        });
    });
    // @see \TYPO3\CMS\Backend\Form\Behavior\UpdateBitmaskOnFieldChange
    onFieldChangeHandlers.set('typo3-backend-form-update-bitmask', (data, evt) => {
        const targetRef = evt.target; // clicked element
        const elementRef = FormEngine.formElement[data.elementName]; // (hidden) element holding value
        const active = targetRef.checked !== data.invert; // `xor` either checked or inverted
        const mask = Math.pow(2, data.position);
        const unmask = Math.pow(2, data.total) - mask - 1;
        elementRef.value = active ? (elementRef.value | mask) : (elementRef.value & unmask);
        elementRef.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    });
    /**
     * @exports @typo3/backend/form-engine
     */
    const FormEngine = {
        consumeTypes: ['typo3.setUrl', 'typo3.beforeSetUrl', 'typo3.refresh'],
        Validation: FormEngineValidation,
        interactionRequestMap: InteractionRequestMap,
        formName: TYPO3.settings.FormEngine.formName,
        formElement: undefined,
        openedPopupWindow: null,
        browserUrl: '',
        doSaveFieldName: ''
    };
    Object.defineProperty(FormEngine, 'formElement', {
        get: () => document.forms.namedItem(FormEngine.formName),
        enumerable: true,
        configurable: false,
    });
    /**
     * Opens a popup window with the element browser (browser.php)
     *
     * @param {string} mode can be "db" or "file"
     * @param {string} params additional params for the browser window
     * @param {string} entryPoint the entry point, which should be expanded by default
     */
    FormEngine.openPopupWindow = function (mode, params, entryPoint) {
        const queryParams = {
            mode: mode,
            bparams: params
        };
        if (entryPoint) {
            if (mode === 'db') {
                queryParams.expandPage = entryPoint;
            }
            else {
                queryParams.expandFolder = entryPoint;
            }
        }
        return Modal.advanced({
            type: Modal.types.iframe,
            content: FormEngine.browserUrl + '&' + (new URLSearchParams(queryParams)).toString(),
            size: Modal.sizes.large
        });
    };
    /**
     * properly fills the select field from the popup window (element browser, link browser)
     * or from a multi-select (two selects side-by-side)
     * previously known as "setFormValueFromBrowseWin"
     *
     * @param {string} fieldName Formerly known as "fsetFormValueFromBrowseWinName" name of the field, like [tt_content][2387][header]
     * @param {string|number} value The value to fill in (could be an integer)
     * @param {string} label The visible name in the selector
     * @param {string} title The title when hovering over it
     * @param {string} exclusiveValues If the select field has exclusive options that are not combine-able
     * @param {HTMLOptionElement} optionEl The HTMLOptionElement object of the selected <option> tag
     */
    FormEngine.setSelectOptionFromExternalSource = function (fieldName, value, label, title, exclusiveValues = [], optionEl = undefined) {
        let fieldEl, $fieldEl, isMultiple = false, isList = false;
        $fieldEl = FormEngine.getFieldElement(fieldName);
        fieldEl = $fieldEl.get(0);
        const originalFieldEl = $fieldEl.get(0);
        if (originalFieldEl === null || value === '--div--' || originalFieldEl instanceof HTMLOptGroupElement) {
            return;
        }
        // Check if the form object has a "_list" element
        // The "_list" element exists for multiple selection select types
        const $listFieldEl = FormEngine.getFieldElement(fieldName, '_list', true);
        if ($listFieldEl.length > 0) {
            $fieldEl = $listFieldEl;
            fieldEl = $fieldEl.get(0);
            isMultiple = ($fieldEl.prop('multiple') && $fieldEl.prop('size') != '1');
            isList = true;
        }
        if (isMultiple || isList) {
            const $availableFieldEl = FormEngine.getFieldElement(fieldName, '_avail');
            const availableFieldEl = $availableFieldEl.get(0);
            // If multiple values are not allowed, clear anything that is in the control already
            if (!isMultiple) {
                for (const el of fieldEl.querySelectorAll('option')) {
                    const $option = $availableFieldEl.find(selector `option[value="${$(el).attr('value')}"]`);
                    if ($option.length) {
                        $option.removeClass('hidden').prop('disabled', false);
                        FormEngine.enableOptGroup($option.get(0));
                    }
                }
                $fieldEl.empty();
            }
            // Clear elements if exclusive values are found
            if (exclusiveValues.length > 0) {
                let reenableOptions = false;
                // the new value is exclusive => remove all existing values
                if (exclusiveValues.includes(value)) {
                    $fieldEl.empty();
                    reenableOptions = true;
                }
                else if ($fieldEl.find('option').length == 1) {
                    // there is an old value, and it was exclusive => it has to be removed
                    if (exclusiveValues.includes($fieldEl.find('option').prop('value'))) {
                        $fieldEl.empty();
                        reenableOptions = true;
                    }
                }
                if (reenableOptions && typeof optionEl !== 'undefined') {
                    optionEl.closest('select').querySelectorAll('[disabled]').forEach(function (disabledOption) {
                        disabledOption.classList.remove('hidden');
                        disabledOption.disabled = false;
                        FormEngine.enableOptGroup(disabledOption);
                    });
                }
            }
            // Inserting the new element
            let addNewValue = true;
            // check if there is a "_mul" field (a field on the right) and if the field was already added
            const $multipleFieldEl = FormEngine.getFieldElement(fieldName, '_mul', true);
            if ($multipleFieldEl.length == 0 || $multipleFieldEl.val() == 0) {
                for (const optionEl of fieldEl.querySelectorAll('option')) {
                    if (optionEl.value == value) {
                        addNewValue = false;
                        break;
                    }
                }
                if (addNewValue && typeof optionEl !== 'undefined') {
                    optionEl.classList.add('hidden');
                    optionEl.disabled = true;
                    // In case the disabled option was the last active option and is in an optGroup, also disable the optGroup
                    const optGroup = optionEl.parentElement;
                    if (optGroup instanceof HTMLOptGroupElement
                        && optGroup.querySelectorAll('option:not([disabled]):not([hidden]):not(.hidden)').length === 0) {
                        optGroup.disabled = true;
                        optGroup.classList.add('hidden');
                    }
                }
            }
            // element can be added
            if (addNewValue) {
                // finally add the option
                const $option = $('<option></option>');
                $option.attr({ value: value, title: title }).text(label);
                $option.appendTo($fieldEl);
                // set the hidden field
                FormEngine.updateHiddenFieldValueFromSelect(fieldEl, originalFieldEl);
                FormEngine.Validation.markFieldAsChanged(originalFieldEl);
                FormEngine.Validation.validateField(fieldEl);
                FormEngine.Validation.validateField(availableFieldEl);
            }
        }
        else {
            // The incoming value consists of the table name, an underscore and the uid
            // or just the uid
            // For a single selection field we need only the uid, so we extract it
            const pattern = /_(\d+)$/, result = value.toString().match(pattern);
            if (result != null) {
                value = result[1];
            }
            // Change the selected value
            $fieldEl.val(value);
            FormEngine.Validation.validateField(fieldEl);
        }
    };
    /**
     * sets the value of the hidden field, from the select list, always executed after the select field was updated
     * previously known as global function setHiddenFromList()
     *
     * @param {HTMLElement} selectFieldEl the select field
     * @param {HTMLElement} originalFieldEl the hidden form field
     */
    FormEngine.updateHiddenFieldValueFromSelect = function (selectFieldEl, originalFieldEl) {
        const selectedValues = Array.from(selectFieldEl.options).map((el) => el.value);
        // make a comma separated list, if it is a multi-select
        // set the values to the final hidden field
        originalFieldEl.value = selectedValues.join(',');
        originalFieldEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    };
    /**
     * returns a jQuery object for the given form name of the current form,
     * if the parameter "fieldName" is given, then the form element is only returned if the field name is available
     * the latter behaviour mirrors the one of the function "setFormValue_getFObj"
     *
     * @param {String} fieldName the field name to check for, optional
     * @returns {*|HTMLElement}
     */
    FormEngine.getFormElement = function (fieldName) {
        const $formEl = $(selector `form[name="${FormEngine.formName}"]:first`);
        if (fieldName) {
            const $fieldEl = FormEngine.getFieldElement(fieldName), $listFieldEl = FormEngine.getFieldElement(fieldName, '_list');
            // Take the form object if it is either of type select-one or of type-multiple and it has a "_list" element
            if ($fieldEl.length > 0 &&
                (($fieldEl.prop('type') === 'select-one') ||
                    ($listFieldEl.length > 0 && $listFieldEl.prop('type').match(/select-(one|multiple)/)))) {
                return $formEl;
            }
            else {
                console.error('Form fields missing: form: ' + FormEngine.formName + ', field name: ' + fieldName);
                alert('Form field is invalid');
            }
        }
        else {
            return $formEl;
        }
    };
    /**
     * Returns a jQuery object of the field DOM element of the current form, can also be used to
     * request an alternative field like "_list", "_avail" or "_mul"
     *
     * @param {String} fieldName the name of the field (<input name="fieldName">)
     * @param {String} appendix optional
     * @param {Boolean} noFallback if set, then the appendix value is returned no matter if it exists or not
     */
    FormEngine.getFieldElement = function (fieldName, appendix, noFallback) {
        // if an appendix is set, return the field with the appendix (like _mul or _list)
        if (appendix) {
            let $fieldEl;
            switch (appendix) {
                case '_list':
                    $fieldEl = $(selector `:input[data-formengine-input-name="${fieldName}"]:not([type=hidden])`, FormEngine.formElement);
                    break;
                case '_avail':
                    $fieldEl = $(selector `:input[data-relatedfieldname="${fieldName}"]`, FormEngine.formElement);
                    break;
                case '_mul':
                    $fieldEl = $(selector `:input[type=hidden][data-formengine-input-name="${fieldName}"]`, FormEngine.formElement);
                    break;
                default:
                    $fieldEl = null;
                    break;
            }
            if (($fieldEl && $fieldEl.length > 0) || noFallback === true) {
                return $fieldEl;
            }
        }
        return $(FormEngine.formElement.elements.namedItem(fieldName));
    };
    /**
     * Initialize events for all form engine relevant tasks.
     * This function only needs to be called once on page load,
     * as it using deferrer methods only
     */
    FormEngine.initializeEvents = function () {
        if (top.TYPO3 && typeof top.TYPO3.Backend !== 'undefined') {
            top.TYPO3.Backend.consumerScope.attach(FormEngine);
            window.addEventListener('pagehide', () => top.TYPO3.Backend.consumerScope.detach(FormEngine), { once: true });
        }
        new RegularEvent('click', (e) => {
            e.preventDefault();
            FormEngine.preventExitIfNotSaved(FormEngine.preventExitIfNotSavedCallback);
        }).delegateTo(document, '.t3js-editform-close');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            FormEngine.previewAction(e, FormEngine.previewActionCallback);
        }).delegateTo(document, '.t3js-editform-view');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            FormEngine.newAction(e, FormEngine.newActionCallback);
        }).delegateTo(document, '.t3js-editform-new');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            FormEngine.duplicateAction(e, FormEngine.duplicateActionCallback);
        }).delegateTo(document, '.t3js-editform-duplicate');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            FormEngine.deleteAction(e, FormEngine.deleteActionCallback);
        }).delegateTo(document, '.t3js-editform-delete-record');
        new RegularEvent('change', (event, target) => {
            target.closest('.t3js-formengine-field-item').classList.toggle('disabled');
        }).delegateTo(document, '.t3-form-field-eval-null-checkbox input[type="checkbox"]');
        new RegularEvent('change', (event, target) => {
            FormEngine.toggleCheckboxField(target);
            FormEngine.Validation.markFieldAsChanged(target);
        }).delegateTo(document, '.t3js-form-field-eval-null-placeholder-checkbox input[type="checkbox"]');
        new RegularEvent('click', (e, target) => {
            e.preventDefault();
            e.stopPropagation();
            const mode = target.dataset.mode;
            const params = target.dataset.params;
            const entryPoint = target.dataset.entryPoint;
            FormEngine.openPopupWindow(mode, params, entryPoint);
        }).delegateTo(document, '.t3js-element-browser');
        new RegularEvent('click', (evt, target) => {
            const items = JSON.parse(target.dataset.formengineFieldChangeItems);
            FormEngine.processOnFieldChange(items, evt);
        }).delegateTo(document, '[data-formengine-field-change-event="click"]');
        new RegularEvent('change', (evt, target) => {
            const items = JSON.parse(target.dataset.formengineFieldChangeItems);
            FormEngine.processOnFieldChange(items, evt);
        }).delegateTo(document, '[data-formengine-field-change-event="change"]');
        FormEngine.formElement.addEventListener('submit', function (e) {
            const form = e.target;
            if (form.closeDoc?.value !== '0') {
                return;
            }
            if (e.submitter !== null && (e.submitter.tagName === 'A' || e.submitter.hasAttribute('form')) && !e.defaultPrevented) {
                const saveField = form.querySelector(selector `input[name="${FormEngine.doSaveFieldName}"]`);
                if (saveField !== null) {
                    saveField.value = '1';
                }
            }
        });
        window.addEventListener('message', FormEngine.handlePostMessage);
    };
    FormEngine.consume = function (interactionRequest) {
        if (!interactionRequest) {
            // @todo better return a rejected promise
            throw new BackendExceptionModule.BackendException('No interaction request given', 1496589980);
        }
        let promiseControls;
        const promise = new Promise((resolve, reject) => {
            promiseControls = { resolve, reject };
        });
        if (interactionRequest.concernsTypes(FormEngine.consumeTypes)) {
            const outerMostRequest = interactionRequest.outerMostRequest;
            FormEngine.interactionRequestMap.attachFor(outerMostRequest, promiseControls);
            // resolve or reject with previous user choice
            if (outerMostRequest.isProcessed()) {
                handleConsumeResponse(outerMostRequest, outerMostRequest.getProcessedData().response);
                // show confirmation dialog
            }
            else if (FormEngine.hasChange() || FormEngine.isNew()) {
                FormEngine.preventExitIfNotSaved(function (response) {
                    outerMostRequest.setProcessedData({ response: response });
                    handleConsumeResponse(outerMostRequest, response);
                });
                // resolve directly
            }
            else {
                FormEngine.interactionRequestMap.resolveFor(outerMostRequest);
            }
        }
        return promise;
    };
    FormEngine.handlePostMessage = function (e) {
        if (!MessageUtility.MessageUtility.verifyOrigin(e.origin)) {
            throw 'Denied message sent by ' + e.origin;
        }
        if (e.data.actionName === 'typo3:elementBrowser:elementAdded') {
            if (typeof e.data.fieldName === 'undefined') {
                throw 'fieldName not defined in message';
            }
            if (typeof e.data.value === 'undefined') {
                throw 'value not defined in message';
            }
            const label = e.data.label || e.data.value;
            const title = e.data.title || label;
            const exclusiveValues = Utility.trimExplode(',', e.data?.exclusiveValues ?? '');
            FormEngine.setSelectOptionFromExternalSource(e.data.fieldName, e.data.value, label, title, exclusiveValues);
        }
    };
    /**
     * Initializes the remaining character views based on the fields' maxlength attribute
     */
    FormEngine.initializeRemainingCharacterViews = function () {
        // all fields with a "maxlength" attribute
        const elementsWithMaxLengths = document.querySelectorAll('[maxlength]:not([data-input-type="datetimepicker"]):not(.t3js-color-picker)');
        elementsWithMaxLengths.forEach((element) => {
            const fieldItem = element.closest('.t3js-formengine-field-item');
            if (fieldItem !== null && fieldItem.querySelector('typo3-backend-formengine-char-counter') === null) {
                const charCounterElement = document.createElement('typo3-backend-formengine-char-counter');
                charCounterElement.setAttribute('target', `[data-formengine-input-name="${selector `${element.dataset.formengineInputName}`}"]`);
                fieldItem.append(charCounterElement);
            }
        });
    };
    /**
     * Initializes the left character count needed to reach the minimum value based on the field's minlength attribute
     */
    FormEngine.initializeMinimumCharactersLeftViews = function () {
        const addOrUpdateCounter = (minCharacterCountLeft, event) => {
            const parent = event.currentTarget.closest('.t3js-formengine-field-item');
            const counter = parent.querySelector('.t3js-charcounter-min');
            const labelValue = TYPO3.lang['FormEngine.minCharactersLeft'].replace('{0}', minCharacterCountLeft);
            if (counter) {
                counter.querySelector('span').innerHTML = labelValue;
            }
            else {
                const counter = document.createElement('div');
                counter.classList.add('t3js-charcounter-min');
                const label = document.createElement('span');
                label.classList.add('badge', 'badge-danger');
                label.innerHTML = labelValue;
                counter.append(label);
                let wrapper = parent.querySelector('.t3js-charcounter-wrapper');
                if (!wrapper) {
                    wrapper = document.createElement('div');
                    wrapper.classList.add('t3js-charcounter-wrapper');
                    parent.append(wrapper);
                }
                wrapper.prepend(counter);
            }
        };
        const removeCounter = (event) => {
            const parent = event.currentTarget.closest('.t3js-formengine-field-item');
            const counter = parent.querySelector('.t3js-charcounter-min');
            if (counter) {
                counter.remove();
            }
        };
        const minlengthElements = document.querySelectorAll('[minlength]:not([data-input-type="datetimepicker"]):not(.t3js-charcounter-min-initialized)');
        minlengthElements.forEach((field) => {
            field.addEventListener('focus', (event) => {
                const minCharacterCountLeft = FormEngine.getMinCharacterLeftCount(field);
                if (minCharacterCountLeft > 0) {
                    addOrUpdateCounter(minCharacterCountLeft, event);
                }
            });
            field.addEventListener('blur', removeCounter);
            field.addEventListener('keyup', (event) => {
                const minCharacterCountLeft = FormEngine.getMinCharacterLeftCount(field);
                if (minCharacterCountLeft > 0) {
                    addOrUpdateCounter(minCharacterCountLeft, event);
                }
                else {
                    removeCounter(event);
                }
            });
        });
    };
    /**
     * Get the properties required for proper rendering of the character counter
     *
     * @param {HTMLElement} field
     * @returns number
     */
    FormEngine.getMinCharacterLeftCount = function (field) {
        const text = field.value;
        const minlength = field.minLength;
        const currentFieldLength = text.length;
        // minLength doesn't care about empty fields.
        if (currentFieldLength === 0) {
            return 0;
        }
        const numberOfLineBreaks = (text.match(/\n/g) || []).length; // count line breaks
        const minimumCharactersLeft = minlength - currentFieldLength - numberOfLineBreaks;
        return minimumCharactersLeft;
    };
    /**
     * Initialize input / text field "null" checkbox CSS overlay if no placeholder is set.
     */
    FormEngine.initializeNullNoPlaceholderCheckboxes = function () {
        document.querySelectorAll('.t3-form-field-eval-null-checkbox').forEach((el) => {
            // Add disabled class to "t3js-formengine-field-item" if the null checkbox is NOT set,
            // This activates a CSS overlay "disabling" the input field and everything around.
            const checkbox = el.querySelector('input[type="checkbox"]');
            const fieldItem = el.closest('.t3js-formengine-field-item');
            if (!checkbox.checked) {
                fieldItem.classList.add('disabled');
            }
        });
    };
    /**
     * Initialize input / text field "null" checkbox placeholder / real field if placeholder is set.
     */
    FormEngine.initializeNullWithPlaceholderCheckboxes = function () {
        document.querySelectorAll('.t3js-form-field-eval-null-placeholder-checkbox').forEach((el) => {
            FormEngine.toggleCheckboxField(el.querySelector('input[type="checkbox"]'), false);
        });
    };
    /**
     * Set initial state of both div's (one containing actual field, other containing placeholder field)
     * depending on whether checkbox is checked or not
     */
    FormEngine.toggleCheckboxField = function (checkbox, triggerFocusWhenChecked = true) {
        const item = checkbox.closest('.t3js-formengine-field-item');
        const placeholder = item.querySelector('.t3js-formengine-placeholder-placeholder');
        const formFieldWrapper = item.querySelector('.t3js-formengine-placeholder-formfield');
        if (checkbox.checked) {
            placeholder.hidden = true;
            formFieldWrapper.hidden = false;
            if (triggerFocusWhenChecked) {
                formFieldWrapper.querySelector('input,select,textarea')?.focus();
            }
        }
        else {
            placeholder.hidden = false;
            formFieldWrapper.hidden = true;
        }
    };
    /**
     * This is the main function that is called on page load, but also after elements are asynchronously
     * called e.g. after inline elements are loaded, or a new flexform section is added.
     * Use this function in your extension like this "TYPO3.FormEngine.initialize()"
     * if you add new fields dynamically.
     */
    FormEngine.reinitialize = function () {
        // Apply "close" button to all input / datetime fields
        const clearables = document.querySelectorAll('.t3js-clearable');
        if (clearables.length > 0) {
            import('@typo3/backend/input/clearable').then(function () {
                clearables.forEach(clearableField => clearableField.clearable());
            });
        }
        FormEngine.initializeNullNoPlaceholderCheckboxes();
        FormEngine.initializeNullWithPlaceholderCheckboxes();
        FormEngine.initializeLocalizationStateSelector();
        FormEngine.initializeMinimumCharactersLeftViews();
        FormEngine.initializeRemainingCharacterViews();
    };
    /**
     * Disable the input field on load if localization state selector is set to "parent" or "source"
     */
    FormEngine.initializeLocalizationStateSelector = function () {
        document.querySelectorAll('.t3js-l10n-state-container').forEach((el) => {
            const input = el.closest('.t3js-formengine-field-item')?.querySelector('[data-formengine-input-name]');
            if (input === undefined || input === null) {
                return;
            }
            const currentState = el.querySelector('input[type="radio"]:checked')?.value;
            if (currentState === undefined) {
                console.warn('The localization state of the field ' + input.dataset.formengineInputName + ' cannot be determined. This smells like a DataHandler bug.');
            }
            if (currentState === 'parent' || currentState === 'source') {
                input.disabled = true;
            }
        });
    };
    /**
     * @return {boolean}
     */
    FormEngine.hasChange = function () {
        const formElementChanges = $(selector `form[name="${FormEngine.formName}"] .has-change`).length > 0, inlineRecordChanges = $('[name^="data["].has-change').length > 0;
        return formElementChanges || inlineRecordChanges;
    };
    /**
     * @return {boolean}
     */
    FormEngine.isNew = function () {
        return (document.querySelector('form[name="' + FormEngine.formName + '"] .typo3-TCEforms.is-new') !== null);
    };
    /**
     * @param {boolean} response
     */
    FormEngine.preventExitIfNotSavedCallback = () => {
        FormEngine.closeDocument();
    };
    /**
     * Show modal to confirm following a clicked link to confirm leaving the document without saving
     *
     * @param {String} href
     * @returns {Boolean}
     */
    FormEngine.preventFollowLinkIfNotSaved = function (href) {
        FormEngine.preventExitIfNotSaved(function () {
            window.location.href = href;
        });
        return false;
    };
    /**
     * Show modal to confirm closing the document without saving.
     *
     * @param {Function} callback
     */
    FormEngine.preventExitIfNotSaved = function (callback) {
        callback = callback || FormEngine.preventExitIfNotSavedCallback;
        if (FormEngine.hasChange() || FormEngine.isNew()) {
            const title = TYPO3.lang['label.confirm.close_without_save.title'] || 'Do you want to close without saving?';
            const content = TYPO3.lang['label.confirm.close_without_save.content'] || 'You currently have unsaved changes. Are you sure you want to discard these changes?';
            const buttons = [
                {
                    text: TYPO3.lang['buttons.confirm.close_without_save.no'] || 'No, I will continue editing',
                    btnClass: 'btn-default',
                    name: 'no'
                },
                {
                    text: TYPO3.lang['buttons.confirm.close_without_save.yes'] || 'Yes, discard my changes',
                    btnClass: 'btn-default',
                    name: 'yes'
                }
            ];
            if ($('.has-error').length === 0) {
                buttons.push({
                    text: TYPO3.lang['buttons.confirm.save_and_close'] || 'Save and close',
                    btnClass: 'btn-primary',
                    name: 'save',
                    active: true
                });
            }
            const modal = Modal.confirm(title, content, Severity.warning, buttons);
            modal.addEventListener('button.clicked', function (e) {
                if (e.target.name === 'no') {
                    modal.hideModal();
                }
                else if (e.target.name === 'yes') {
                    modal.hideModal();
                    callback.call(null, true);
                }
                else if (e.target.name === 'save') {
                    modal.hideModal();
                    FormEngine.saveAndCloseDocument();
                }
            });
        }
        else {
            callback.call(null, true);
        }
    };
    /**
     * Show modal to confirm closing the document without saving
     */
    FormEngine.preventSaveIfHasErrors = function () {
        if ($('.has-error').length > 0) {
            const title = TYPO3.lang['label.alert.save_with_error.title'] || 'You have errors in your form!';
            const content = TYPO3.lang['label.alert.save_with_error.content'] || 'Please check the form, there is at least one error in your form.';
            const modal = Modal.confirm(title, content, Severity.error, [
                {
                    text: TYPO3.lang['buttons.alert.save_with_error.ok'] || 'OK',
                    btnClass: 'btn-danger',
                    name: 'ok'
                }
            ]);
            modal.addEventListener('button.clicked', function (e) {
                if (e.target.name === 'ok') {
                    modal.hideModal();
                }
            });
            return false;
        }
        return true;
    };
    /**
     * @param {OnFieldChangeItem[]} items
     * @param {Event|null|undefined} evt
     */
    FormEngine.processOnFieldChange = function (items, evt) {
        items.forEach((item) => {
            const handler = onFieldChangeHandlers.get(item.name);
            if (handler instanceof Function) {
                handler.call(null, item.data || null, evt);
            }
        });
    };
    FormEngine.registerOnFieldChangeHandler = function (name, handler) {
        if (onFieldChangeHandlers.has(name)) {
            console.warn('Handler for onFieldChange name `' + name + '` has been overridden.');
        }
        onFieldChangeHandlers.set(name, handler);
    };
    FormEngine.closeModalsRecursive = function () {
        if (typeof Modal.currentModal !== 'undefined' && Modal.currentModal !== null) {
            Modal.currentModal.addEventListener('typo3-modal-hidden', function () {
                FormEngine.closeModalsRecursive();
            });
            Modal.currentModal.hideModal();
        }
    };
    /**
     * Preview action
     *
     * When there are changes:
     * Will take action based on local storage preset
     * If preset is not available, a modal will open
     *
     * @param {Event} event
     * @param {Function} callback
     */
    FormEngine.previewAction = function (event, callback) {
        callback = callback || FormEngine.previewActionCallback;
        const previewUrl = event.target.href;
        const isNew = ('isNew' in event.target.dataset);
        const $actionElement = $('<input />').attr('type', 'hidden').attr('name', '_savedokview').attr('value', '1');
        if (FormEngine.hasChange() || FormEngine.isNew()) {
            FormEngine.showPreviewModal(previewUrl, isNew, $actionElement, callback);
        }
        else {
            $(selector `form[name="${FormEngine.formName}"]`).append($actionElement);
            window.open('', 'newTYPO3frontendWindow');
            FormEngine.formElement.submit();
        }
    };
    /**
     * The callback for the preview action
     *
     * @param {string} modalButtonName
     * @param {string} previewUrl
     * @param {ModalElement} actionElement
     */
    FormEngine.previewActionCallback = function (modalButtonName, previewUrl, actionElement) {
        Modal.dismiss();
        switch (modalButtonName) {
            case 'discard':
                const previewWin = window.open(previewUrl, 'newTYPO3frontendWindow');
                previewWin.focus();
                if (Utility.urlsPointToSameServerSideResource(previewWin.location.href, previewUrl)) {
                    previewWin.location.reload();
                }
                break;
            case 'save':
                $(selector `form[name="${FormEngine.formName}"]`).append($(actionElement));
                window.open('', 'newTYPO3frontendWindow');
                FormEngine.saveDocument();
                break;
            default:
                break;
        }
    };
    /**
     * Show the preview modal
     *
     * @param {string} previewUrl
     * @param {bool} isNew
     * @param {element} $actionElement
     * @param {Function} callback
     */
    FormEngine.showPreviewModal = function (previewUrl, isNew, $actionElement, callback) {
        const title = TYPO3.lang['label.confirm.view_record_changed.title'] || 'Do you want to save before viewing?';
        const modalCancelButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.view_record_changed.cancel'] || 'Cancel',
            btnClass: 'btn-default',
            name: 'cancel'
        };
        const modaldismissViewButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.view_record_changed.no-save'] || 'View without changes',
            btnClass: 'btn-default',
            name: 'discard'
        };
        const modalsaveViewButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.view_record_changed.save'] || 'Save changes and view',
            btnClass: 'btn-primary',
            name: 'save',
            active: true
        };
        let modalButtons = [];
        let contentStrings = [];
        if (isNew) {
            if (!FormEngine.Validation.isValid()) {
                FormEngine.Validation.showErrorModal();
                return;
            }
            modalButtons = [
                modalCancelButtonConfiguration,
                modalsaveViewButtonConfiguration
            ];
            contentStrings = [
                TYPO3.lang['label.confirm.view_record_changed.content.is-new-page']
                    || 'You need to save your changes before viewing the page. Do you want to save and view them now?'
            ];
        }
        else {
            modalButtons = [
                modalCancelButtonConfiguration,
                modaldismissViewButtonConfiguration,
            ];
            contentStrings = [
                TYPO3.lang['label.confirm.view_record_changed.content']
                    || 'You currently have unsaved changes. You can either discard these changes or save and view them.'
            ];
            if (FormEngine.Validation.isValid()) {
                modalButtons.push(modalsaveViewButtonConfiguration);
            }
            else {
                contentStrings.push(TYPO3.lang['label.confirm.view_record_changed.invalid_form']
                    || 'The form appears to be invalid, therefore "Save changes and view" is not available.');
            }
        }
        const contentElement = document.createElement('p');
        contentStrings.forEach((item, i) => {
            contentElement.append(item);
            if (i !== contentStrings.length - 1) {
                contentElement.append(document.createElement('br'));
            }
        });
        const modal = Modal.confirm(title, contentElement, Severity.info, modalButtons);
        modal.addEventListener('button.clicked', function (event) {
            callback(event.target.name, previewUrl, $actionElement, modal);
        });
    };
    /**
     * New action
     *
     * When there are changes:
     * Will take action based on local storage preset
     * If preset is not available, a modal will open
     *
     * @param {Event} event
     * @param {Function} callback
     */
    FormEngine.newAction = function (event, callback) {
        callback = callback || FormEngine.newActionCallback;
        const $actionElement = $('<input />').attr('type', 'hidden').attr('name', '_savedoknew').attr('value', '1');
        const isNew = ('isNew' in event.target.dataset);
        if (FormEngine.hasChange() || FormEngine.isNew()) {
            FormEngine.showNewModal(isNew, $actionElement, callback);
        }
        else {
            $(selector `form[name="${FormEngine.formName}"]`).append($actionElement);
            FormEngine.formElement.submit();
        }
    };
    /**
     * The callback for the preview action
     *
     * @param {string} modalButtonName
     * @param {element} $actionElement
     */
    FormEngine.newActionCallback = function (modalButtonName, $actionElement) {
        const $form = $(selector `form[name="${FormEngine.formName}"]`);
        Modal.dismiss();
        switch (modalButtonName) {
            case 'no':
                $form.append($actionElement);
                FormEngine.formElement.submit();
                break;
            case 'yes':
                $form.append($actionElement);
                FormEngine.saveDocument();
                break;
            default:
                break;
        }
    };
    /**
     * Show the new modal
     *
     * @param {bool} isNew
     * @param {element} $actionElement
     * @param {Function} callback
     */
    FormEngine.showNewModal = function (isNew, $actionElement, callback) {
        const title = TYPO3.lang['label.confirm.new_record_changed.title'] || 'Do you want to save before adding?';
        const content = (TYPO3.lang['label.confirm.new_record_changed.content']
            || 'You need to save your changes before creating a new record. Do you want to save and create now?');
        let modalButtons = [];
        const modalCancelButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.new_record_changed.cancel'] || 'Cancel',
            btnClass: 'btn-default',
            name: 'cancel'
        };
        const modalNoButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.new_record_changed.no'] || 'No, just add',
            btnClass: 'btn-default',
            name: 'no'
        };
        const modalYesButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.new_record_changed.yes'] || 'Yes, save and create now',
            btnClass: 'btn-primary',
            name: 'yes',
            active: true
        };
        if (isNew) {
            modalButtons = [
                modalCancelButtonConfiguration,
                modalYesButtonConfiguration
            ];
        }
        else {
            modalButtons = [
                modalCancelButtonConfiguration,
                modalNoButtonConfiguration,
                modalYesButtonConfiguration
            ];
        }
        const modal = Modal.confirm(title, content, Severity.info, modalButtons);
        modal.addEventListener('button.clicked', function (event) {
            callback(event.target.name, $actionElement);
        });
    };
    /**
     * Duplicate action
     *
     * When there are changes:
     * Will take action based on local storage preset
     * If preset is not available, a modal will open
     */
    FormEngine.duplicateAction = function (event, callback) {
        callback = callback || FormEngine.duplicateActionCallback;
        const $actionElement = $('<input />').attr('type', 'hidden').attr('name', '_duplicatedoc').attr('value', '1');
        const isNew = ('isNew' in event.target.dataset);
        if (FormEngine.hasChange() || FormEngine.isNew()) {
            FormEngine.showDuplicateModal(isNew, $actionElement, callback);
        }
        else {
            $(selector `form[name="${FormEngine.formName}"]`).append($actionElement);
            FormEngine.formElement.submit();
        }
    };
    /**
     * The callback for the duplicate action
     *
     * @param {string} modalButtonName
     * @param {element} $actionElement
     */
    FormEngine.duplicateActionCallback = function (modalButtonName, $actionElement) {
        const $form = $(selector `form[name="${FormEngine.formName}"]`);
        Modal.dismiss();
        switch (modalButtonName) {
            case 'no':
                $form.append($actionElement);
                FormEngine.formElement.submit();
                break;
            case 'yes':
                $form.append($actionElement);
                FormEngine.saveDocument();
                break;
            default:
                break;
        }
    };
    FormEngine.showDuplicateModal = function (isNew, $actionElement, callback) {
        const title = TYPO3.lang['label.confirm.duplicate_record_changed.title'] || 'Do you want to save before duplicating this record?';
        const content = (TYPO3.lang['label.confirm.duplicate_record_changed.content']
            || 'You currently have unsaved changes. Do you want to save your changes before duplicating this record?');
        let modalButtons = [];
        const modalCancelButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.duplicate_record_changed.cancel'] || 'Cancel',
            btnClass: 'btn-default',
            name: 'cancel'
        };
        const modalDismissDuplicateButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.duplicate_record_changed.no'] || 'No, just duplicate the original',
            btnClass: 'btn-default',
            name: 'no'
        };
        const modalSaveDuplicateButtonConfiguration = {
            text: TYPO3.lang['buttons.confirm.duplicate_record_changed.yes'] || 'Yes, save and duplicate this record',
            btnClass: 'btn-primary',
            name: 'yes',
            active: true
        };
        if (isNew) {
            modalButtons = [
                modalCancelButtonConfiguration,
                modalSaveDuplicateButtonConfiguration
            ];
        }
        else {
            modalButtons = [
                modalCancelButtonConfiguration,
                modalDismissDuplicateButtonConfiguration,
                modalSaveDuplicateButtonConfiguration
            ];
        }
        const modal = Modal.confirm(title, content, Severity.info, modalButtons);
        modal.addEventListener('button.clicked', function (event) {
            callback(event.target.name, $actionElement);
        });
    };
    /**
     * Delete action
     *
     * When there are changes:
     * Will take action based on local storage preset
     * If preset is not available, a modal will open
     */
    FormEngine.deleteAction = function (event, callback) {
        callback = callback || FormEngine.deleteActionCallback;
        const $anchorElement = $(event.target);
        FormEngine.showDeleteModal($anchorElement, callback);
    };
    /**
     * The callback for the delete action
     *
     * @param {string} modalButtonName
     * @param {element} $anchorElement
     */
    FormEngine.deleteActionCallback = function (modalButtonName, $anchorElement) {
        Modal.dismiss();
        if (modalButtonName === 'yes') {
            FormEngine.invokeRecordDeletion($anchorElement);
        }
    };
    /**
     * Show the delete modal
     *
     * @param {element} $anchorElement
     * @param {Function} callback
     */
    FormEngine.showDeleteModal = function ($anchorElement, callback) {
        const title = TYPO3.lang['label.confirm.delete_record.title'] || 'Delete this record?';
        let content = (TYPO3.lang['label.confirm.delete_record.content'] || 'Are you sure you want to delete the record \'%s\'?').replace('%s', $anchorElement.data('record-info'));
        if ($anchorElement.data('reference-count-message')) {
            content += '\n' + $anchorElement.data('reference-count-message');
        }
        if ($anchorElement.data('translation-count-message')) {
            content += '\n' + $anchorElement.data('translation-count-message');
        }
        const modal = Modal.confirm(title, content, Severity.warning, [
            {
                text: TYPO3.lang['buttons.confirm.delete_record.no'] || 'Cancel',
                btnClass: 'btn-default',
                name: 'no'
            },
            {
                text: TYPO3.lang['buttons.confirm.delete_record.yes'] || 'Yes, delete this record',
                btnClass: 'btn-warning',
                name: 'yes',
                active: true
            }
        ]);
        modal.addEventListener('button.clicked', function (event) {
            callback(event.target.name, $anchorElement);
        });
    };
    /**
     * In case the given option is a child of a disabled optGroup, enable the optGroup
     */
    FormEngine.enableOptGroup = function (option) {
        const optGroup = option.parentElement;
        if (optGroup instanceof HTMLOptGroupElement && optGroup.querySelectorAll('option:not([hidden]):not([disabled]):not(.hidden)').length) {
            optGroup.hidden = false;
            optGroup.disabled = false;
            optGroup.classList.remove('hidden');
        }
    };
    /**
     * Close current open document
     */
    FormEngine.closeDocument = function () {
        FormEngine.formElement.closeDoc.value = 1;
        FormEngine.formElement.submit();
    };
    FormEngine.saveDocument = function () {
        const currentlyFocussed = document.activeElement;
        if (currentlyFocussed instanceof HTMLInputElement || currentlyFocussed instanceof HTMLSelectElement || currentlyFocussed instanceof HTMLTextAreaElement) {
            // Blur currently focussed :input element to trigger FormEngine's internal data normalization
            currentlyFocussed.blur();
        }
        const saveField = FormEngine.formElement.querySelector(selector `input[name="${FormEngine.doSaveFieldName}"]`);
        if (saveField !== null) {
            saveField.value = '1';
        }
        FormEngine.formElement.requestSubmit();
    };
    FormEngine.saveAndCloseDocument = function () {
        const saveAndCloseInput = document.createElement('input');
        saveAndCloseInput.type = 'hidden';
        saveAndCloseInput.name = '_saveandclosedok';
        saveAndCloseInput.value = '1';
        document.querySelector(selector `form[name="${FormEngine.formName}"]`).append(saveAndCloseInput);
        FormEngine.saveDocument();
    };
    /**
     * Main init function called from outside
     *
     * Sets some options and registers the DOMready handler to initialize further things
     *
     * @param {String} browserUrl
     * @param {String} doSaveFieldName
     */
    FormEngine.initialize = function (browserUrl, doSaveFieldName) {
        FormEngine.browserUrl = browserUrl;
        // Add doSaveFieldName - fall back to to `doSave` for b/w compatibility
        FormEngine.doSaveFieldName = doSaveFieldName || 'doSave';
        DocumentService.ready().then(() => {
            FormEngine.initializeEvents();
            FormEngine.Validation.initialize(this);
            FormEngine.reinitialize();
            $('#t3js-ui-block').remove();
            Hotkeys.setScope('backend/form-engine');
            Hotkeys.register([Hotkeys.normalizedCtrlModifierKey, 's'], (e) => {
                e.preventDefault();
                FormEngine.saveDocument();
            }, { scope: 'backend/form-engine', allowOnEditables: true, bindElement: FormEngine.formElement._savedok });
            Hotkeys.register([Hotkeys.normalizedCtrlModifierKey, ModifierKeys.SHIFT, 's'], (e) => {
                e.preventDefault();
                FormEngine.saveAndCloseDocument();
            }, { scope: 'backend/form-engine', allowOnEditables: true });
        });
    };
    FormEngine.invokeRecordDeletion = function ($anchorElement) {
        window.location.href = $anchorElement.attr('href');
    };
    // make the form engine object publicly visible for other objects in the TYPO3 namespace
    TYPO3.FormEngine = FormEngine;
    // return the object in the global space
    return FormEngine;
})();
