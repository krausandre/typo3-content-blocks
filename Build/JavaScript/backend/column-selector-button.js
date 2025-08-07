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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ColumnSelectorButton_1;
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import { default as Modal } from '@typo3/backend/modal';
import { lll } from '@typo3/core/lit-helper';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Notification from '@typo3/backend/notification';
var Selectors;
(function (Selectors) {
    Selectors["columnsSelector"] = ".t3js-column-selector";
    Selectors["columnsContainerSelector"] = ".t3js-column-selector-container";
    Selectors["columnsFilterSelector"] = "input[name=\"columns-filter\"]";
    Selectors["columnsSelectorActionsSelector"] = ".t3js-column-selector-actions";
})(Selectors || (Selectors = {}));
var SelectorActions;
(function (SelectorActions) {
    SelectorActions["toggle"] = "select-toggle";
    SelectorActions["all"] = "select-all";
    SelectorActions["none"] = "select-none";
})(SelectorActions || (SelectorActions = {}));
/**
 * Module: @typo3/backend/column-selector-button
 *
 * @example
 * <typo3-backend-column-selector-button
 *    class="btn btn-default"
 *    data-url="/url/to/column/selector/form"
 *    data-target="/url/to/go/after/column/selection"
 *    data-title="Show columns"
 *    data-button-ok="Update"
 *    data-button-close="Cancel"
 *    data-error-message="Error"
 * >
 *   Show columns
 * </typo3-backend-column-selector-button>
 */
let ColumnSelectorButton = class ColumnSelectorButton extends LitElement {
    static { ColumnSelectorButton_1 = this; }
    static { this.styles = [css `:host { cursor: pointer; appearance: button; }`]; }
    constructor() {
        super();
        this.modalTitle = 'Show columns';
        this.buttonOk = lll('button.ok') || 'Update';
        this.buttonClose = lll('button.close') || 'Close';
        this.errorMessage = 'Could not update columns';
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.showColumnSelectorModal();
        });
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showColumnSelectorModal();
            }
        });
    }
    /**
     * Toggle selector actions state (enabled or disabled) depending
     * on the columns state (checked, unchecked, displayed or hidden)
     *
     * @param columns The columns
     * @param selectAll The "select all" action button
     * @param selectNone The "select none" action button
     * @param initialize Whether this is the initialize call - don't check hidden
     *                   state as all columns are displayed on initialization
     * @private
     */
    static toggleSelectorActions(columns, selectAll, selectNone, initialize = false) {
        selectAll.classList.add('disabled');
        for (let i = 0; i < columns.length; i++) {
            if (!columns[i].disabled
                && !columns[i].checked
                && (initialize || !ColumnSelectorButton_1.isColumnHidden(columns[i]))) {
                selectAll.classList.remove('disabled');
                break;
            }
        }
        selectNone.classList.add('disabled');
        for (let i = 0; i < columns.length; i++) {
            if (!columns[i].disabled
                && columns[i].checked
                && (initialize || !ColumnSelectorButton_1.isColumnHidden(columns[i]))) {
                selectNone.classList.remove('disabled');
                break;
            }
        }
    }
    /**
     * Check if the given column is hidden by looking at it's container element
     *
     * @param column The column to check for
     * @private
     */
    static isColumnHidden(column) {
        return column.closest(Selectors.columnsContainerSelector)?.classList.contains('hidden');
    }
    /**
     * Check each column if it matches the current search term.
     * If not, hide its outer container to not break the grid.
     *
     * @param columnsFilter The columns filter
     * @param columns The columns to check
     * @private
     */
    static filterColumns(columnsFilter, columns) {
        columns.forEach((column) => {
            const columnContainer = column.closest(Selectors.columnsContainerSelector);
            if (!column.disabled && columnContainer !== null) {
                const filterValue = columnContainer.querySelector('.form-check-label')?.textContent;
                if (filterValue && filterValue.length) {
                    columnContainer.classList.toggle('hidden', columnsFilter.value !== '' && !RegExp(columnsFilter.value, 'i').test(filterValue.trim().replace(/\[\]/g, '').replace(/\s+/g, ' ')));
                }
            }
        });
    }
    connectedCallback() {
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'button');
        }
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
    }
    render() {
        return html `<slot></slot>`;
    }
    showColumnSelectorModal() {
        if (!this.modalUrl || !this.modalTarget) {
            // Don't render modal in case no url or target is given
            return;
        }
        const modal = Modal.advanced({
            content: this.modalUrl,
            title: this.modalTitle,
            severity: SeverityEnum.notice,
            size: Modal.sizes.medium,
            type: Modal.types.ajax,
            buttons: [
                {
                    text: this.buttonClose,
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                    trigger: (e, modal) => modal.hideModal()
                },
                {
                    text: this.buttonOk,
                    btnClass: 'btn-primary',
                    name: 'update',
                    trigger: (e, modal) => this.processSelection(modal)
                }
            ],
            ajaxCallback: () => this.handleModalContentLoaded(modal)
        });
    }
    processSelection(currentModal) {
        const form = currentModal.querySelector('form');
        if (form === null) {
            this.abortSelection();
            return;
        }
        (new AjaxRequest(TYPO3.settings.ajaxUrls.show_columns))
            .post(new FormData(form))
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                // @todo This does not jump to the anchor (#t3-table-some_table) after the reload!!!
                this.ownerDocument.location.href = this.modalTarget;
                this.ownerDocument.location.reload();
            }
            else {
                Notification.error(data.message || 'No update was performed');
            }
            Modal.dismiss();
        })
            .catch(() => {
            this.abortSelection();
        });
    }
    handleModalContentLoaded(currentModal) {
        const form = currentModal.querySelector('form');
        if (form === null) {
            // Early return if modal content does not include a form
            return;
        }
        // Prevent the form from being submitted as the form data will be send via an ajax request
        form.addEventListener('submit', (e) => { e.preventDefault(); });
        const columns = currentModal.querySelectorAll(Selectors.columnsSelector);
        const columnsFilter = currentModal.querySelector(Selectors.columnsFilterSelector);
        const columnsSelectorActions = currentModal.querySelector(Selectors.columnsSelectorActionsSelector);
        const selectAll = columnsSelectorActions.querySelector('button[data-action="' + SelectorActions.all + '"]');
        const selectNone = columnsSelectorActions.querySelector('button[data-action="' + SelectorActions.none + '"]');
        if (!columns.length || columnsFilter === null || selectAll === null || selectNone === null) {
            // Return in case required elements do not exist in the modal content
            return;
        }
        // First initialize select-all / select-none buttons
        ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone, true);
        // Add event listener for each column to toggle the selector actions after change
        columns.forEach((column) => {
            column.addEventListener('change', () => {
                ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone);
            });
        });
        // Add event listener for keydown event for the columns filter, so we
        // can catch the "Escape" key, which would otherwise close the modal.
        columnsFilter.addEventListener('keydown', (e) => {
            const target = e.target;
            if (e.code === 'Escape') {
                e.stopImmediatePropagation();
                target.value = '';
            }
        });
        // Add event listener for keydown event for the columns filter, allowing the "live filtering"
        columnsFilter.addEventListener('keyup', (e) => {
            ColumnSelectorButton_1.filterColumns(e.target, columns);
            ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone);
        });
        // Catch browser specific "search" event, triggered on clicking the "clear" button
        columnsFilter.addEventListener('search', (e) => {
            ColumnSelectorButton_1.filterColumns(e.target, columns);
            ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone);
        });
        // Add event listener for all columns select actions. querySelectorAll will return
        // at least two actions (selectAll and selectNone) which we checked above already
        columnsSelectorActions.querySelectorAll('button[data-action]').forEach((action) => {
            action.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget;
                if (!target.dataset.action) {
                    // Return if we don't deal with a valid action (No action defined)
                    return;
                }
                // Perform requested action
                switch (target.dataset.action) {
                    case SelectorActions.toggle:
                        columns.forEach((column) => {
                            if (!column.disabled && !ColumnSelectorButton_1.isColumnHidden(column)) {
                                column.checked = !column.checked;
                            }
                        });
                        break;
                    case SelectorActions.all:
                        columns.forEach((column) => {
                            if (!column.disabled && !ColumnSelectorButton_1.isColumnHidden(column)) {
                                column.checked = true;
                            }
                        });
                        break;
                    case SelectorActions.none:
                        columns.forEach((column) => {
                            if (!column.disabled && !ColumnSelectorButton_1.isColumnHidden(column)) {
                                column.checked = false;
                            }
                        });
                        break;
                    default:
                        // Unknown action
                        Notification.warning('Unknown selector action');
                }
                // After performing the action always toggle selector actions
                ColumnSelectorButton_1.toggleSelectorActions(columns, selectAll, selectNone);
            });
        });
    }
    abortSelection() {
        Notification.error(this.errorMessage);
        Modal.dismiss();
    }
};
__decorate([
    property({ type: String, attribute: 'data-url' })
], ColumnSelectorButton.prototype, "modalUrl", void 0);
__decorate([
    property({ type: String, attribute: 'data-target' })
], ColumnSelectorButton.prototype, "modalTarget", void 0);
__decorate([
    property({ type: String, attribute: 'data-title' })
], ColumnSelectorButton.prototype, "modalTitle", void 0);
__decorate([
    property({ type: String, attribute: 'data-button-ok' })
], ColumnSelectorButton.prototype, "buttonOk", void 0);
__decorate([
    property({ type: String, attribute: 'data-button-close' })
], ColumnSelectorButton.prototype, "buttonClose", void 0);
__decorate([
    property({ type: String, attribute: 'data-error-message' })
], ColumnSelectorButton.prototype, "errorMessage", void 0);
ColumnSelectorButton = ColumnSelectorButton_1 = __decorate([
    customElement('typo3-backend-column-selector-button')
], ColumnSelectorButton);
export { ColumnSelectorButton };
