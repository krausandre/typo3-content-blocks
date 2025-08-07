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
import '@typo3/backend/element/icon-element';
let ResultItem = class ResultItem extends LitElement {
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('blur', this.onBlur);
        this.addEventListener('click', this.onClick);
        this.addEventListener('keyup', this.onKeyUp);
    }
    disconnectedCallback() {
        this.removeEventListener('blur', this.onBlur);
        this.removeEventListener('click', this.onClick);
        this.removeEventListener('keyup', this.onKeyUp);
        super.disconnectedCallback();
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        return html `
      <div class="formengine-suggest-result-item-icon">
        <typo3-backend-icon title="${this.icon.title}" identifier="${this.icon.identifier}" overlay="${this.icon.overlay}" size="small"></typo3-backend-icon>
      </div>
      <div class="formengine-suggest-result-item-label">
        ${this.label} <small>[${this.uid}] ${this.path}</small>
      </div>
    `;
    }
    onBlur(e) {
        let closeResultContainer = true;
        const relatedElement = e.relatedTarget;
        const resultContainer = this.closest('typo3-backend-formengine-suggest-result-container');
        if (relatedElement?.tagName.toLowerCase() === 'typo3-backend-formengine-suggest-result-item') {
            closeResultContainer = false;
        }
        if (relatedElement?.matches('input[type="search"]') && resultContainer.contains(relatedElement)) {
            closeResultContainer = false;
        }
        resultContainer.hidden = closeResultContainer;
    }
    onClick(e) {
        e.preventDefault();
        this.dispatchItemChosenEvent(e.currentTarget);
    }
    onKeyUp(e) {
        e.preventDefault();
        // Trigger item selection when pressing ENTER or SPACE
        if (['Enter', ' '].includes(e.key)) {
            this.dispatchItemChosenEvent(document.activeElement);
        }
    }
    dispatchItemChosenEvent(selectedItem) {
        selectedItem.closest('typo3-backend-formengine-suggest-result-container').dispatchEvent(new CustomEvent('typo3:formengine:suggest-item-chosen', {
            detail: {
                element: selectedItem
            }
        }));
    }
};
__decorate([
    property({ type: Object })
], ResultItem.prototype, "icon", void 0);
__decorate([
    property({ type: Number })
], ResultItem.prototype, "uid", void 0);
__decorate([
    property({ type: String })
], ResultItem.prototype, "table", void 0);
__decorate([
    property({ type: String })
], ResultItem.prototype, "label", void 0);
__decorate([
    property({ type: String })
], ResultItem.prototype, "path", void 0);
ResultItem = __decorate([
    customElement('typo3-backend-formengine-suggest-result-item')
], ResultItem);
export { ResultItem };
