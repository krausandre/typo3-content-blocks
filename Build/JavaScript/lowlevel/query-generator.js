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
import '@typo3/backend/input/clearable';
import DateTimePicker from '@typo3/backend/date-time-picker';
import RegularEvent from '@typo3/core/event/regular-event';
/**
 * Module: @typo3/lowlevel/query-generator
 * This module handle the QueryGenerator forms.
 */
class QueryGenerator {
    constructor() {
        this.form = document.querySelector('form[name="queryform"]');
        this.searchField = document.querySelector('input#searchField');
        this.submitSearch = document.querySelector('button#submitSearch');
        this.activeSearch = this.searchField ? (this.searchField.value !== '') : false;
        this.limitField = document.querySelector('input#queryLimit');
        if (this.submitSearch && this.activeSearch) {
            this.submitSearch.removeAttribute('disabled');
        }
        if (this.searchField) {
            new RegularEvent('search', () => {
                if (this.searchField.value === '' && this.activeSearch) {
                    this.doSubmit();
                }
            }).bindTo(this.searchField);
            new RegularEvent('input', () => {
                if (this.searchField.value === '' && this.activeSearch) {
                    this.doSubmit();
                }
                this.submitSearch.toggleAttribute('disabled', this.searchField.value === '');
            }).bindTo(this.searchField);
            new RegularEvent('submit', (event) => {
                if (this.searchField.value === '' && !this.activeSearch) {
                    event.preventDefault();
                }
            }).bindTo(this.form);
        }
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.doSubmit();
        }).delegateTo(this.form, '.t3js-submit-click');
        new RegularEvent('change', (event) => {
            event.preventDefault();
            this.doSubmit();
        }).delegateTo(this.form, '.t3js-submit-change');
        new RegularEvent('click', (event, element) => {
            event.preventDefault();
            this.setLimit(element.value);
            this.doSubmit();
        }).delegateTo(this.form, '.t3js-limit-submit input[type="button"]');
        new RegularEvent('click', (event, element) => {
            event.preventDefault();
            this.addValueToField(element.dataset.field, element.value);
        }).delegateTo(this.form, '.t3js-addfield');
        new RegularEvent('change', (event, element) => {
            const titleField = this.form.querySelector('input[name="storeControl[title]"]');
            if (element.value !== '0') {
                titleField.value = element.querySelector('option:selected').textContent;
            }
            else {
                titleField.value = '';
            }
        }).delegateTo(this.form, 'select.t3js-addfield');
        document.querySelectorAll('form[name="queryform"] .t3js-clearable').forEach((clearableField) => clearableField.clearable({
            onClear: () => {
                this.doSubmit();
            },
        }));
        document.querySelectorAll('form[name="queryform"] .t3js-datetimepicker').forEach((dateTimePickerElement) => DateTimePicker.initialize(dateTimePickerElement));
    }
    /**
     * Submit the form
     */
    doSubmit() {
        this.form.submit();
    }
    /**
     * Set query limit
     *
     * @param {String} value
     */
    setLimit(value) {
        this.limitField.value = value;
    }
    /**
     * Add value to text field
     *
     * @param {String} field the name of the field
     * @param {String} value the value to add
     */
    addValueToField(field, value) {
        const target = this.form.querySelector('[name="' + field + '"]');
        value = target.value + ',' + value;
        target.value = value
            .split(',')
            // Remove whitespace from fields
            .map(fieldName => fieldName.trim())
            // Ensure fields only exist once
            .filter((value, index, array) => array.indexOf(value) === index)
            .join(',');
    }
}
export default new QueryGenerator();
