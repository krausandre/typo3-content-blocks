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
import { ifDefined } from 'lit/directives/if-defined';
import { html, LitElement } from 'lit';
import '@typo3/backend/element/icon-element';
let Action = class Action extends LitElement {
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        return html `
      <div>
        <div class="livesearch-result-item-icon">
          <typo3-backend-icon identifier="${ifDefined(this.resultItemAction.icon.identifier || 'actions-arrow-right')}" overlay="${this.resultItemAction.icon.overlay}" size="small"></typo3-backend-icon>
        </div>
        <div class="livesearch-result-item-title">
          ${this.resultItemAction.label}
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object, attribute: false })
], Action.prototype, "resultItem", void 0);
__decorate([
    property({ type: Object, attribute: false })
], Action.prototype, "resultItemAction", void 0);
Action = __decorate([
    customElement('typo3-backend-live-search-result-item-action')
], Action);
export { Action };
