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
var InsertModes;
(function (InsertModes) {
    InsertModes["append"] = "append";
    InsertModes["replace"] = "replace";
    InsertModes["prepend"] = "prepend";
})(InsertModes || (InsertModes = {}));
/**
 * Module @typo3/backend/form-engine/field-wizard/value-picker
 *
 * @example
 * <typo3-formengine-valuepicker mode="prepend" linked-field="css-selector">
 *   <select>
 * </typo3-formengine-valuepicker>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
export class ValuePicker extends HTMLElement {
    constructor() {
        super();
        this.valuePicker = null;
        this.linkedField = null;
        this.initialValueSet = false;
        this.onChange = () => {
            this.setValue();
            this.valuePicker.blur();
        };
        this.linkedFieldOnChange = () => {
            if (this.valuePicker === null) {
                return;
            }
            if (this.getInsertMode() === InsertModes.replace) {
                this.selectValue(this.linkedField.value);
            }
            else {
                this.valuePicker.selectedIndex = 0;
            }
        };
        const slot = document.createElement('slot');
        slot.addEventListener('slotchange', () => this.initializeValuePicker(slot));
        this.attachShadow({ mode: 'open' }).append(slot);
    }
    connectedCallback() {
        this.linkedField = document.querySelector(this.getAttribute('linked-field'));
        this.linkedField?.addEventListener('change', this.linkedFieldOnChange);
        this.initializeValuePicker(this.shadowRoot.querySelector('slot'));
    }
    disconnectedCallback() {
        this.linkedField?.removeEventListener('change', this.linkedFieldOnChange);
        this.linkedField = null;
    }
    initializeValuePicker(slot) {
        const picker = (slot.assignedElements()[0] ?? null);
        if (picker !== null && picker.tagName.toLowerCase() !== 'select') {
            throw new Error(`ValuePicker could not be initialized. Expected <select> child name, but found: ${picker}`);
        }
        if (picker !== this.valuePicker) {
            this.valuePicker?.removeEventListener('change', this.onChange);
            this.valuePicker = picker;
            this.valuePicker?.addEventListener('change', this.onChange);
            this.initialValueSet = false;
        }
        this.setInitialPickerValue();
    }
    setInitialPickerValue() {
        if (this.linkedField === null || this.valuePicker === null || this.initialValueSet) {
            return;
        }
        if (this.getInsertMode() === InsertModes.replace) {
            const formEngineInputField = (document.getElementsByName(this.linkedField.dataset.formengineInputName)[0] ?? null);
            if (formEngineInputField !== null) {
                this.selectValue(formEngineInputField.value);
                this.initialValueSet = true;
            }
        }
    }
    selectValue(value) {
        this.valuePicker.selectedIndex = Array.from(this.valuePicker.options).findIndex((option) => option.value === value);
    }
    getInsertMode() {
        return this.getAttribute('mode') ?? InsertModes.replace;
    }
    setValue() {
        const selectedValue = this.valuePicker.options[this.valuePicker.selectedIndex].value;
        switch (this.getInsertMode()) {
            case InsertModes.append:
                this.linkedField.value += selectedValue;
                break;
            case InsertModes.prepend:
                this.linkedField.value = selectedValue + this.linkedField.value;
                break;
            default:
                this.linkedField.value = selectedValue;
                break;
        }
        this.linkedField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }
}
window.customElements.define('typo3-formengine-valuepicker', ValuePicker);
