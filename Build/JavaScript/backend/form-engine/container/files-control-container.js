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
import NProgress from 'nprogress';
import Sortable from 'sortablejs';
import FormEngine from '@typo3/backend/form-engine';
import FormEngineValidation from '@typo3/backend/form-engine-validation';
import Icons from '../../icons';
import InfoWindow from '../../info-window';
import Modal, {} from '../../modal';
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
import Severity from '../../severity';
import Utility from '../../utility';
import { selector } from '@typo3/core/literals';
var Selectors;
(function (Selectors) {
    Selectors["toggleSelector"] = "[data-bs-toggle=\"formengine-file\"]";
    Selectors["controlSectionSelector"] = ".t3js-formengine-file-header-control";
    Selectors["deleteRecordButtonSelector"] = ".t3js-editform-delete-file-reference";
    Selectors["enableDisableRecordButtonSelector"] = ".t3js-toggle-visibility-button";
    Selectors["infoWindowButton"] = "[data-action=\"infowindow\"]";
    Selectors["synchronizeLocalizeRecordButtonSelector"] = ".t3js-synchronizelocalize-button";
    Selectors["controlContainer"] = ".t3js-file-controls";
})(Selectors || (Selectors = {}));
var States;
(function (States) {
    States["new"] = "isNewFileReference";
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
/**
 * Module: @typo3/backend/form-engine/container/files-control-container
 *
 * Functionality for the files control container
 *
 * @example
 * <typo3-formengine-container-files identifier="some-id">
 *   ...
 * </typo3-formengine-container-files>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class FilesControlContainer extends HTMLElement {
    constructor() {
        super(...arguments);
        this.container = null;
        this.recordsContainer = null;
        this.ajaxDispatcher = null;
        this.appearance = null;
        this.requestQueue = {};
        this.progressQueue = {};
        this.handlePostMessage = (e) => {
            if (!MessageUtility.verifyOrigin(e.origin)) {
                throw 'Denied message sent by ' + e.origin;
            }
            if (e.data.actionName === 'typo3:foreignRelation:insert') {
                if (typeof e.data.objectGroup === 'undefined') {
                    throw 'No object group defined for message';
                }
                if (e.data.objectGroup !== this.container.dataset.objectGroup) {
                    // Received message isn't provisioned for current FilesContainer instance
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
    }
    async connectedCallback() {
        if (this.container !== null) {
            // Container is already initialized, which means the component has been rendered before. Nothing to do here.
            return;
        }
        const identifier = this.getAttribute('identifier') || '';
        await DocumentService.ready();
        this.container = this.querySelector(selector `[id="${identifier}"]`);
        if (this.container !== null) {
            this.recordsContainer = this.container.querySelector(selector `[id="${this.container.getAttribute('id')}_records"]`);
            this.ajaxDispatcher = new AjaxDispatcher(this.container.dataset.objectGroup);
            this.registerEvents();
        }
    }
    registerEvents() {
        this.registerInfoButton();
        this.registerSort();
        this.registerEnableDisableButton();
        this.registerDeleteButton();
        this.registerSynchronizeLocalize();
        this.registerToggle();
        new RegularEvent('message', this.handlePostMessage).bindTo(window);
        if (this.getAppearance().useSortable) {
            // tslint:disable-next-line:no-unused-expression
            new Sortable(this.recordsContainer, {
                group: this.recordsContainer.getAttribute('id'),
                handle: '.sortableHandle',
                onSort: () => {
                    this.updateSorting();
                },
            });
        }
    }
    getFileReferenceContainer(objectId) {
        return this.container.querySelector(selector `[data-object-id="${objectId}"]`);
    }
    getCollapseButton(objectId) {
        return this.container.querySelector(selector `[aria-controls="${objectId}_fields"]`);
    }
    collapseElement(recordContainer, objectId) {
        const collapseButton = this.getCollapseButton(objectId);
        recordContainer.classList.remove(States.visible);
        recordContainer.classList.add(States.collapsed);
        collapseButton.setAttribute('aria-expanded', 'false');
    }
    expandElement(recordContainer, objectId) {
        const collapseButton = this.getCollapseButton(objectId);
        recordContainer.classList.remove(States.collapsed);
        recordContainer.classList.add(States.visible);
        collapseButton.setAttribute('aria-expanded', 'true');
    }
    isNewRecord(objectId) {
        const fileReferenceContainer = this.getFileReferenceContainer(objectId);
        return fileReferenceContainer.classList.contains(States.new);
    }
    updateExpandedCollapsedStateLocally(objectId, value) {
        const fileReferenceContainer = this.getFileReferenceContainer(objectId);
        const ucFormObj = this.container.querySelectorAll('[name="'
            + 'uc[inlineView]'
            + '[' + fileReferenceContainer.dataset.topmostParentTable + ']'
            + '[' + fileReferenceContainer.dataset.topmostParentUid + ']'
            + fileReferenceContainer.dataset.fieldName
            + '"]');
        if (ucFormObj.length) {
            ucFormObj[0].value = value ? '1' : '0';
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
    createRecord(uid, markup, afterUid = null) {
        let objectId = this.container.dataset.objectGroup;
        if (afterUid !== null) {
            objectId += Separators.structureSeparator + afterUid;
        }
        if (afterUid !== null) {
            this.getFileReferenceContainer(objectId).insertAdjacentHTML('afterend', markup);
            this.memorizeAddRecord(uid, afterUid);
        }
        else {
            this.recordsContainer.insertAdjacentHTML('beforeend', markup);
            this.memorizeAddRecord(uid, null);
        }
    }
    async importRecord(params, afterUid) {
        return this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('file_reference_create')), params).then(async (response) => {
            if (this.isBelowMax()) {
                this.createRecord(response.compilerInput.uid, response.data, typeof afterUid !== 'undefined' ? afterUid : null);
            }
        });
    }
    registerEnableDisableButton() {
        new RegularEvent('click', (e, target) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const objectId = target.closest('[data-object-id]').dataset.objectId;
            const recordContainer = this.getFileReferenceContainer(objectId);
            const hiddenFieldName = selector `data${recordContainer.dataset.fieldName}[${target.dataset.hiddenField}]`;
            const hiddenValueCheckBox = this.recordsContainer.querySelector('[data-formengine-input-name="' + hiddenFieldName + '"');
            const hiddenValueInput = this.recordsContainer.querySelector('[name="' + hiddenFieldName + '"');
            if (hiddenValueCheckBox !== null && hiddenValueInput !== null) {
                hiddenValueCheckBox.checked = !hiddenValueCheckBox.checked;
                hiddenValueInput.value = hiddenValueCheckBox.checked ? '1' : '0';
                FormEngineValidation.markFieldAsChanged(hiddenValueCheckBox);
            }
            const hiddenClass = 't3-form-field-container-files-hidden';
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
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            InfoWindow.showItem(targetElement.dataset.infoTable, targetElement.dataset.infoUid);
        }).delegateTo(this.container, Selectors.infoWindowButton);
    }
    registerDeleteButton() {
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const title = TYPO3.lang['label.confirm.delete_record.title'] || 'Delete this record?';
            const content = (TYPO3.lang['label.confirm.delete_record.content'] || 'Are you sure you want to delete the record \'%s\'?').replace('%s', targetElement.dataset.recordInfo);
            Modal.confirm(title, content, Severity.warning, [
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.no'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'no',
                    trigger: (e, modal) => modal.hideModal(),
                },
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.yes'] || 'Yes, delete this record',
                    btnClass: 'btn-warning',
                    name: 'yes',
                    trigger: (e, modal) => {
                        this.deleteRecord(targetElement.closest('[data-object-id]').dataset.objectId);
                        modal.hideModal();
                    }
                },
            ]);
        }).delegateTo(this.container, Selectors.deleteRecordButtonSelector);
    }
    registerSynchronizeLocalize() {
        new RegularEvent('click', (e, targetElement) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('file_reference_synchronizelocalize')), [this.container.dataset.objectGroup, targetElement.dataset.type]).then(async (response) => {
                this.recordsContainer.insertAdjacentHTML('beforeend', response.data);
                const objectIdPrefix = this.container.dataset.objectGroup + Separators.structureSeparator;
                for (const itemUid of response.compilerInput.delete) {
                    this.deleteRecord(objectIdPrefix + itemUid, true);
                }
                for (const item of Object.values(response.compilerInput.localize)) {
                    if (typeof item.remove !== 'undefined') {
                        const removableRecordContainer = this.getFileReferenceContainer(objectIdPrefix + item.remove);
                        removableRecordContainer.parentElement.removeChild(removableRecordContainer);
                    }
                    this.memorizeAddRecord(item.uid, null);
                }
            });
        }).delegateTo(this.container, Selectors.synchronizeLocalizeRecordButtonSelector);
    }
    loadRecordDetails(objectId) {
        const recordFieldsContainer = this.recordsContainer.querySelector(selector `[id="${objectId}_fields"]`);
        const recordContainer = this.getFileReferenceContainer(objectId);
        const isLoading = typeof this.requestQueue[objectId] !== 'undefined';
        const isLoaded = recordFieldsContainer !== null && !recordContainer.classList.contains(States.notLoaded);
        if (!isLoaded) {
            const progress = this.getProgress(objectId, recordContainer.dataset.objectIdHash);
            if (!isLoading) {
                const ajaxRequest = this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('file_reference_details'));
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
    collapseExpandRecord(objectId) {
        const fileReferenceContainer = this.getFileReferenceContainer(objectId);
        const expandSingle = this.getAppearance().expandSingle === true;
        const isCollapsed = fileReferenceContainer.classList.contains(States.collapsed);
        let collapse = [];
        const expand = [];
        if (expandSingle && isCollapsed) {
            collapse = this.collapseAllRecords(fileReferenceContainer.dataset.objectUid);
        }
        if (fileReferenceContainer.classList.contains(States.collapsed)) {
            this.expandElement(fileReferenceContainer, objectId);
        }
        else {
            this.collapseElement(fileReferenceContainer, objectId);
        }
        if (this.isNewRecord(objectId)) {
            this.updateExpandedCollapsedStateLocally(objectId, isCollapsed);
        }
        else if (isCollapsed) {
            expand.push(fileReferenceContainer.dataset.objectUid);
        }
        else if (!isCollapsed) {
            collapse.push(fileReferenceContainer.dataset.objectUid);
        }
        this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('file_reference_expandcollapse')), [objectId, expand.join(','), collapse.join(',')]);
    }
    memorizeAddRecord(newUid, afterUid = null) {
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
        if (!this.isBelowMax()) {
            this.toggleContainerControls(false);
        }
        FormEngine.reinitialize();
        FormEngineValidation.initializeInputFields();
        FormEngineValidation.validate(this.container);
    }
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
    changeSortingByButton(objectId, direction) {
        const fileReferenceContainer = this.getFileReferenceContainer(objectId);
        const objectUid = fileReferenceContainer.dataset.objectUid;
        const records = Array.from(this.recordsContainer.children).map((child) => child.dataset.objectUid);
        const position = records.indexOf(objectUid);
        let isChanged = false;
        if (direction === SortDirections.UP && position > 0) {
            records[position] = records[position - 1];
            records[position - 1] = objectUid;
            isChanged = true;
        }
        else if (direction === SortDirections.DOWN && position < records.length - 1) {
            records[position] = records[position + 1];
            records[position + 1] = objectUid;
            isChanged = true;
        }
        if (isChanged) {
            const objectIdPrefix = this.container.dataset.objectGroup + Separators.structureSeparator;
            const adjustment = direction === SortDirections.UP ? 1 : 0;
            fileReferenceContainer.parentElement.insertBefore(this.getFileReferenceContainer(objectIdPrefix + records[position - adjustment]), this.getFileReferenceContainer(objectIdPrefix + records[position + 1 - adjustment]));
            this.updateSorting();
        }
    }
    updateSorting() {
        const formField = this.getFormFieldForElements();
        if (formField === null) {
            return;
        }
        const records = Array.from(this.recordsContainer.querySelectorAll(selector `[data-object-parent-group="${this.container.dataset.objectGroup}"][data-placeholder-record="0"]`))
            .map((child) => child.dataset.objectUid);
        formField.value = records.join(',');
        FormEngineValidation.markFieldAsChanged(formField);
        document.dispatchEvent(new Event('formengine:files:sorting-changed'));
        document.dispatchEvent(new Event('change'));
        this.redrawSortingButtons(this.container.dataset.objectGroup, records);
    }
    deleteRecord(objectId, forceDirectRemoval = false) {
        const recordContainer = this.getFileReferenceContainer(objectId);
        const objectUid = recordContainer.dataset.objectUid;
        recordContainer.classList.add('t3js-file-reference-deleted');
        if (!this.isNewRecord(objectId) && !forceDirectRemoval) {
            const deleteCommandInput = this.container.querySelector(selector `[name="cmd${recordContainer.dataset.fieldName}[delete]"]`);
            deleteCommandInput.removeAttribute('disabled');
            // Move input field to inline container so we can remove the record container
            recordContainer.parentElement.insertAdjacentElement('afterbegin', deleteCommandInput);
        }
        new RegularEvent('transitionend', () => {
            recordContainer.remove();
            FormEngineValidation.validate(this.container);
        }).bindTo(recordContainer);
        this.memorizeRemoveRecord(objectUid);
        recordContainer.classList.add('form-irre-object--deleted');
        if (this.isBelowMax()) {
            this.toggleContainerControls(true);
        }
    }
    toggleContainerControls(visible) {
        // Note: This toggleContainerControls() is different from inline-control-container.ts
        // because it uses a lit component. So no ':scope >' here.
        const controlContainer = this.container.querySelectorAll(Selectors.controlContainer);
        controlContainer.forEach((container) => {
            const controlContainerButtons = container.querySelectorAll('button, a');
            controlContainerButtons.forEach((button) => {
                button.style.display = visible ? null : 'none';
            });
        });
    }
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
                const recordContainer = this.getFileReferenceContainer(recordObjectId);
                if (recordContainer.classList.contains(States.visible)) {
                    this.collapseElement(recordContainer, recordObjectId);
                    if (this.isNewRecord(recordObjectId)) {
                        this.updateExpandedCollapsedStateLocally(recordObjectId, false);
                    }
                    else {
                        collapse.push(recordUid);
                    }
                }
            }
        }
        return collapse;
    }
    getFormFieldForElements() {
        const formFields = this.container.querySelectorAll(selector `[name="${this.container.dataset.formField}"]`);
        if (formFields.length > 0) {
            return formFields[0];
        }
        return null;
    }
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
            const recordContainer = this.getFileReferenceContainer(objectId + Separators.structureSeparator + recordUid);
            const headerElement = this.container.querySelector('[id="' + recordContainer.dataset.objectIdHash + '_header"]');
            const sortUp = headerElement.querySelector('[data-action="sort"][data-direction="' + SortDirections.UP + '"]');
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
            const sortDown = headerElement.querySelector('[data-action="sort"][data-direction="' + SortDirections.DOWN + '"]');
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
        }
        return true;
    }
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
window.customElements.define('typo3-formengine-container-files', FilesControlContainer);
