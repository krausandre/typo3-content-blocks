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
import { MessageUtility } from '../../utility/message-utility';
import { AjaxDispatcher } from './../inline-relation/ajax-dispatcher';
import DocumentService from '@typo3/core/document-service';
import NProgress from 'nprogress';
import Sortable from 'sortablejs';
import FormEngine from '@typo3/backend/form-engine';
import FormEngineValidation from '@typo3/backend/form-engine-validation';
import Icons from '../../icons';
import InfoWindow from '../../info-window';
import Modal from '../../modal';
import Notification from '../../notification';
import RegularEvent from '@typo3/core/event/regular-event';
import Severity from '../../severity';
import Utility from '../../utility';
import { selector } from '@typo3/core/literals';
var Selectors;
(function (Selectors) {
    Selectors["toggleSelector"] = "[data-bs-toggle=\"formengine-inline\"]";
    Selectors["controlSectionSelector"] = ".t3js-formengine-irre-control";
    Selectors["createNewRecordButtonSelector"] = ".t3js-create-new-button";
    Selectors["createNewRecordBySelectorSelector"] = ".t3js-create-new-selector";
    Selectors["deleteRecordButtonSelector"] = ".t3js-editform-delete-inline-record";
    Selectors["enableDisableRecordButtonSelector"] = ".t3js-toggle-visibility-button";
    Selectors["infoWindowButton"] = "[data-action=\"infowindow\"]";
    Selectors["synchronizeLocalizeRecordButtonSelector"] = ".t3js-synchronizelocalize-button";
    Selectors["uniqueValueSelectors"] = "select.t3js-inline-unique";
    Selectors["revertUniqueness"] = ".t3js-revert-unique";
    Selectors["controlContainer"] = ".t3js-inline-controls";
})(Selectors || (Selectors = {}));
var States;
(function (States) {
    States["new"] = "inlineIsNewRecord";
    States["visible"] = "panel-visible";
    States["collapsed"] = "panel-collapsed";
    States["notLoaded"] = "t3js-not-loaded";
})(States || (States = {}));
var Separators;
(function (Separators) {
    Separators["structureSeparator"] = "-";
})(Separators || (Separators = {}));
var SortDirections;
(function (SortDirections) {
    SortDirections["DOWN"] = "down";
    SortDirections["UP"] = "up";
})(SortDirections || (SortDirections = {}));
class InlineControlContainer {
    /**
     * @param {string} elementId
     */
    constructor(elementId) {
        this.container = null;
        this.ajaxDispatcher = null;
        this.appearance = null;
        this.requestQueue = {};
        this.progressQueue = {};
        this.noTitleString = (TYPO3.lang ? TYPO3.lang['FormEngine.noRecordTitle'] : '[No title]');
        /**
         * @param {MessageEvent} e
         */
        this.handlePostMessage = (e) => {
            if (!MessageUtility.verifyOrigin(e.origin)) {
                throw 'Denied message sent by ' + e.origin;
            }
            if (e.data.actionName === 'typo3:foreignRelation:insert') {
                if (typeof e.data.objectGroup === 'undefined') {
                    throw 'No object group defined for message';
                }
                if (e.data.objectGroup !== this.container.dataset.objectGroup) {
                    // Received message isn't provisioned for current InlineControlContainer instance
                    return;
                }
                if (this.isUniqueElementUsed(parseInt(e.data.uid, 10), e.data.table)) {
                    Notification.error('There is already a relation to the selected element');
                    return;
                }
                this.importRecord([e.data.objectGroup, e.data.uid]).then(() => {
                    if (e.source) {
                        const message = {
                            actionName: 'typo3:foreignRelation:inserted',
                            objectGroup: e.data.objectId,
                            table: e.data.table,
                            uid: e.data.uid,
                        };
                        MessageUtility.send(message, e.source);
                    }
                });
            }
            if (e.data.actionName === 'typo3:foreignRelation:delete') {
                if (e.data.objectGroup !== this.container.dataset.objectGroup) {
                    // Received message isn't provisioned for current FilesContainer instance
                    return;
                }
                const forceDirectRemoval = e.data.directRemoval || false;
                const objectId = [e.data.objectGroup, e.data.uid].join('-');
                this.deleteRecord(objectId, forceDirectRemoval);
            }
        };
        DocumentService.ready().then((document) => {
            this.container = document.getElementById(elementId);
            this.ajaxDispatcher = new AjaxDispatcher(this.container.dataset.objectGroup);
            this.registerEvents();
        });
    }
    /**
     * @param {string} objectId
     * @return HTMLDivElement
     */
    static getInlineRecordContainer(objectId) {
        return document.querySelector(selector `[data-object-id="${objectId}"]`);
    }
    /**
     * @param {string} objectId
     * @return HTMLButtonElement
     */
    static getCollapseButton(objectId) {
        return document.querySelector(selector `[aria-controls="${objectId}_fields"]`);
    }
    /**
     * @param {string} objectId
     */
    static toggleElement(objectId) {
        const recordContainer = InlineControlContainer.getInlineRecordContainer(objectId);
        if (recordContainer.classList.contains(States.collapsed)) {
            InlineControlContainer.expandElement(recordContainer, objectId);
        }
        else {
            InlineControlContainer.collapseElement(recordContainer, objectId);
        }
    }
    /**
     * @param {HTMLDivElement} recordContainer
     * @param {string} objectId
     */
    static collapseElement(recordContainer, objectId) {
        const collapseButton = InlineControlContainer.getCollapseButton(objectId);
        recordContainer.classList.remove(States.visible);
        recordContainer.classList.add(States.collapsed);
        collapseButton.setAttribute('aria-expanded', 'false');
    }
    /**
     * @param {HTMLDivElement} recordContainer
     * @param {string} objectId
     */
    static expandElement(recordContainer, objectId) {
        const collapseButton = InlineControlContainer.getCollapseButton(objectId);
        recordContainer.classList.remove(States.collapsed);
        recordContainer.classList.add(States.visible);
        collapseButton.setAttribute('aria-expanded', 'true');
    }
    /**
     * @param {string} objectId
     * @return boolean
     */
    static isNewRecord(objectId) {
        const recordContainer = InlineControlContainer.getInlineRecordContainer(objectId);
        return recordContainer.classList.contains(States.new);
    }
    /**
     * @param {string} objectId
     * @param {boolean} value
     */
    static updateExpandedCollapsedStateLocally(objectId, value) {
        const recordContainer = InlineControlContainer.getInlineRecordContainer(objectId);
        const ucName = 'uc[inlineView]'
            + '[' + recordContainer.dataset.topmostParentTable + ']'
            + '[' + recordContainer.dataset.topmostParentUid + ']'
            + recordContainer.dataset.fieldName;
        const ucFormObj = document.getElementsByName(ucName);
        if (ucFormObj.length) {
            ucFormObj[0].value = value ? '1' : '0';
        }
    }
    /**
     * @param {UniqueDefinitionCollection} hashmap
     */
    static getValuesFromHashMap(hashmap) {
        return Object.keys(hashmap).map((key) => hashmap[key]);
    }
    static selectOptionValueExists(selectElement, value) {
        return selectElement.querySelector(selector `option[value="${value}"]`) !== null;
    }
    /**
     * @param {HTMLSelectElement} selectElement
     * @param {string} value
     */
    static removeSelectOptionByValue(selectElement, value) {
        const option = selectElement.querySelector(selector `option[value="${value}"]`);
        if (option !== null) {
            option.remove();
        }
    }
    /**
     * @param {HTMLSelectElement} selectElement
     * @param {string} value
     * @param {UniqueDefinition} unique
     */
    static reAddSelectOption(selectElement, value, unique) {
        if (InlineControlContainer.selectOptionValueExists(selectElement, value)) {
            return;
        }
        const options = selectElement.querySelectorAll('option');
        let index = -1;
        for (const possibleValue of Object.keys(unique.possible)) {
            if (possibleValue === value) {
                break;
            }
            for (let k = 0; k < options.length; ++k) {
                const option = options[k];
                if (option.value === possibleValue) {
                    index = k;
                    break;
                }
            }
        }
        if (index === -1) {
            index = 0;
        }
        else if (index < options.length) {
            index++;
        }
        // recreate the <option> tag
        const readdOption = document.createElement('option');
        readdOption.text = unique.possible[value];
        readdOption.value = value;
        // add the <option> at the right position
        selectElement.insertBefore(readdOption, selectElement.options[index]);
    }
    registerEvents() {
        this.registerInfoButton();
        this.registerSort();
        this.registerCreateRecordButton();
        this.registerEnableDisableButton();
        this.registerDeleteButton();
        this.registerSynchronizeLocalize();
        this.registerRevertUniquenessAction();
        this.registerToggle();
        this.registerCreateRecordBySelector();
        this.registerUniqueSelectFieldChanged();
        new RegularEvent('message', this.handlePostMessage).bindTo(window);
        if (this.getAppearance().useSortable) {
            const recordListContainer = document.getElementById(this.container.getAttribute('id') + '_records');
            // tslint:disable-next-line:no-unused-expression
            new Sortable(recordListContainer, {
                group: recordListContainer.getAttribute('id'),
                handle: '.sortableHandle',
                onSort: () => {
                    this.updateSorting();
                },
            });
        }
    }
    registerToggle() {
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.loadRecordDetails(targetElement.closest(Selectors.toggleSelector).parentElement.dataset.objectId);
        }).delegateTo(this.container, `${Selectors.toggleSelector} .form-irre-header-cell:not(${Selectors.controlSectionSelector}`);
    }
    registerSort() {
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.changeSortingByButton(targetElement.closest('[data-object-id]').dataset.objectId, targetElement.dataset.direction);
        }).delegateTo(this.container, Selectors.controlSectionSelector + ' [data-action="sort"]');
    }
    registerCreateRecordButton() {
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (this.isBelowMax()) {
                let objectId = this.container.dataset.objectGroup;
                if (typeof targetElement.dataset.recordUid !== 'undefined') {
                    objectId += Separators.structureSeparator + targetElement.dataset.recordUid;
                }
                this.importRecord([objectId, this.container.querySelector(Selectors.createNewRecordBySelectorSelector)?.value], targetElement.dataset.recordUid ?? null);
            }
        }).delegateTo(this.container, Selectors.createNewRecordButtonSelector);
    }
    registerCreateRecordBySelector() {
        new RegularEvent('change', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const selectTarget = targetElement;
            const recordUid = selectTarget.options[selectTarget.selectedIndex].getAttribute('value');
            this.importRecord([this.container.dataset.objectGroup, recordUid]);
        }).delegateTo(this.container, Selectors.createNewRecordBySelectorSelector);
    }
    /**
     * @param {string} uid
     * @param {string} markup
     * @param {string} afterUid
     * @param {string} selectedValue
     */
    createRecord(uid, markup, afterUid = null, selectedValue = null) {
        let objectId = this.container.dataset.objectGroup;
        if (afterUid !== null) {
            objectId += Separators.structureSeparator + afterUid;
        }
        if (afterUid !== null) {
            InlineControlContainer.getInlineRecordContainer(objectId).insertAdjacentHTML('afterend', markup);
            this.memorizeAddRecord(uid, afterUid, selectedValue);
        }
        else {
            document.getElementById(this.container.getAttribute('id') + '_records').insertAdjacentHTML('beforeend', markup);
            this.memorizeAddRecord(uid, null, selectedValue);
        }
    }
    /**
     * @param {Array} params
     * @param {string} afterUid
     */
    async importRecord(params, afterUid) {
        return this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('record_inline_create')), params).then(async (response) => {
            if (this.isBelowMax()) {
                this.createRecord(response.compilerInput.uid, response.data, typeof afterUid !== 'undefined' ? afterUid : null, typeof response.compilerInput.childChildUid !== 'undefined' ? response.compilerInput.childChildUid : null);
            }
        });
    }
    registerEnableDisableButton() {
        new RegularEvent('click', (e, target) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const objectId = target.closest('[data-object-id]').dataset.objectId;
            const recordContainer = InlineControlContainer.getInlineRecordContainer(objectId);
            const hiddenFieldName = selector `data${recordContainer.dataset.fieldName}[${target.dataset.hiddenField}]`;
            const hiddenValueCheckBox = document.querySelector('[data-formengine-input-name="' + hiddenFieldName + '"');
            const hiddenValueInput = document.querySelector('[name="' + hiddenFieldName + '"');
            if (hiddenValueCheckBox !== null && hiddenValueInput !== null) {
                hiddenValueCheckBox.checked = !hiddenValueCheckBox.checked;
                hiddenValueInput.value = hiddenValueCheckBox.checked ? '1' : '0';
                FormEngineValidation.markFieldAsChanged(hiddenValueCheckBox);
            }
            const hiddenClass = 't3-form-field-container-inline-hidden';
            const isHidden = recordContainer.classList.contains(hiddenClass);
            let toggleIcon;
            if (isHidden) {
                toggleIcon = 'actions-edit-hide';
                recordContainer.classList.remove(hiddenClass);
            }
            else {
                toggleIcon = 'actions-edit-unhide';
                recordContainer.classList.add(hiddenClass);
            }
            Icons.getIcon(toggleIcon, Icons.sizes.small).then((markup) => {
                target.replaceChild(document.createRange().createContextualFragment(markup), target.querySelector('.t3js-icon'));
            });
        }).delegateTo(this.container, Selectors.enableDisableRecordButtonSelector);
    }
    registerInfoButton() {
        new RegularEvent('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            InfoWindow.showItem(this.dataset.infoTable, this.dataset.infoUid);
        }).delegateTo(this.container, Selectors.infoWindowButton);
    }
    registerDeleteButton() {
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const title = TYPO3.lang['label.confirm.delete_record.title'] || 'Delete this record?';
            const content = (TYPO3.lang['label.confirm.delete_record.content'] || 'Are you sure you want to delete the record \'%s\'?').replace('%s', targetElement.dataset.recordInfo);
            const modal = Modal.confirm(title, content, Severity.warning, [
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.no'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'no',
                },
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.yes'] || 'Yes, delete this record',
                    btnClass: 'btn-warning',
                    name: 'yes',
                },
            ]);
            modal.addEventListener('button.clicked', (modalEvent) => {
                if (modalEvent.target.name === 'yes') {
                    const objectId = targetElement.closest('[data-object-id]').dataset.objectId;
                    this.deleteRecord(objectId);
                }
                modal.hideModal();
            });
        }).delegateTo(this.container, Selectors.deleteRecordButtonSelector);
    }
    /**
     * @param {Event} e
     */
    registerSynchronizeLocalize() {
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('record_inline_synchronizelocalize')), [this.container.dataset.objectGroup, targetElement.dataset.type]).then(async (response) => {
                document.getElementById(this.container.getAttribute('id') + '_records').insertAdjacentHTML('beforeend', response.data);
                const objectIdPrefix = this.container.dataset.objectGroup + Separators.structureSeparator;
                for (const itemUid of response.compilerInput.delete) {
                    this.deleteRecord(objectIdPrefix + itemUid, true);
                }
                for (const item of Object.values(response.compilerInput.localize)) {
                    if (typeof item.remove !== 'undefined') {
                        const removableRecordContainer = InlineControlContainer.getInlineRecordContainer(objectIdPrefix + item.remove);
                        removableRecordContainer.parentElement.removeChild(removableRecordContainer);
                    }
                    this.memorizeAddRecord(item.uid, null, item.selectedValue);
                }
            });
        }).delegateTo(this.container, Selectors.synchronizeLocalizeRecordButtonSelector);
    }
    registerUniqueSelectFieldChanged() {
        new RegularEvent('change', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const recordContainer = targetElement.closest('[data-object-id]');
            if (recordContainer !== null) {
                const objectId = recordContainer.dataset.objectId;
                const objectUid = recordContainer.dataset.objectUid;
                this.handleChangedField(targetElement, objectId);
                const formField = this.getFormFieldForElements();
                if (formField === null) {
                    return;
                }
                this.updateUnique(targetElement, formField, objectUid);
            }
        }).delegateTo(this.container, Selectors.uniqueValueSelectors);
    }
    registerRevertUniquenessAction() {
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.revertUnique(targetElement.dataset.uid);
        }).delegateTo(this.container, Selectors.revertUniqueness);
    }
    /**
     * @param {string} objectId
     */
    loadRecordDetails(objectId) {
        const recordFieldsContainer = document.getElementById(objectId + '_fields');
        const recordContainer = InlineControlContainer.getInlineRecordContainer(objectId);
        const isLoading = typeof this.requestQueue[objectId] !== 'undefined';
        const isLoaded = recordFieldsContainer !== null && !recordContainer.classList.contains(States.notLoaded);
        if (!isLoaded) {
            const progress = this.getProgress(objectId, recordContainer.dataset.objectIdHash);
            if (!isLoading) {
                const ajaxRequest = this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('record_inline_details'));
                const request = this.ajaxDispatcher.send(ajaxRequest, [objectId]);
                request.then(async (response) => {
                    delete this.requestQueue[objectId];
                    delete this.progressQueue[objectId];
                    recordContainer.classList.remove(States.notLoaded);
                    recordFieldsContainer.innerHTML = response.data;
                    this.collapseExpandRecord(objectId);
                    progress.done();
                    FormEngine.reinitialize();
                    FormEngineValidation.initializeInputFields();
                    FormEngineValidation.validate(this.container);
                    if (this.hasObjectGroupDefinedUniqueConstraints()) {
                        const recordContainer = InlineControlContainer.getInlineRecordContainer(objectId);
                        this.removeUsed(recordContainer);
                    }
                });
                this.requestQueue[objectId] = ajaxRequest;
                progress.start();
            }
            else {
                // Abort loading if collapsed again
                this.requestQueue[objectId].abort();
                delete this.requestQueue[objectId];
                delete this.progressQueue[objectId];
                progress.done();
            }
            return;
        }
        this.collapseExpandRecord(objectId);
    }
    /**
     * Collapses or expands a record and stores the state either in a form field or directly in backend user's UC, depending
     * on whether the record is new or already existing.
     *
     * @param {String} objectId
     */
    collapseExpandRecord(objectId) {
        const recordElement = InlineControlContainer.getInlineRecordContainer(objectId);
        const expandSingle = this.getAppearance().expandSingle === true;
        const isCollapsed = recordElement.classList.contains(States.collapsed);
        let collapse = [];
        const expand = [];
        if (expandSingle && isCollapsed) {
            collapse = this.collapseAllRecords(recordElement.dataset.objectUid);
        }
        InlineControlContainer.toggleElement(objectId);
        if (InlineControlContainer.isNewRecord(objectId)) {
            InlineControlContainer.updateExpandedCollapsedStateLocally(objectId, isCollapsed);
        }
        else if (isCollapsed) {
            expand.push(recordElement.dataset.objectUid);
        }
        else if (!isCollapsed) {
            collapse.push(recordElement.dataset.objectUid);
        }
        this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('record_inline_expandcollapse')), [objectId, expand.join(','), collapse.join(',')]);
    }
    /**
     * @param {string} newUid
     * @param {string} afterUid
     * @param {string} selectedValue
     */
    memorizeAddRecord(newUid, afterUid = null, selectedValue = null) {
        const formField = this.getFormFieldForElements();
        if (formField === null) {
            return;
        }
        let records = Utility.trimExplode(',', formField.value);
        if (afterUid) {
            const newRecords = [];
            for (let i = 0; i < records.length; i++) {
                if (records[i].length) {
                    newRecords.push(records[i]);
                }
                if (afterUid === records[i]) {
                    newRecords.push(newUid);
                }
            }
            records = newRecords;
        }
        else {
            records.push(newUid);
        }
        formField.value = records.join(',');
        FormEngineValidation.markFieldAsChanged(formField);
        document.dispatchEvent(new Event('change'));
        this.redrawSortingButtons(this.container.dataset.objectGroup, records);
        this.setUnique(newUid, selectedValue);
        if (!this.isBelowMax()) {
            this.toggleContainerControls(false);
        }
        FormEngine.reinitialize();
        FormEngineValidation.initializeInputFields();
        FormEngineValidation.validate(this.container);
    }
    /**
     * @param {String} objectUid
     * @return Array<string>
     */
    memorizeRemoveRecord(objectUid) {
        const formField = this.getFormFieldForElements();
        if (formField === null) {
            return [];
        }
        const records = Utility.trimExplode(',', formField.value);
        const indexOfRemoveUid = records.indexOf(objectUid);
        if (indexOfRemoveUid > -1) {
            records.splice(indexOfRemoveUid, 1);
            formField.value = records.join(',');
            FormEngineValidation.markFieldAsChanged(formField);
            document.dispatchEvent(new Event('change'));
            this.redrawSortingButtons(this.container.dataset.objectGroup, records);
        }
        return records;
    }
    /**
     * @param {string} objectId
     * @param {SortDirections} direction
     */
    changeSortingByButton(objectId, direction) {
        const currentRecordContainer = InlineControlContainer.getInlineRecordContainer(objectId);
        const recordUid = currentRecordContainer.dataset.objectUid;
        const recordListContainer = document.getElementById(this.container.getAttribute('id') + '_records');
        const records = Array.from(recordListContainer.children).map((child) => child.dataset.objectUid);
        const position = records.indexOf(recordUid);
        let isChanged = false;
        if (direction === SortDirections.UP && position > 0) {
            records[position] = records[position - 1];
            records[position - 1] = recordUid;
            isChanged = true;
        }
        else if (direction === SortDirections.DOWN && position < records.length - 1) {
            records[position] = records[position + 1];
            records[position + 1] = recordUid;
            isChanged = true;
        }
        if (isChanged) {
            const objectIdPrefix = this.container.dataset.objectGroup + Separators.structureSeparator;
            const adjustment = direction === SortDirections.UP ? 1 : 0;
            currentRecordContainer.parentElement.insertBefore(InlineControlContainer.getInlineRecordContainer(objectIdPrefix + records[position - adjustment]), InlineControlContainer.getInlineRecordContainer(objectIdPrefix + records[position + 1 - adjustment]));
            this.updateSorting();
        }
    }
    updateSorting() {
        const formField = this.getFormFieldForElements();
        if (formField === null) {
            return;
        }
        const recordListContainer = document.getElementById(this.container.getAttribute('id') + '_records');
        const records = Array.from(recordListContainer.querySelectorAll(selector `[data-object-parent-group="${this.container.dataset.objectGroup}"][data-placeholder-record="0"]`))
            .map((child) => child.dataset.objectUid);
        formField.value = records.join(',');
        FormEngineValidation.markFieldAsChanged(formField);
        document.dispatchEvent(new Event('inline:sorting-changed'));
        document.dispatchEvent(new Event('change'));
        this.redrawSortingButtons(this.container.dataset.objectGroup, records);
    }
    /**
     * @param {String} objectId
     * @param {Boolean} forceDirectRemoval
     */
    deleteRecord(objectId, forceDirectRemoval = false) {
        const recordContainer = InlineControlContainer.getInlineRecordContainer(objectId);
        const objectUid = recordContainer.dataset.objectUid;
        recordContainer.classList.add('t3js-inline-record-deleted');
        if (!InlineControlContainer.isNewRecord(objectId) && !forceDirectRemoval) {
            const deleteCommandInput = this.container.querySelector(selector `[name="cmd${recordContainer.dataset.fieldName}[delete]"]`);
            deleteCommandInput.removeAttribute('disabled');
            // Move input field to inline container so we can remove the record container
            recordContainer.parentElement.insertAdjacentElement('afterbegin', deleteCommandInput);
        }
        new RegularEvent('transitionend', () => {
            recordContainer.remove();
            FormEngineValidation.validate(this.container);
        }).bindTo(recordContainer);
        this.revertUnique(objectUid);
        this.memorizeRemoveRecord(objectUid);
        recordContainer.classList.add('form-irre-object--deleted');
        if (this.isBelowMax()) {
            this.toggleContainerControls(true);
        }
    }
    /**
     * @param {boolean} visible
     */
    toggleContainerControls(visible) {
        const controlContainer = this.container.querySelectorAll(':scope > ' + Selectors.controlContainer);
        controlContainer.forEach((container) => {
            const controlContainerButtons = container.querySelectorAll('button, a');
            controlContainerButtons.forEach((button) => {
                button.style.display = visible ? null : 'none';
            });
        });
    }
    /**
     * @param {string} objectId
     * @param {string} objectIdHash
     */
    getProgress(objectId, objectIdHash) {
        const headerIdentifier = '#' + objectIdHash + '_header';
        let progress;
        if (typeof this.progressQueue[objectId] !== 'undefined') {
            progress = this.progressQueue[objectId];
        }
        else {
            progress = NProgress;
            progress.configure({ parent: headerIdentifier, showSpinner: false });
            this.progressQueue[objectId] = progress;
        }
        return progress;
    }
    /**
     * @param {string} excludeUid
     */
    collapseAllRecords(excludeUid) {
        const formField = this.getFormFieldForElements();
        const collapse = [];
        if (formField !== null) {
            const records = Utility.trimExplode(',', formField.value);
            for (const recordUid of records) {
                if (recordUid === excludeUid) {
                    continue;
                }
                const recordObjectId = this.container.dataset.objectGroup + Separators.structureSeparator + recordUid;
                const recordContainer = InlineControlContainer.getInlineRecordContainer(recordObjectId);
                if (recordContainer.classList.contains(States.visible)) {
                    InlineControlContainer.collapseElement(recordContainer, recordObjectId);
                    if (InlineControlContainer.isNewRecord(recordObjectId)) {
                        InlineControlContainer.updateExpandedCollapsedStateLocally(recordObjectId, false);
                    }
                    else {
                        collapse.push(recordUid);
                    }
                }
            }
        }
        return collapse;
    }
    /**
     * @return HTMLInputElement | void
     */
    getFormFieldForElements() {
        const formFields = document.getElementsByName(this.container.dataset.formField);
        if (formFields.length > 0) {
            return formFields[0];
        }
        return null;
    }
    /**
     * Redraws rhe sorting buttons of each record
     *
     * @param {string} objectId
     * @param {Array<string>} records
     */
    redrawSortingButtons(objectId, records = []) {
        if (records.length === 0) {
            const formField = this.getFormFieldForElements();
            if (formField !== null) {
                records = Utility.trimExplode(',', formField.value);
            }
        }
        if (records.length === 0) {
            return;
        }
        records.forEach((recordUid, index) => {
            const recordContainer = InlineControlContainer.getInlineRecordContainer(objectId + Separators.structureSeparator + recordUid);
            const headerIdentifier = recordContainer.dataset.objectIdHash + '_header';
            const headerElement = document.getElementById(headerIdentifier);
            const sortUp = headerElement.querySelector(selector `[data-action="sort"][data-direction="${SortDirections.UP}"]`);
            if (sortUp !== null) {
                let iconIdentifier = 'actions-move-up';
                if (index === 0) {
                    sortUp.classList.add('disabled');
                    iconIdentifier = 'empty-empty';
                }
                else {
                    sortUp.classList.remove('disabled');
                }
                Icons.getIcon(iconIdentifier, Icons.sizes.small).then((markup) => {
                    sortUp.replaceChild(document.createRange().createContextualFragment(markup), sortUp.querySelector('.t3js-icon'));
                });
            }
            const sortDown = headerElement.querySelector(selector `[data-action="sort"][data-direction="${SortDirections.DOWN}"]`);
            if (sortDown !== null) {
                let iconIdentifier = 'actions-move-down';
                if (index === records.length - 1) {
                    sortDown.classList.add('disabled');
                    iconIdentifier = 'empty-empty';
                }
                else {
                    sortDown.classList.remove('disabled');
                }
                Icons.getIcon(iconIdentifier, Icons.sizes.small).then((markup) => {
                    sortDown.replaceChild(document.createRange().createContextualFragment(markup), sortDown.querySelector('.t3js-icon'));
                });
            }
        });
    }
    /**
     * @return {boolean}
     */
    isBelowMax() {
        const formField = this.getFormFieldForElements();
        if (formField === null) {
            return true;
        }
        if (typeof TYPO3.settings.FormEngineInline.config[this.container.dataset.objectGroup] !== 'undefined') {
            const records = Utility.trimExplode(',', formField.value);
            if (records.length >= TYPO3.settings.FormEngineInline.config[this.container.dataset.objectGroup].max) {
                return false;
            }
            if (this.hasObjectGroupDefinedUniqueConstraints()) {
                const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
                if (unique.used.length >= unique.max && unique.max >= 0) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * @param {number} uid
     * @param {string} table
     */
    isUniqueElementUsed(uid, table) {
        if (!this.hasObjectGroupDefinedUniqueConstraints()) {
            return false;
        }
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        const values = InlineControlContainer.getValuesFromHashMap(unique.used);
        if (unique.type === 'select' && values.indexOf(uid) !== -1) {
            return true;
        }
        if (unique.type === 'groupdb') {
            for (let i = values.length - 1; i >= 0; i--) {
                // if the pair table:uid is already used:
                if (values[i].table === table && values[i].uid === uid) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {HTMLDivElement} recordContainer
     */
    removeUsed(recordContainer) {
        if (!this.hasObjectGroupDefinedUniqueConstraints()) {
            return;
        }
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        if (unique.type !== 'select') {
            return;
        }
        const uniqueValueField = recordContainer.querySelector('[name="data[' + unique.table + '][' + recordContainer.dataset.objectUid + '][' + unique.field + ']"]');
        const values = InlineControlContainer.getValuesFromHashMap(unique.used);
        if (uniqueValueField !== null) {
            const selectedValue = uniqueValueField.options[uniqueValueField.selectedIndex].value;
            for (const value of values) {
                if (value !== selectedValue) {
                    InlineControlContainer.removeSelectOptionByValue(uniqueValueField, value);
                }
            }
        }
    }
    /**
     * @param {string} recordUid
     * @param {string} selectedValue
     */
    setUnique(recordUid, selectedValue) {
        if (!this.hasObjectGroupDefinedUniqueConstraints()) {
            return;
        }
        const selectorElement = document.getElementById(this.container.dataset.objectGroup + '_selector');
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        if (unique.type === 'select') {
            if (!(unique.selector && unique.max === -1)) {
                const formField = this.getFormFieldForElements();
                const recordObjectId = this.container.dataset.objectGroup + Separators.structureSeparator + recordUid;
                const recordContainer = InlineControlContainer.getInlineRecordContainer(recordObjectId);
                let uniqueValueField = recordContainer.querySelector('[name="data[' + unique.table + '][' + recordUid + '][' + unique.field + ']"]');
                const values = InlineControlContainer.getValuesFromHashMap(unique.used);
                if (selectorElement !== null) {
                    // remove all items from the new select-item which are already used in other children
                    if (uniqueValueField !== null) {
                        for (const value of values) {
                            InlineControlContainer.removeSelectOptionByValue(uniqueValueField, value);
                        }
                        // set the selected item automatically to the first of the remaining items if no selector is used
                        if (!unique.selector) {
                            selectedValue = uniqueValueField.options[0].value;
                            uniqueValueField.options[0].selected = true;
                            this.updateUnique(uniqueValueField, formField, recordUid);
                            this.handleChangedField(uniqueValueField, this.container.dataset.objectGroup + '[' + recordUid + ']');
                        }
                    }
                    for (const value of values) {
                        InlineControlContainer.removeSelectOptionByValue(uniqueValueField, value);
                    }
                    if (typeof unique.used.length !== 'undefined') {
                        unique.used = {};
                    }
                    unique.used[recordUid] = {
                        table: unique.elTable,
                        uid: selectedValue,
                    };
                }
                // remove the newly used item from each select-field of the child records
                if (formField !== null && InlineControlContainer.selectOptionValueExists(selectorElement, selectedValue)) {
                    const records = Utility.trimExplode(',', formField.value);
                    for (const record of records) {
                        uniqueValueField = document.querySelector('[name="data[' + unique.table + '][' + record + '][' + unique.field + ']"]');
                        if (uniqueValueField !== null && record !== recordUid) {
                            InlineControlContainer.removeSelectOptionByValue(uniqueValueField, selectedValue);
                        }
                    }
                }
            }
        }
        else if (unique.type === 'groupdb') {
            // add the new record to the used items:
            unique.used[recordUid] = {
                table: unique.elTable,
                uid: selectedValue,
            };
        }
        // remove used items from a selector-box
        if (unique.selector === 'select' && InlineControlContainer.selectOptionValueExists(selectorElement, selectedValue)) {
            InlineControlContainer.removeSelectOptionByValue(selectorElement, selectedValue);
            unique.used[recordUid] = {
                table: unique.elTable,
                uid: selectedValue,
            };
        }
    }
    /**
     * @param {HTMLSelectElement} srcElement
     * @param {HTMLInputElement} formField
     * @param {string} recordUid
     */
    updateUnique(srcElement, formField, recordUid) {
        if (!this.hasObjectGroupDefinedUniqueConstraints()) {
            return;
        }
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        const oldValue = unique.used[recordUid];
        if (unique.selector === 'select') {
            const selectorElement = document.getElementById(this.container.dataset.objectGroup + '_selector');
            InlineControlContainer.removeSelectOptionByValue(selectorElement, srcElement.value);
            if (typeof oldValue !== 'undefined') {
                InlineControlContainer.reAddSelectOption(selectorElement, oldValue, unique);
            }
        }
        if (unique.selector && unique.max === -1) {
            return;
        }
        if (!unique || formField === null) {
            return;
        }
        const records = Utility.trimExplode(',', formField.value);
        let uniqueValueField;
        for (const record of records) {
            uniqueValueField = document.querySelector('[name="data[' + unique.table + '][' + record + '][' + unique.field + ']"]');
            if (uniqueValueField !== null && uniqueValueField !== srcElement) {
                InlineControlContainer.removeSelectOptionByValue(uniqueValueField, srcElement.value);
                if (typeof oldValue !== 'undefined') {
                    InlineControlContainer.reAddSelectOption(uniqueValueField, oldValue, unique);
                }
            }
        }
        unique.used[recordUid] = srcElement.value;
    }
    /**
     * @param {string} recordUid
     */
    revertUnique(recordUid) {
        if (!this.hasObjectGroupDefinedUniqueConstraints()) {
            return;
        }
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        const recordObjectId = this.container.dataset.objectGroup + Separators.structureSeparator + recordUid;
        const recordContainer = InlineControlContainer.getInlineRecordContainer(recordObjectId);
        const uniqueValueField = recordContainer.querySelector('[name="data[' + unique.table + '][' + recordContainer.dataset.objectUid + '][' + unique.field + ']"]');
        if (unique.type === 'select') {
            let uniqueValue;
            if (uniqueValueField !== null) {
                uniqueValue = uniqueValueField.value;
            }
            else if (recordContainer.dataset.tableUniqueOriginalValue !== '') {
                uniqueValue = recordContainer.dataset.tableUniqueOriginalValue;
            }
            else {
                return;
            }
            if (unique.selector === 'select') {
                if (!isNaN(parseInt(uniqueValue, 10))) {
                    const selectorElement = document.getElementById(this.container.dataset.objectGroup + '_selector');
                    InlineControlContainer.reAddSelectOption(selectorElement, uniqueValue, unique);
                }
            }
            if (unique.selector && unique.max === -1) {
                return;
            }
            const formField = this.getFormFieldForElements();
            if (formField === null) {
                return;
            }
            const records = Utility.trimExplode(',', formField.value);
            let recordObj;
            // walk through all inline records on that level and get the select field
            for (let i = 0; i < records.length; i++) {
                recordObj = document.querySelector('[name="data[' + unique.table + '][' + records[i] + '][' + unique.field + ']"]');
                if (recordObj !== null) {
                    InlineControlContainer.reAddSelectOption(recordObj, uniqueValue, unique);
                }
            }
            delete unique.used[recordUid];
        }
        else if (unique.type === 'groupdb') {
            delete unique.used[recordUid];
        }
    }
    /**
     * @return {boolean}
     */
    hasObjectGroupDefinedUniqueConstraints() {
        return typeof TYPO3.settings.FormEngineInline.unique !== 'undefined'
            && typeof TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup] !== 'undefined';
    }
    /**
     * @param {HTMLInputElement | HTMLSelectElement} formField
     * @param {string} objectId
     */
    handleChangedField(formField, objectId) {
        let value;
        if (formField instanceof HTMLSelectElement) {
            value = formField.options[formField.selectedIndex].text;
        }
        else {
            value = formField.value;
        }
        document.getElementById(objectId + '_label').textContent = value.length ? value : this.noTitleString;
    }
    /**
     * @return {Object}
     */
    getAppearance() {
        if (this.appearance === null) {
            this.appearance = {};
            if (typeof this.container.dataset.appearance === 'string') {
                try {
                    this.appearance = JSON.parse(this.container.dataset.appearance);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        return this.appearance;
    }
}
export default InlineControlContainer;
