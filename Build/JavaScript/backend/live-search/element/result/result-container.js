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
import LiveSearchConfigurator from '@typo3/backend/live-search/live-search-configurator';
import Viewport from '@typo3/backend/viewport';
import { customElement, property, query } from 'lit/decorators';
import { html, LitElement, nothing } from 'lit';
import { lll } from '@typo3/core/lit-helper';
import {} from './item/item-container';
import {} from './result-detail-container';
export const componentName = 'typo3-backend-live-search-result-container';
let ResultContainer = class ResultContainer extends LitElement {
    constructor() {
        super(...arguments);
        this.results = null;
        this.loading = false;
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('livesearch:request-actions', this.onActionsRequested);
        this.addEventListener('livesearch:invoke-action', this.onActionInvoked);
    }
    disconnectedCallback() {
        this.removeEventListener('livesearch:request-actions', this.onActionsRequested);
        this.removeEventListener('livesearch:invoke-action', this.onActionInvoked);
        super.disconnectedCallback();
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        if (this.loading) {
            return html `<div class="d-flex flex-fill align-items-center justify-content-center"><typo3-backend-spinner size="large"></typo3-backend-spinner></div>`;
        }
        if (this.results === null) {
            return nothing;
        }
        if (this.results.length === 0) {
            return html `<div class="alert alert-info">${lll('liveSearch_listEmptyText')}</div>`;
        }
        return html `
      <typo3-backend-live-search-result-item-container .results="${this.results}"></typo3-backend-live-search-result-item-container>
      <typo3-backend-live-search-result-item-detail-container></typo3-backend-live-search-result-item-detail-container>
    `;
    }
    onActionsRequested(e) {
        this.resultDetailContainer.resultItem = e.detail.resultItem;
    }
    onActionInvoked(e) {
        const invokeHandlers = LiveSearchConfigurator.getInvokeHandlers();
        const resultItem = e.detail.resultItem;
        const action = e.detail.action;
        if (action === undefined) {
            return;
        }
        if (typeof invokeHandlers[resultItem.provider + '_' + action.identifier] === 'function') {
            invokeHandlers[resultItem.provider + '_' + action.identifier](resultItem, action);
        }
        else {
            // Default handler to open the URL
            Viewport.ContentContainer.setUrl(action.url);
        }
        this.dispatchEvent(new CustomEvent('live-search:item-chosen', {
            detail: { resultItem }
        }));
    }
};
__decorate([
    property({ type: Object })
], ResultContainer.prototype, "results", void 0);
__decorate([
    property({ type: Boolean, attribute: false })
], ResultContainer.prototype, "loading", void 0);
__decorate([
    query('typo3-backend-live-search-result-item-container')
], ResultContainer.prototype, "itemContainer", void 0);
__decorate([
    query('typo3-backend-live-search-result-item-detail-container')
], ResultContainer.prototype, "resultDetailContainer", void 0);
ResultContainer = __decorate([
    customElement('typo3-backend-live-search-result-container')
], ResultContainer);
export { ResultContainer };
