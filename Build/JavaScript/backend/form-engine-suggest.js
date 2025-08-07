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
import './form-engine/element/suggest/result-container';
import DocumentService from '@typo3/core/document-service';
import FormEngine from '@typo3/backend/form-engine';
import RegularEvent from '@typo3/core/event/regular-event';
import DebounceEvent from '@typo3/core/event/debounce-event';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { selector } from '@typo3/core/literals';
class FormEngineSuggest {
    constructor(element) {
        this.currentRequest = null;
        this.handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const results = JSON.parse(this.resultContainer.getAttribute('results'));
                if (results?.length > 0) {
                    this.resultContainer.hidden = false;
                }
                // Select first available result item
                const firstSearchResultItem = this.resultContainer.querySelector('typo3-backend-formengine-suggest-result-item');
                firstSearchResultItem?.focus();
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                this.resultContainer.hidden = true;
            }
        };
        this.element = element;
        DocumentService.ready().then(() => {
            this.initialize(element);
            this.registerEvents();
        });
    }
    initialize(searchField) {
        const containerElement = searchField.closest('.t3-form-suggest-container');
        this.resultContainer = document.createElement('typo3-backend-formengine-suggest-result-container');
        this.resultContainer.hidden = true;
        containerElement.append(this.resultContainer);
    }
    registerEvents() {
        new RegularEvent('typo3:formengine:suggest-item-chosen', (e) => {
            let insertData = '';
            if (this.element.dataset.fieldtype === 'select') {
                insertData = e.detail.element.uid;
            }
            else {
                insertData = e.detail.element.table + '_' + e.detail.element.uid;
            }
            FormEngine.setSelectOptionFromExternalSource(this.element.dataset.field, insertData, e.detail.element.label, e.detail.element.label);
            FormEngine.Validation.markFieldAsChanged(document.querySelector(selector `input[name="${this.element.dataset.field}"]`));
            this.resultContainer.hidden = true;
        }).bindTo(this.resultContainer);
        new RegularEvent('focus', () => {
            const results = JSON.parse(this.resultContainer.getAttribute('results'));
            if (results?.length > 0) {
                this.resultContainer.hidden = false;
            }
        }).bindTo(this.element);
        new RegularEvent('blur', (e) => {
            if (e.relatedTarget?.tagName.toLowerCase() === 'typo3-backend-formengine-suggest-result-item') {
                // don't to anything if focus switches to a result item
                return;
            }
            this.resultContainer.hidden = true;
        }).bindTo(this.element);
        new DebounceEvent('input', (e) => {
            if (this.currentRequest instanceof AjaxRequest) {
                this.currentRequest.abort();
            }
            const target = e.target;
            if (target.value.length < parseInt(target.dataset.minchars, 10)) {
                return;
            }
            const uid = parseInt(target.dataset.uid, 10);
            this.currentRequest = new AjaxRequest(TYPO3.settings.ajaxUrls.record_suggest);
            this.currentRequest.post({
                value: target.value,
                tableName: target.dataset.tablename,
                fieldName: target.dataset.fieldname,
                uid: (isNaN(uid) ? null : uid),
                pid: parseInt(target.dataset.pid, 10),
                dataStructureIdentifier: target.dataset.datastructureidentifier,
                flexFormSheetName: target.dataset.flexformsheetname,
                flexFormFieldName: target.dataset.flexformfieldname,
                flexFormContainerName: target.dataset.flexformcontainername,
                flexFormContainerFieldName: target.dataset.flexformcontainerfieldname,
                recordTypeValue: target.dataset.recordtypevalue,
            }).then(async (response) => {
                const resultSet = await response.raw().text();
                this.resultContainer.setAttribute('results', resultSet);
                this.resultContainer.hidden = false;
            });
        }).bindTo(this.element);
        new RegularEvent('keydown', this.handleKeyDown).bindTo(this.element);
    }
}
export default FormEngineSuggest;
