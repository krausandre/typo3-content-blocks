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
import Icons from '@typo3/backend/icons';
import PersistentStorage from '@typo3/backend/storage/persistent';
import RegularEvent from '@typo3/core/event/regular-event';
import DocumentService from '@typo3/core/document-service';
import { MultiRecordSelectionSelectors } from '@typo3/backend/multi-record-selection';
import { selector } from '@typo3/core/literals';
/**
 * Module: @typo3/backend/recordlist
 * Usability improvements for the record list
 * @exports @typo3/backend/recordlist
 */
class Recordlist {
    constructor() {
        this.identifier = {
            entity: '.t3js-entity',
            toggle: '.t3js-toggle-recordlist',
            localize: '.t3js-action-localize',
            editMultiple: '.t3js-record-edit-multiple',
            icons: {
                collapse: 'actions-view-list-collapse',
                expand: 'actions-view-list-expand'
            },
        };
        this.toggleClick = (e, targetEl) => {
            e.preventDefault();
            const table = targetEl.dataset.table;
            const target = document.querySelector(targetEl.dataset.bsTarget);
            const isExpanded = target.dataset.state === 'expanded';
            const collapseIcon = targetEl.querySelector('.t3js-icon');
            const toggleIcon = isExpanded ? this.identifier.icons.expand : this.identifier.icons.collapse;
            Icons.getIcon(toggleIcon, Icons.sizes.small).then((icon) => {
                collapseIcon.replaceWith(document.createRange().createContextualFragment(icon));
            });
            // Store collapse state in UC
            let storedModuleDataList = {};
            if (PersistentStorage.isset('moduleData.web_list.collapsedTables')) {
                storedModuleDataList = PersistentStorage.get('moduleData.web_list.collapsedTables');
            }
            const collapseConfig = {};
            collapseConfig[table] = isExpanded ? 1 : 0;
            storedModuleDataList = Object.assign(storedModuleDataList, collapseConfig);
            PersistentStorage.set('moduleData.web_list.collapsedTables', storedModuleDataList).then(() => {
                target.dataset.state = isExpanded ? 'collapsed' : 'expanded';
            });
        };
        /**
         * Handles editing multiple records.
         */
        this.onEditMultiple = (event, target) => {
            event.preventDefault();
            let tableName = '';
            let returnUrl = '';
            let columnsOnly = [];
            const entityIdentifiers = [];
            if (event.type === 'multiRecordSelection:action:edit') {
                // In case the request is triggerd by the multi record selection event, handling
                // is slightly different since the event data already contain the selected records.
                const eventDetails = event.detail;
                const configuration = eventDetails.configuration;
                returnUrl = configuration.returnUrl || '';
                columnsOnly = configuration.columnsOnly || [];
                tableName = configuration.tableName || '';
                if (tableName === '') {
                    return;
                }
                // Evaluate all checked records and if valid, add their uid to the list
                eventDetails.checkboxes.forEach((checkbox) => {
                    const checkboxContainer = checkbox.closest(MultiRecordSelectionSelectors.elementSelector);
                    if (checkboxContainer !== null && checkboxContainer.dataset[configuration.idField]) {
                        entityIdentifiers.push(checkboxContainer.dataset[configuration.idField]);
                    }
                });
            }
            else {
                // Edit record request was triggered via t3js-* class on target.
                const tableContainer = target.closest('[data-table]');
                if (tableContainer === null) {
                    return;
                }
                tableName = tableContainer.dataset.table || '';
                if (tableName === '') {
                    return;
                }
                returnUrl = target.dataset.returnUrl || '';
                columnsOnly = JSON.parse(target.dataset.columnsOnly || '{}');
                // Check if there are selected records, which would limit the records to edit
                const selection = tableContainer.querySelectorAll(this.identifier.entity + '[data-uid][data-table="' + tableName + '"] td.col-checkbox input[type="checkbox"]:checked');
                if (selection.length) {
                    // If there are selected records, only those are added to the list
                    selection.forEach((entity) => {
                        entityIdentifiers.push(entity.closest(this.identifier.entity + selector `[data-uid][data-table="${tableName}"]`).dataset.uid);
                    });
                }
                else {
                    // Get all records for the current table and add their uid to the list
                    const entities = tableContainer.querySelectorAll(this.identifier.entity + selector `[data-uid][data-table="${tableName}"]`);
                    if (!entities.length) {
                        return;
                    }
                    entities.forEach((entity) => {
                        entityIdentifiers.push(entity.dataset.uid);
                    });
                }
            }
            if (!entityIdentifiers.length) {
                // Return in case no records to edit were found
                return;
            }
            let editUrl = top.TYPO3.settings.FormEngine.moduleUrl
                + '&edit[' + tableName + '][' + entityIdentifiers.join(',') + ']=edit'
                + '&returnUrl=' + Recordlist.getReturnUrl(returnUrl);
            if (columnsOnly.length > 0) {
                editUrl += columnsOnly.map((column, i) => '&columnsOnly[' + tableName + '][' + i + ']=' + column).join('');
            }
            window.location.href = editUrl;
        };
        this.disableButton = (event, target) => {
            target.setAttribute('disabled', 'disabled');
            target.classList.add('disabled');
        };
        this.registerPaginationEvents = () => {
            document.querySelectorAll('.t3js-recordlist-paging').forEach((trigger) => {
                trigger.addEventListener('keyup', (e) => {
                    e.preventDefault();
                    let value = Number(trigger.value);
                    const min = Number(trigger.min);
                    const max = Number(trigger.max);
                    if (min && value < min) {
                        value = min;
                    }
                    if (max && value > max) {
                        value = max;
                    }
                    trigger.value = value.toString(10);
                    if (e.key === 'Enter' && value !== Number(trigger.dataset.currentpage)) {
                        const form = trigger.closest('form[name^="list-table-form-"]');
                        const submitUrl = new URL(form.action, window.origin);
                        submitUrl.searchParams.set('pointer', value.toString());
                        window.location.href = submitUrl.toString();
                    }
                });
            });
        };
        new RegularEvent('click', this.toggleClick).delegateTo(document, this.identifier.toggle);
        new RegularEvent('click', this.onEditMultiple).delegateTo(document, this.identifier.editMultiple);
        new RegularEvent('click', this.disableButton).delegateTo(document, this.identifier.localize);
        DocumentService.ready().then(() => {
            this.registerPaginationEvents();
        });
        // multi record selection events
        new RegularEvent('multiRecordSelection:action:edit', this.onEditMultiple).bindTo(document);
        new RegularEvent('multiRecordSelection:action:copyMarked', (event) => {
            Recordlist.submitClipboardFormWithCommand('copyMarked', event.target);
        }).bindTo(document);
        new RegularEvent('multiRecordSelection:action:removeMarked', (event) => {
            Recordlist.submitClipboardFormWithCommand('removeMarked', event.target);
        }).bindTo(document);
    }
    static submitClipboardFormWithCommand(cmd, target) {
        const clipboardForm = target.closest('form');
        if (!clipboardForm) {
            return;
        }
        const commandField = clipboardForm.querySelector('input[name="cmd"]');
        if (!commandField) {
            return;
        }
        commandField.value = cmd;
        clipboardForm.submit();
    }
    static getReturnUrl(returnUrl) {
        if (returnUrl === '') {
            returnUrl = top.list_frame.document.location.pathname + top.list_frame.document.location.search;
        }
        return encodeURIComponent(returnUrl);
    }
}
export default new Recordlist();
