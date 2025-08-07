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
import { html, LitElement, nothing } from 'lit';
import './item/action/action-container';
export const componentName = 'typo3-backend-live-search-result-item-detail-container';
let ResultDetailContainer = class ResultDetailContainer extends LitElement {
    constructor() {
        super(...arguments);
        this.resultItem = null;
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        if (this.resultItem === null) {
            return nothing;
        }
        return html `
      <div class="livesearch-detail-preamble">
        <typo3-backend-icon identifier="${this.resultItem.icon.identifier}" overlay="${this.resultItem.icon.overlay}" size="large"></typo3-backend-icon>
        <h3>${this.resultItem.itemTitle}</h3>
        <p class="livesearch-detail-preamble-type">${this.resultItem.typeLabel}</p>
      </div>
      <typo3-backend-live-search-result-item-action-container .resultItem="${this.resultItem}"></typo3-backend-live-search-result-item-action-container>
    `;
    }
};
__decorate([
    property({ type: Object, attribute: false })
], ResultDetailContainer.prototype, "resultItem", void 0);
ResultDetailContainer = __decorate([
    customElement('typo3-backend-live-search-result-item-detail-container')
], ResultDetailContainer);
export { ResultDetailContainer };
