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
import RegularEvent from '@typo3/core/event/regular-event';
import { selector } from '@typo3/core/literals';
import { MultiRecordSelectionSelectors } from '@typo3/backend/multi-record-selection';
var Permissions;
(function (Permissions) {
    Permissions["none"] = "none";
    Permissions["select"] = "select";
    Permissions["modify"] = "modify";
})(Permissions || (Permissions = {}));
/**
 * Module: @typo3/backend/form-engine/element/table-permissions-element
 *
 * Functionality for the tablePermission form element
 *
 * @example
 * <typo3-formengine-element-tablepermission selectStateFieldName="<field>" modifyStateFieldName="<field>">
 *   ...
 * </typo3-formengine-element-tablepermission>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class TablePermissionElement extends HTMLElement {
    constructor() {
        super(...arguments);
        this.selectStateField = null;
        this.modifyStateField = null;
    }
    async connectedCallback() {
        await DocumentService.ready();
        this.selectStateField = this.querySelector(selector `input[name=${this.getAttribute('selectStateFieldName') || ''}]`);
        this.modifyStateField = this.querySelector(selector `input[name=${this.getAttribute('modifyStateFieldName') || ''}]`);
        if (this.selectStateField === null || this.modifyStateField === null) {
            return;
        }
        this.registerEventHandler();
    }
    registerEventHandler() {
        new RegularEvent('change', (e) => {
            this.handleSingleItemChange(e.target);
        }).delegateTo(this.querySelector('table'), '.t3js-table-permissions-item');
        new RegularEvent('multiRecordSelection:checkbox:state:changed', (e) => {
            const name = e.target.name;
            if (this.querySelectorAll(selector `input[name="${name}"]:checked`).length === 0) {
                const item = this.querySelector(selector `input[name="${name}"]`);
                item.value = Permissions.none;
                this.handleSingleItemChange(item);
                this.querySelector(selector `input[name="${name}"][value="${Permissions.none}"]`).checked = true;
            }
        }).delegateTo(this.querySelector('table'), MultiRecordSelectionSelectors.checkboxSelector);
    }
    handleSingleItemChange(target) {
        switch (target.value) {
            case Permissions.select:
                this.addItem(target.dataset.table, this.selectStateField);
                this.removeItem(target.dataset.table, this.modifyStateField);
                break;
            case Permissions.modify:
                this.addItem(target.dataset.table, this.selectStateField);
                this.addItem(target.dataset.table, this.modifyStateField);
                break;
            case Permissions.none:
            default:
                this.removeItem(target.dataset.table, this.selectStateField);
                this.removeItem(target.dataset.table, this.modifyStateField);
                break;
        }
    }
    removeItem(table, field) {
        field.value = (field.value.length ? field.value.split(',') : []).filter(item => item !== table).join(',');
    }
    addItem(table, field) {
        const list = field.value.length ? field.value.split(',') : [];
        if (list.includes(table)) {
            return;
        }
        list.push(table);
        field.value = list.join(',');
    }
}
window.customElements.define('typo3-formengine-element-tablepermission', TablePermissionElement);
