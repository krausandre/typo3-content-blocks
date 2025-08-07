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
import { html, css, LitElement } from 'lit';
import Modal from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import '@typo3/backend/new-record-wizard';
/**
 * Module: @typo3/backend/new-content-element-wizard-button
 *
 * @example
 * <typo3-backend-new-content-element-wizard-button class="btn btn-default" url="link/to/endpoint" subject="Wizard title" ></typo3-backend-new-content-element-wizard-button>
 */
let NewContentElementWizardButton = class NewContentElementWizardButton extends LitElement {
    static { this.styles = [css `:host { cursor: pointer; appearance: button; }`]; }
    constructor() {
        super();
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderWizard();
        });
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.renderWizard();
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
    renderWizard() {
        if (!this.url) {
            // Return in case no url is defined
            return;
        }
        Modal.advanced({
            content: this.url,
            title: this.subject,
            severity: SeverityEnum.notice,
            size: Modal.sizes.large,
            type: Modal.types.ajax
        });
    }
};
__decorate([
    property({ type: String })
], NewContentElementWizardButton.prototype, "url", void 0);
__decorate([
    property({ type: String })
], NewContentElementWizardButton.prototype, "subject", void 0);
NewContentElementWizardButton = __decorate([
    customElement('typo3-backend-new-content-element-wizard-button')
], NewContentElementWizardButton);
export { NewContentElementWizardButton };
