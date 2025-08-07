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
import ThrottleEvent from '@typo3/core/event/throttle-event';
var Format;
(function (Format) {
    Format["integer"] = "integer";
    Format["decimal"] = "decimal";
})(Format || (Format = {}));
/**
 * Module @typo3/backend/form-engine/field-wizard/value-slider
 *
 * @example
 * <typo3-formengine-valueslider linked-field="css-selector" format="integer" precision="2">
 *   <input>
 * </typo3-formengine-valueslider>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
export class ValueSlider extends HTMLElement {
    constructor() {
        super(...arguments);
        this.valueSlider = null;
        this.handleRangeChange = (e) => {
            const target = e.target;
            this.updateValue(target);
            this.updateTooltipValue(target);
        };
    }
    async connectedCallback() {
        if (this.valueSlider !== null) {
            // Element is already initialized, which means the component has been rendered before. Nothing to do here.
            return;
        }
        await DocumentService.ready();
        this.valueSlider = this.querySelector('input');
        if (this.valueSlider !== null) {
            new ThrottleEvent('input', this.handleRangeChange, 25).bindTo(this.valueSlider);
        }
    }
    /**
     * Update value of slider element
     *
     * @param {HTMLInputElement} element
     */
    updateValue(element) {
        const foreignField = document.querySelector(this.getAttribute('linked-field'));
        foreignField.value = element.value;
        foreignField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }
    /**
     * @param {HTMLInputElement} element
     */
    updateTooltipValue(element) {
        let renderedValue;
        const value = element.value;
        switch (this.getAttribute('format')) {
            case Format.decimal:
                renderedValue = parseFloat(value).toFixed(Number(this.getAttribute('precision')) || 2);
                break;
            case Format.integer:
            default:
                renderedValue = parseInt(value, 10);
        }
        element.title = renderedValue.toString();
    }
}
window.customElements.define('typo3-formengine-valueslider', ValueSlider);
