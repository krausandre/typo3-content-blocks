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
import Severity from './severity';
import { customElement, property } from 'lit/decorators';
import { html, LitElement, nothing } from 'lit';
/**
 * Module: @typo3/install/module/flash-message
 */
let FlashMessage = class FlashMessage extends LitElement {
    static create(severity, subject, content = '') {
        const isInIframe = window.location !== window.parent.location;
        const doc = isInIframe ? window.parent.document : document;
        const message = doc.createElement('typo3-install-flashmessage');
        message.severity = severity;
        message.subject = subject;
        if (content) {
            message.content = content;
        }
        return message;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        let content = nothing;
        if (this.content) {
            content = html `<p class="alert-message">${this.content}</p>`;
        }
        return html `
      <div class="t3js-message alert alert-${Severity.getCssClass(this.severity)}">
        <div class="alert-title">${this.subject}</div>
        ${content}
      </div>
    `;
    }
};
__decorate([
    property({ type: Number })
], FlashMessage.prototype, "severity", void 0);
__decorate([
    property({ type: String })
], FlashMessage.prototype, "subject", void 0);
__decorate([
    property({ type: String })
], FlashMessage.prototype, "content", void 0);
FlashMessage = __decorate([
    customElement('typo3-install-flashmessage')
], FlashMessage);
export { FlashMessage };
