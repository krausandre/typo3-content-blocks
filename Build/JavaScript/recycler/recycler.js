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
import DocumentService from '@typo3/core/document-service';
import NProgress from 'nprogress';
import '@typo3/backend/input/clearable';
import '@typo3/backend/element/alert-element';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/element/pagination';
import DeferredAction from '@typo3/backend/action-button/deferred-action';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import RegularEvent from '@typo3/core/event/regular-event';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
var Identifiers;
(function (Identifiers) {
    Identifiers["searchForm"] = "#recycler-form";
    Identifiers["searchText"] = "#recycler-form [name=search-text]";
    Identifiers["searchSubmitBtn"] = "#recycler-form button[type=submit]";
    Identifiers["depthSelector"] = "#recycler-form [name=depth]";
    Identifiers["tableSelector"] = "#recycler-form [name=pages]";
    Identifiers["recyclerTable"] = "#itemsInRecycler";
    Identifiers["paginator"] = "#recycler-index nav";
    Identifiers["reloadAction"] = "a[data-action=reload]";
    Identifiers["undo"] = "button[data-action=undo]";
    Identifiers["delete"] = "button[data-action=delete]";
    Identifiers["massUndo"] = "button[data-multi-record-selection-action=massundo]";
    Identifiers["massDelete"] = "button[data-multi-record-selection-action=massdelete]";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/recycler/recycler
 * JavaScript module for Recycler
 */
class Recycler {
    constructor() {
        this.paging = {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: parseInt(TYPO3.settings.Recycler.pagingSize, 10),
        };
        this.markedRecordsForMassAction = [];
        DocumentService.ready().then(() => {
            this.initialize();
        });
    }
    /**
     * Reloads the page tree
     */
    static refreshPageTree() {
        top.document.dispatchEvent(new CustomEvent('typo3:pagetree:refresh'));
    }
    /**
     * Register events
     */
    registerEvents() {
        new RegularEvent('submit', (event) => {
            event.preventDefault();
            const searchTextField = document.querySelector(Identifiers.searchText);
            if (searchTextField.value !== '') {
                this.loadDeletedElements();
            }
        }).delegateTo(document, Identifiers.searchForm);
        // changing the search field
        new RegularEvent('input', (event, target) => {
            const searchSubmitButton = document.querySelector(Identifiers.searchSubmitBtn);
            if (target.value !== '') {
                searchSubmitButton.disabled = false;
            }
            else {
                searchSubmitButton.disabled = true;
                this.loadDeletedElements();
            }
        }).delegateTo(document, Identifiers.searchText);
        // changing "depth"
        new RegularEvent('change', () => {
            this.loadAvailableTables().then(() => {
                this.loadDeletedElements();
            });
        }).delegateTo(document, Identifiers.depthSelector);
        // changing "table"
        new RegularEvent('change', () => {
            this.paging.currentPage = 1;
            this.loadDeletedElements();
        }).delegateTo(document, Identifiers.tableSelector);
        // clicking "recover" in single row
        new RegularEvent('click', this.undoRecord.bind(this)).delegateTo(document, Identifiers.undo);
        // clicking "delete" in single row
        new RegularEvent('click', this.deleteRecord.bind(this)).delegateTo(document, Identifiers.delete);
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.loadAvailableTables().then(() => {
                this.loadDeletedElements();
            });
        }).delegateTo(document, Identifiers.reloadAction);
        document.querySelector(Identifiers.searchText).clearable({
            onClear: () => {
                const searchSubmitButton = document.querySelector(Identifiers.searchSubmitBtn);
                searchSubmitButton.disabled = true;
                this.loadDeletedElements();
            },
        });
        // clicking an action in the paginator
        new RegularEvent('click', (event) => {
            event.preventDefault();
            const paginator = event.target.closest('button');
            if (!paginator) {
                return;
            }
            if (paginator.dataset.action === 'previous') {
                if (this.paging.currentPage > 1) {
                    this.paging.currentPage--;
                }
            }
            else if (paginator.dataset.action === 'next') {
                if (this.paging.currentPage < this.paging.totalPages) {
                    this.paging.currentPage++;
                }
            }
            else if (paginator.dataset.action === 'page') {
                this.paging.currentPage = parseInt(paginator.querySelector('span').textContent, 10);
            }
            this.loadDeletedElements();
        }).delegateTo(document, Identifiers.paginator);
        // checkboxes in the table
        new RegularEvent('multiRecordSelection:checkbox:state:changed', this.handleCheckboxStateChanged.bind(this)).bindTo(document);
        new RegularEvent('multiRecordSelection:action:massundo', this.undoRecord.bind(this)).bindTo(document);
        new RegularEvent('multiRecordSelection:action:massdelete', this.deleteRecord.bind(this)).bindTo(document);
    }
    /**
     * Initialize the recycler module
     */
    initialize() {
        NProgress.configure({ parent: '.module-loading-indicator', showSpinner: false });
        this.registerEvents();
        if (TYPO3.settings.Recycler.depthSelection > 0) {
            document.querySelector(Identifiers.depthSelector).value = String(TYPO3.settings.Recycler.depthSelection);
        }
        this.loadAvailableTables().then(() => {
            this.loadDeletedElements();
        });
    }
    /**
     * Handles the clicks on checkboxes in the records table
     */
    handleCheckboxStateChanged(event) {
        const checkbox = event.target;
        const tableRow = checkbox.closest('tr');
        const table = tableRow.dataset.table;
        const uid = tableRow.dataset.uid;
        const record = table + ':' + uid;
        if (checkbox.checked) {
            this.markedRecordsForMassAction.push(record);
        }
        else {
            const index = this.markedRecordsForMassAction.indexOf(record);
            if (index > -1) {
                this.markedRecordsForMassAction.splice(index, 1);
            }
        }
        if (this.markedRecordsForMassAction.length > 0) {
            const massUndo = document.querySelector(Identifiers.massUndo);
            massUndo.querySelector('span.text')
                .textContent = this.createMessage(TYPO3.lang['button.undoselected'], [this.markedRecordsForMassAction.length.toString(10)]);
            if (!TYPO3.settings.Recycler.deleteDisable) {
                const massDelete = document.querySelector(Identifiers.massDelete);
                massDelete.querySelector('span.text')
                    .textContent = this.createMessage(TYPO3.lang['button.deleteselected'], [this.markedRecordsForMassAction.length.toString(10)]);
            }
        }
        else {
            this.resetMassActionButtons();
        }
    }
    /**
     * Resets the mass action state
     */
    resetMassActionButtons() {
        const massUndo = document.querySelector(Identifiers.massUndo);
        this.markedRecordsForMassAction = [];
        massUndo.querySelector('span.text').textContent = TYPO3.lang['button.undo'];
        if (!TYPO3.settings.Recycler.deleteDisable) {
            const massDelete = document.querySelector(Identifiers.massDelete);
            massDelete.querySelector('span.text').textContent = TYPO3.lang['button.delete'];
        }
        document.dispatchEvent(new CustomEvent('multiRecordSelection:actions:hide'));
    }
    /**
     * Loads all tables which contain deleted records.
     */
    async loadAvailableTables() {
        const tableSelector = document.querySelector(Identifiers.tableSelector);
        const depthSelector = document.querySelector(Identifiers.depthSelector);
        NProgress.start();
        tableSelector.value = '';
        this.paging.currentPage = 1;
        return new AjaxRequest(TYPO3.settings.ajaxUrls.recycler).withQueryArguments({
            action: 'getTables',
            startUid: TYPO3.settings.Recycler.startUid,
            depth: depthSelector.value,
        }).get().then(async (response) => {
            const data = await response.resolve();
            const tables = [];
            tableSelector.replaceChildren();
            for (const value of data) {
                const tableName = value[0];
                const deletedRecords = value[1];
                const tableDescription = value[2] ? value[2] : TYPO3.lang.label_allrecordtypes;
                const optionText = tableDescription + ' (' + deletedRecords + ')';
                const option = document.createElement('option');
                option.value = tableName;
                option.textContent = optionText;
                tables.push(option);
            }
            if (tables.length > 0) {
                tableSelector.append(...tables);
                if (TYPO3.settings.Recycler.tableSelection !== '') {
                    tableSelector.value = TYPO3.settings.Recycler.tableSelection;
                }
            }
            return response;
        }).finally(() => NProgress.done());
    }
    /**
     * Loads the deleted elements, based on the filters
     */
    async loadDeletedElements() {
        const depthSelector = document.querySelector(Identifiers.depthSelector);
        const tableSelector = document.querySelector(Identifiers.tableSelector);
        const searchTextField = document.querySelector(Identifiers.searchText);
        NProgress.start();
        this.resetMassActionButtons();
        return new AjaxRequest(TYPO3.settings.ajaxUrls.recycler).withQueryArguments({
            action: 'getDeletedRecords',
            depth: depthSelector.value,
            startUid: TYPO3.settings.Recycler.startUid,
            table: tableSelector.value,
            filterTxt: searchTextField.value,
            start: (this.paging.currentPage - 1) * this.paging.itemsPerPage,
            limit: this.paging.itemsPerPage,
        }).get().then(async (response) => {
            const tableWrapper = document.querySelector(Identifiers.recyclerTable);
            const tableBody = tableWrapper.querySelector('tbody');
            const data = await response.resolve();
            if (data.totalItems === 0) {
                if (tableWrapper.parentElement.querySelector('#no-recycler-records') === null) {
                    const alertElement = document.createElement('typo3-backend-alert');
                    alertElement.id = 'no-recycler-records';
                    alertElement.severity = SeverityEnum.info;
                    alertElement.message = TYPO3.lang['alert.noDeletedRecords'];
                    alertElement.showIcon = true;
                    tableWrapper.parentElement.insertBefore(alertElement, tableWrapper);
                }
            }
            else {
                tableWrapper.parentElement.querySelector('#no-recycler-records')?.remove();
                tableBody.innerHTML = data.rows;
            }
            tableWrapper.toggleAttribute('hidden', data.totalItems === 0);
            this.buildPaginator(data.totalItems);
            return response;
        }).finally(() => NProgress.done());
    }
    deleteRecord(event, currentTarget) {
        if (TYPO3.settings.Recycler.deleteDisable) {
            return;
        }
        const target = currentTarget ? currentTarget : event.target;
        const tableRow = target.closest('tr');
        const isMassDelete = tableRow === null || tableRow.parentElement.tagName !== 'TBODY'; // deleteRecord() was invoked by the mass delete button
        let records;
        let message;
        if (isMassDelete) {
            records = this.markedRecordsForMassAction;
            message = TYPO3.lang['modal.massdelete.text'];
        }
        else {
            const uid = tableRow.dataset.uid;
            const table = tableRow.dataset.table;
            const recordTitle = tableRow.dataset.recordtitle;
            records = [table + ':' + uid];
            message = table === 'pages' ? TYPO3.lang['modal.deletepage.text'] : TYPO3.lang['modal.deletecontent.text'];
            message = this.createMessage(message, [recordTitle, '[' + records[0] + ']']);
        }
        Modal.advanced({
            title: TYPO3.lang['modal.delete.header'],
            content: message,
            severity: SeverityEnum.error,
            staticBackdrop: true,
            buttons: [
                {
                    text: TYPO3.lang['button.cancel'],
                    btnClass: 'btn-default',
                    trigger: function () {
                        Modal.dismiss();
                    },
                }, {
                    text: TYPO3.lang['button.delete'],
                    btnClass: 'btn-danger',
                    action: new DeferredAction(() => {
                        this.callAjaxAction('delete', records, isMassDelete);
                    }),
                },
            ]
        });
    }
    undoRecord(event, currentTarget) {
        const target = currentTarget ? currentTarget : event.target;
        const tableRow = target.closest('tr');
        const isMassUndo = tableRow === null || tableRow.parentElement.tagName !== 'TBODY'; // undoRecord() was invoked by the mass delete button
        let records;
        let messageText;
        let recoverPages;
        if (isMassUndo) {
            records = this.markedRecordsForMassAction;
            messageText = TYPO3.lang['modal.massundo.text'];
            recoverPages = true;
        }
        else {
            const uid = tableRow.dataset.uid;
            const table = tableRow.dataset.table;
            const recordTitle = tableRow.dataset.recordtitle;
            records = [table + ':' + uid];
            recoverPages = table === 'pages';
            messageText = recoverPages ? TYPO3.lang['modal.undopage.text'] : TYPO3.lang['modal.undocontent.text'];
            messageText = this.createMessage(messageText, [recordTitle, '[' + records[0] + ']']);
            if (recoverPages && tableRow.dataset.parentDeleted) {
                messageText += TYPO3.lang['modal.undo.parentpages'];
            }
        }
        let message = null;
        if (recoverPages) {
            const wrapper = document.createElement('div');
            const paragraph = document.createElement('p');
            paragraph.textContent = messageText;
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.classList.add('form-check');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'undo-recursive';
            checkbox.classList.add('form-check-input');
            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.htmlFor = 'undo-recursive';
            label.textContent = TYPO3.lang['modal.undo.recursive'];
            checkboxWrapper.append(checkbox, label);
            wrapper.append(paragraph, checkboxWrapper);
            message = wrapper;
        }
        else {
            const paragraph = document.createElement('p');
            paragraph.textContent = messageText;
            message = paragraph;
        }
        Modal.advanced({
            title: TYPO3.lang['modal.undo.header'],
            content: message,
            severity: SeverityEnum.ok,
            staticBackdrop: true,
            buttons: [
                {
                    text: TYPO3.lang['button.cancel'],
                    btnClass: 'btn-default',
                    trigger: function () {
                        Modal.dismiss();
                    },
                }, {
                    text: TYPO3.lang['button.undo'],
                    btnClass: 'btn-success',
                    action: new DeferredAction(() => {
                        this.callAjaxAction('undo', typeof records === 'object' ? records : [records], isMassUndo, message.querySelector('#undo-recursive')?.checked);
                    }),
                },
            ]
        });
    }
    async callAjaxAction(action, records, isMassAction, recursive = false) {
        const data = {
            records: records,
            action: '',
        };
        let reloadPageTree = false;
        if (action === 'undo') {
            data.action = 'undoRecords';
            data.recursive = recursive ? 1 : 0;
            reloadPageTree = true;
        }
        else if (action === 'delete') {
            data.action = 'deleteRecords';
        }
        else {
            return null;
        }
        NProgress.start();
        return new AjaxRequest(TYPO3.settings.ajaxUrls.recycler).post(data).then(async (response) => {
            const responseData = await response.resolve();
            if (responseData.success) {
                Notification.success('', responseData.message);
            }
            else {
                Notification.error('', responseData.message);
            }
            // reload recycler data
            this.paging.currentPage = 1;
            this.loadAvailableTables().then(() => {
                this.loadDeletedElements();
                if (isMassAction) {
                    this.resetMassActionButtons();
                }
                if (reloadPageTree) {
                    Recycler.refreshPageTree();
                }
            });
            return response;
        });
    }
    /**
     * Replaces the placeholders with actual values
     */
    createMessage(message, placeholders) {
        if (typeof message === 'undefined') {
            return '';
        }
        return message.replace(/\{([0-9]+)\}/g, function (_, index) {
            return placeholders[index];
        });
    }
    /**
     * Build the paginator
     */
    buildPaginator(totalItems) {
        const paginator = document.querySelector(Identifiers.paginator);
        if (totalItems === 0) {
            paginator.replaceChildren();
            return;
        }
        this.paging.totalItems = totalItems;
        this.paging.totalPages = Math.ceil(totalItems / this.paging.itemsPerPage);
        if (this.paging.totalPages === 1) {
            // early abort if only one page is available
            paginator.replaceChildren();
            return;
        }
        const pagination = document.createElement('typo3-backend-pagination');
        pagination.paging = this.paging;
        paginator.replaceChildren(pagination);
    }
}
export default new Recycler();
