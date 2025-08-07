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
import { KeyTypesEnum } from '@typo3/backend/enum/key-types';
/**
 * Module: @typo3/backend/element/dispatch-modal-button
 *
 * @example
 * <typo3-backend-dispatch-modal-button class="btn btn-default" url="link/to/endpoint" subject="Wizard title" ></typo3-move-record-wizard-button>
 */
let DispatchModalButton = class DispatchModalButton extends LitElement {
    static { this.styles = [css `:host { cursor: pointer; appearance: button; }`]; }
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'button');
        }
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
        this.addEventListener('click', this.triggerWizard);
        this.addEventListener('keydown', this.triggerWizard);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('click', this.triggerWizard);
        this.removeEventListener('keydown', this.triggerWizard);
    }
    render() {
        return html `<slot></slot>`;
    }
    triggerWizard(e) {
        if (e instanceof KeyboardEvent) {
            if (e.key === KeyTypesEnum.ENTER || e.key === KeyTypesEnum.SPACE) {
                e.preventDefault();
            }
        }
        else {
            e.preventDefault();
        }
        this.renderWizard();
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
            type: Modal.types.iframe
        });
    }
};
__decorate([
    property({ type: String })
], DispatchModalButton.prototype, "url", void 0);
__decorate([
    property({ type: String })
], DispatchModalButton.prototype, "subject", void 0);
DispatchModalButton = __decorate([
    customElement('typo3-backend-dispatch-modal-button')
], DispatchModalButton);
export { DispatchModalButton };
