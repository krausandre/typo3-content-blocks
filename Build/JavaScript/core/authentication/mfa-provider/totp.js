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
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators';
import Modal from '@typo3/backend/modal';
let MfaTotpUrlButton = class MfaTotpUrlButton extends LitElement {
    static { this.styles = [css `:host { cursor: pointer; appearance: button; }`]; }
    constructor() {
        super();
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTotpAuthUrlModal();
        });
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showTotpAuthUrlModal();
            }
        });
    }
    connectedCallback() {
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'button');
        }
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
    }
    render() {
        return html `<slot></slot>`;
    }
    showTotpAuthUrlModal() {
        Modal.advanced({
            title: this.modalTitle,
            content: html `
        <p>${this.modalDescription}</p>
        <pre>${this.modalUrl}</pre>
      `,
            buttons: [
                {
                    trigger: () => Modal.dismiss(),
                    text: this.buttonOk || 'OK',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'ok'
                }
            ]
        });
    }
};
__decorate([
    property({ type: String, attribute: 'data-url' })
], MfaTotpUrlButton.prototype, "modalUrl", void 0);
__decorate([
    property({ type: String, attribute: 'data-title' })
], MfaTotpUrlButton.prototype, "modalTitle", void 0);
__decorate([
    property({ type: String, attribute: 'data-description' })
], MfaTotpUrlButton.prototype, "modalDescription", void 0);
__decorate([
    property({ type: String, attribute: 'data-button-ok' })
], MfaTotpUrlButton.prototype, "buttonOk", void 0);
MfaTotpUrlButton = __decorate([
    customElement('typo3-mfa-totp-url-info-button')
], MfaTotpUrlButton);
export { MfaTotpUrlButton };
