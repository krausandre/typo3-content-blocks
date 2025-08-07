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
let Item = class Item extends LitElement {
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
        this.addEventListener('focus', this.onFocus);
    }
    disconnectedCallback() {
        this.removeEventListener('focus', this.onFocus);
        super.disconnectedCallback();
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        return html `<div class="livesearch-expand-action" @click="${(e) => { e.stopPropagation(); this.focus(); }}"><typo3-backend-icon identifier="actions-chevron-right" size="small"></typo3-backend-icon></div>`;
    }
    onFocus(e) {
        const target = e.target;
        target.parentElement.querySelector('.active')?.classList.remove('active');
        target.classList.add('active');
    }
};
__decorate([
    property({ type: Object, attribute: false })
], Item.prototype, "resultItem", void 0);
Item = __decorate([
    customElement('typo3-backend-live-search-result-item')
], Item);
export { Item };
