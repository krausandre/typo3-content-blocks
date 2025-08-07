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
import { customElement, property, state } from 'lit/decorators';
import { html, LitElement } from 'lit';
import { lll } from '@typo3/core/lit-helper';
let CharCounter = class CharCounter extends LitElement {
    constructor() {
        super(...arguments);
        this.remainingCharacters = 0;
        this.targetElement = null;
        this.threshold = 15;
        this.onInput = (e) => {
            this.determineRemainingCharacters(e.target);
        };
        this.onFocus = (e) => {
            this.determineRemainingCharacters(e.target);
            this.hidden = false;
        };
        this.onBlur = () => {
            this.hidden = true;
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.registerCallbacks();
        this.hidden = true;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeCallbacks();
    }
    createRenderRoot() {
        return this;
    }
    updated(changedProperties) {
        if (changedProperties.has('target')) {
            this.removeCallbacks();
            this.targetElement = document.querySelector(this.target);
            this.registerCallbacks();
        }
    }
    render() {
        return html `
      <span class="form-hint form-hint--${this.determineCounterClass()}">
        ${lll(('FormEngine.remainingCharacters')).replace('{0}', this.remainingCharacters.toString(10))}
      </span>
    `;
    }
    registerCallbacks() {
        if (this.targetElement === null) {
            return;
        }
        this.targetElement.addEventListener('input', this.onInput);
        this.targetElement.addEventListener('focus', this.onFocus);
        this.targetElement.addEventListener('blur', this.onBlur);
    }
    removeCallbacks() {
        if (this.targetElement === null) {
            return;
        }
        this.targetElement.removeEventListener('input', this.onInput);
        this.targetElement.removeEventListener('focus', this.onFocus);
        this.targetElement.removeEventListener('blur', this.onBlur);
    }
    determineRemainingCharacters(field) {
        const fieldText = field.value;
        const currentFieldLength = fieldText.length;
        const numberOfLineBreaks = (fieldText.match(/\n/g) || []).length;
        this.remainingCharacters = this.targetElement.maxLength - currentFieldLength - numberOfLineBreaks;
    }
    determineCounterClass() {
        if (this.remainingCharacters < this.threshold) {
            return 'danger';
        }
        if (this.remainingCharacters < this.threshold * 2) {
            return 'warning';
        }
        return 'info';
    }
};
__decorate([
    property()
], CharCounter.prototype, "target", void 0);
__decorate([
    state()
], CharCounter.prototype, "remainingCharacters", void 0);
CharCounter = __decorate([
    customElement('typo3-backend-formengine-char-counter')
], CharCounter);
export { CharCounter };
