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
import { customElement, property } from 'lit/decorators';
import { html, LitElement } from 'lit';
import BrowserSession from '@typo3/backend/storage/browser-session';
let SearchOptionItem = class SearchOptionItem extends LitElement {
    constructor() {
        super(...arguments);
        this.active = false;
    }
    connectedCallback() {
        this.parentContainer = this.closest('typo3-backend-live-search');
        super.connectedCallback();
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        return html `
      <div class="form-check">
        <input type="checkbox" class="form-check-input" name="${this.optionName}[]" value="${this.optionId}" id="${this.optionId}" ?checked=${this.active} @input="${this.handleInput}">
        <label class="form-check-label" for="${this.optionId}">
          ${this.optionLabel}
        </label>
      </div>
    `;
    }
    getStorageKey() {
        return `livesearch-option-${this.optionName}-${this.optionId}`;
    }
    handleInput() {
        this.active = !this.active;
        this.parentContainer.dispatchEvent(new CustomEvent('typo3:live-search:option-invoked', {
            detail: {
                active: this.active
            }
        }));
        BrowserSession.set(this.getStorageKey(), this.active ? '1' : '0');
    }
};
__decorate([
    property({ type: Boolean })
], SearchOptionItem.prototype, "active", void 0);
__decorate([
    property({ type: String })
], SearchOptionItem.prototype, "optionId", void 0);
__decorate([
    property({ type: String })
], SearchOptionItem.prototype, "optionName", void 0);
__decorate([
    property({ type: String })
], SearchOptionItem.prototype, "optionLabel", void 0);
SearchOptionItem = __decorate([
    customElement('typo3-backend-live-search-option-item')
], SearchOptionItem);
export { SearchOptionItem };
