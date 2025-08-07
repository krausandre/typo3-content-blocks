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
import DocumentService from '@typo3/core/document-service';
import { customElement, property } from 'lit/decorators';
import { css, html, LitElement } from 'lit';
import {} from './action';
export const componentName = 'typo3-backend-live-search-result-item-action-container';
let ActionContainer = class ActionContainer extends LitElement {
    constructor() {
        super(...arguments);
        this.resultItem = null;
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        return html `<typo3-backend-live-search-result-action-list>
      ${this.resultItem.actions.map((action) => this.renderActionItem(this.resultItem, action))}
    </typo3-backend-live-search-result-action-list>`;
    }
    renderActionItem(resultItem, action) {
        return html `<typo3-backend-live-search-result-item-action
      .resultItem="${resultItem}"
      .resultItemAction="${action}"
      @click="${() => this.invokeAction(this.resultItem, action)}">
    </typo3-backend-live-search-result-item-action>`;
    }
    invokeAction(resultItem, action) {
        this.closest('typo3-backend-live-search-result-container').dispatchEvent(new CustomEvent('livesearch:invoke-action', {
            detail: {
                resultItem: resultItem,
                action: action
            }
        }));
    }
};
__decorate([
    property({ type: Object, attribute: false })
], ActionContainer.prototype, "resultItem", void 0);
ActionContainer = __decorate([
    customElement('typo3-backend-live-search-result-item-action-container')
], ActionContainer);
export { ActionContainer };
let ActionList = class ActionList extends LitElement {
    static { this.styles = css `
    :host {
      display: block;
    }
  `; }
    async connectedCallback() {
        await DocumentService.ready();
        this.parentContainer = this.closest('typo3-backend-live-search-result-container');
        this.resultItemContainer = this.parentContainer.querySelector('typo3-backend-live-search-result-item-container');
        super.connectedCallback();
        this.addEventListener('keydown', this.handleKeyDown);
        this.addEventListener('keyup', this.handleKeyUp);
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this.handleKeyDown);
        this.removeEventListener('keyup', this.handleKeyUp);
        super.disconnectedCallback();
    }
    render() {
        return html `<slot></slot>`;
    }
    handleKeyDown(e) {
        if (!['ArrowDown', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
            return;
        }
        if (document.activeElement.tagName.toLowerCase() !== 'typo3-backend-live-search-result-item-action') {
            return;
        }
        e.preventDefault();
        let focusableCandidate;
        if (e.key === 'ArrowDown') {
            focusableCandidate = document.activeElement.nextElementSibling;
        }
        else if (e.key === 'ArrowUp') {
            focusableCandidate = document.activeElement.previousElementSibling;
        }
        else if (e.key === 'ArrowLeft') {
            focusableCandidate = this.resultItemContainer.querySelector('typo3-backend-live-search-result-item.active');
        }
        if (focusableCandidate !== null) {
            focusableCandidate.focus();
        }
    }
    handleKeyUp(e) {
        if (!['Enter', ' '].includes(e.key)) {
            return;
        }
        e.preventDefault();
        const actionElement = e.target;
        this.parentContainer.dispatchEvent(new CustomEvent('livesearch:invoke-action', {
            detail: {
                resultItem: actionElement.resultItem,
                action: actionElement.resultItemAction
            }
        }));
    }
};
ActionList = __decorate([
    customElement('typo3-backend-live-search-result-action-list')
], ActionList);
export { ActionList };
