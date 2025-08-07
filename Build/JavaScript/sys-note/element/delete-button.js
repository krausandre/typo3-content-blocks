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
import { css, html, LitElement } from 'lit';
import Modal from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import DeferredAction from '@typo3/backend/action-button/deferred-action';
import AjaxDataHandler from '@typo3/backend/ajax-data-handler';
import Viewport from '@typo3/backend/viewport';
/**
 * Module: @typo3/sys-note/delete-button
 *
 * @example
 * <typo3-sysnote-delete-button uid="42" return-url="">
 *   ...
 * </typo3-sysnote-delete-button>
 */
let DeleteButton = class DeleteButton extends LitElement {
    static { this.styles = [css `:host { cursor: pointer; appearance: button; }`]; }
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'button');
        }
        if (!this.hasAttribute('tabindex')) {
            this.setAttribute('tabindex', '0');
        }
        this.addEventListener('click', this.showConfirmationModal);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('click', this.showConfirmationModal);
    }
    render() {
        return html `<slot></slot>`;
    }
    showConfirmationModal() {
        Modal.advanced({
            content: this.modalContent,
            title: this.modalTitle,
            severity: SeverityEnum.warning,
            size: Modal.sizes.small,
            buttons: [
                {
                    text: this.cancelButtonLabel || 'Close',
                    btnClass: 'btn-default',
                    trigger: function () {
                        Modal.dismiss();
                    },
                }, {
                    text: this.okButtonLabel || 'OK',
                    btnClass: 'btn-warning',
                    action: new DeferredAction(async () => {
                        await this.deleteRecord();
                    }),
                },
            ]
        });
    }
    async deleteRecord() {
        const processing = AjaxDataHandler.process(`cmd[sys_note][${this.uid}][delete]=1`);
        processing.then(() => {
            Viewport.ContentContainer.setUrl(this.returnUrl);
        });
        return processing;
    }
};
__decorate([
    property({ type: Number })
], DeleteButton.prototype, "uid", void 0);
__decorate([
    property({ type: String, attribute: 'return-url' })
], DeleteButton.prototype, "returnUrl", void 0);
__decorate([
    property({ type: String, attribute: 'modal-title' })
], DeleteButton.prototype, "modalTitle", void 0);
__decorate([
    property({ type: String, attribute: 'modal-content' })
], DeleteButton.prototype, "modalContent", void 0);
__decorate([
    property({ type: String, attribute: 'modal-button-ok' })
], DeleteButton.prototype, "okButtonLabel", void 0);
__decorate([
    property({ type: String, attribute: 'modal-button-cancel' })
], DeleteButton.prototype, "cancelButtonLabel", void 0);
DeleteButton = __decorate([
    customElement('typo3-sysnote-delete-button')
], DeleteButton);
export { DeleteButton };
