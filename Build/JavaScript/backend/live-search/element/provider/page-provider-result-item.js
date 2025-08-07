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
import '@typo3/backend/element/icon-element';
import { lll } from '@typo3/core/lit-helper';
let PageProviderResultItem = class PageProviderResultItem extends LitElement {
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        return html `
      <div class="livesearch-result-item-icon">
        <typo3-backend-icon title="${this.icon.title}" identifier="${this.icon.identifier}" overlay="${this.icon.overlay}" size="small"></typo3-backend-icon>
        <typo3-backend-icon title="${this.extraData.flagIcon.title}" identifier="${this.extraData.flagIcon.identifier}" size="small"></typo3-backend-icon>
      </div>
      <div class="livesearch-result-item-summary">
        <div class="livesearch-result-item-title">
          <div class="livesearch-result-item-title-contentlabel">${this.itemTitle}</div>
          ${this.extraData.inWorkspace ? html `<div class="livesearch-result-item-title-indicator"><typo3-backend-icon title="${lll('liveSearch.versionizedRecord')}" identifier="actions-dot" size="small" class="text-warning"></typo3-backend-icon></div>` : nothing}
        </div>
        <small>${this.extraData.breadcrumb}</small>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object, attribute: false })
], PageProviderResultItem.prototype, "icon", void 0);
__decorate([
    property({ type: String, attribute: false })
], PageProviderResultItem.prototype, "itemTitle", void 0);
__decorate([
    property({ type: String, attribute: false })
], PageProviderResultItem.prototype, "typeLabel", void 0);
__decorate([
    property({ type: Object, attribute: false })
], PageProviderResultItem.prototype, "extraData", void 0);
PageProviderResultItem = __decorate([
    customElement('typo3-backend-live-search-result-item-page-provider')
], PageProviderResultItem);
export default PageProviderResultItem;
