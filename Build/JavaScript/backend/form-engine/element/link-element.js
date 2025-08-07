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
import { selector } from '@typo3/core/literals';
var Selectors;
(function (Selectors) {
    Selectors["toggleSelector"] = ".t3js-form-field-link-explanation-toggle";
    Selectors["inputFieldSelector"] = ".t3js-form-field-link-input";
    Selectors["explanationSelector"] = ".t3js-form-field-link-explanation";
    Selectors["iconSelector"] = ".t3js-form-field-link-icon";
    Selectors["containerSelector"] = ".t3js-form-field-link";
})(Selectors || (Selectors = {}));
/**
 * Module: @typo3/backend/form-engine/element/link-element
 *
 * Functionality for the link element
 *
 * @example
 * <typo3-formengine-element-link recordFieldId="some-id">
 *   ...
 * </typo3-formengine-element-link>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class LinkElement extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', (e) => this.handleClick(e));
        this.addEventListener('change', (e) => this.handleChange(e));
    }
    get element() {
        const recordFieldId = this.getAttribute('recordFieldId');
        if (recordFieldId === null) {
            throw new Error('Missing recordFieldId attribute on <typo3-formengine-element-link>');
        }
        const element = this.querySelector(selector `#${recordFieldId}`);
        if (element === null) {
            throw new Error(`recordFieldId #${recordFieldId} not found in <typo3-formengine-element-link>`);
        }
        return element;
    }
    get container() {
        return this.element.closest(Selectors.containerSelector);
    }
    get toggleSelector() {
        return this.container.querySelector(Selectors.toggleSelector);
    }
    get explanationField() {
        return this.container.querySelector(Selectors.explanationSelector);
    }
    get icon() {
        return this.container.querySelector(Selectors.iconSelector);
    }
    handleClick(e) {
        const initiator = e.target;
        const isToggleButton = initiator.closest(Selectors.toggleSelector) !== null;
        if (isToggleButton) {
            e.preventDefault();
            const explanationHidden = this.explanationField.hasAttribute('hidden');
            if (explanationHidden) {
                this.showExplanation();
            }
            else {
                this.hideExplanation();
            }
        }
    }
    handleChange(e) {
        const initiator = e.target;
        const isInputField = initiator.closest(Selectors.inputFieldSelector) !== null;
        if (isInputField) {
            const explanationVisible = !this.explanationField.hasAttribute('hidden');
            if (explanationVisible) {
                this.hideExplanation();
            }
            this.disableToggle();
            this.clearIcon();
        }
    }
    showExplanation() {
        this.explanationField.removeAttribute('hidden');
        this.element.setAttribute('hidden', '');
    }
    hideExplanation() {
        this.explanationField.setAttribute('hidden', '');
        this.element.removeAttribute('hidden');
    }
    disableToggle() {
        this.toggleSelector.setAttribute('disabled', '');
    }
    clearIcon() {
        this.icon.replaceChildren();
    }
}
window.customElements.define('typo3-formengine-element-link', LinkElement);
