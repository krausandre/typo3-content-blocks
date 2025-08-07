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
import { customElement, property, query, state } from 'lit/decorators';
import { html, LitElement, nothing } from 'lit';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import Viewport from '@typo3/backend/viewport';
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';
import Modal, { Sizes } from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
class SudoModeProperties extends LitElement {
}
__decorate([
    property({ type: String })
], SudoModeProperties.prototype, "verifyActionUri", void 0);
__decorate([
    property({ type: String })
], SudoModeProperties.prototype, "cancelUri", void 0);
__decorate([
    property({ type: Boolean })
], SudoModeProperties.prototype, "isAjax", void 0);
__decorate([
    property({ type: Boolean, attribute: 'has-fatal-error' })
], SudoModeProperties.prototype, "hasFatalError", void 0);
__decorate([
    property({ type: Boolean, attribute: 'allow-install-tool-password' })
], SudoModeProperties.prototype, "allowInstallToolPassword", void 0);
__decorate([
    property({ type: Object })
], SudoModeProperties.prototype, "labels", void 0);
export const initiateSudoModeModal = async (properties) => {
    const isInIframe = window.location !== window.parent.location;
    if (isInIframe) {
        // Create a top-level instance
        topLevelModuleImport('@typo3/backend/security/element/sudo-mode.js');
    }
    const el = top.document.createElement('typo3-backend-security-sudo-mode');
    Object.assign(el, properties);
    el.windowRef = window;
    top.document.body.append(el);
    return new Promise((resolve, reject) => {
        el.addEventListener('typo3:sudo-mode:verified', () => resolve());
        el.addEventListener('typo3:sudo-mode:finished', () => reject());
    });
};
/**
 * Web Component showing the sudo mode password dialogs. The password verification
 * happens via AJAX, the redirect to the actually requested resources is triggered
 * by this JavaScript component as well - since it is capable of navigating to the
 * `top` frame directly (compared to using `target` in e.g. Fluid HTML).
 */
let SudoMode = class SudoMode extends SudoModeProperties {
    render() {
        return nothing;
    }
    async firstUpdated() {
        const isInIframe = window.location !== window.parent.location;
        // Launched from /sudo-mode/module route
        if (isInIframe) {
            try {
                await initiateSudoModeModal(this.getPropertyValues());
            }
            catch {
                // Go back to previous route when the modal is closed without verification
                history.go(-1);
            }
            return;
        }
        Modal.advanced({
            title: this.hasFatalError ? this.labels.verificationFailed : this.labels.verifyWithUserPassword,
            severity: this.hasFatalError ? SeverityEnum.error : SeverityEnum.notice,
            size: Sizes.small,
            additionalCssClasses: ['modal-sudo-mode-verification'],
            buttons: [
                this.hasFatalError ? {
                    text: this.labels.cancel,
                    btnClass: 'btn-default',
                    trigger: () => {
                        top.location.href = this.cancelUri;
                    },
                } : {
                    text: this.labels.verify,
                    name: 'verify',
                    form: 'verify-sudo-mode',
                    btnClass: 'btn-primary',
                }
            ],
            content: html `
        <typo3-backend-security-sudo-mode-form
          .labels=${this.labels}
          .verifyActionUri=${this.verifyActionUri}
          .cancelUri=${this.cancelUri}
          .isAjax=${this.isAjax}
          .hasFatalError=${this.hasFatalError}
          .allowInstallToolPassword=${this.allowInstallToolPassword}
          .windowRef=${this.windowRef}
          @typo3:sudo-mode:verified=${() => this.dispatchEvent(new Event('typo3:sudo-mode:verified'))}
        ></typo3-backend-security-sudo-mode-form>
      `
        }).addEventListener('typo3-modal-hidden', () => {
            this.dispatchEvent(new Event('typo3:sudo-mode:finished'));
            this.remove();
        });
    }
    getPropertyValues() {
        const properties = {};
        const ctor = this.constructor;
        for (const key of ctor.elementProperties.keys()) {
            properties[key] = this[key];
        }
        return properties;
    }
};
SudoMode = __decorate([
    customElement('typo3-backend-security-sudo-mode')
], SudoMode);
export { SudoMode };
let SudoModeForm = class SudoModeForm extends SudoModeProperties {
    constructor() {
        super(...arguments);
        this.useInstallToolPassword = false;
        this.errorMessage = null;
    }
    createRenderRoot() {
        return this;
    }
    render() {
        if (this.hasFatalError) {
            return html `
        <div>
          <div class="alert alert-danger">${this.labels.verificationExpired}</div>
        </div>
      `;
        }
        return html `
      <div>
        ${this.errorMessage ? html `
          <div class="alert alert-danger" id="invalid-password">${this.labels[this.errorMessage] || this.errorMessage}</div>
        ` : nothing}
        <p>${this.useInstallToolPassword ? this.labels.sudoModeInstallToolPasswordExplanation : this.labels.sudoModeUserPasswordExplanation}</p>
        <form method="post" class="form" id="verify-sudo-mode" spellcheck="false" @submit=${(evt) => this.verifyPassword(evt)}>
          ${this.useInstallToolPassword ? nothing : html `
            <input hidden aria-hidden="true" type="text" autocomplete="username" value=${TYPO3.configuration.username}>
          `}
          <div class="form-group">
            <label class="form-label" for="password">${this.labels.password}</label>
            <input required="required" class="form-control" id="password" type="password" name="password" autofocus
                   autocomplete=${this.useInstallToolPassword ? 'section-install current-password' : 'current-password'}>
          </div>
        </form>
        ${!this.allowInstallToolPassword ? nothing : html `
          <div class="text-end">
            <a href="#" @click=${(evt) => this.toggleUseInstallToolPassword(evt)}>
              ${this.useInstallToolPassword ? this.labels.userPasswordMode : this.labels.installToolPasswordMode}
            </a>
          </div>
        `}
      </div>
    `;
    }
    updated(changedProperties) {
        if (changedProperties.has('useInstallToolPassword')) {
            this.closest('typo3-backend-modal').modalTitle = this.getModalTitle();
        }
    }
    getModalTitle() {
        if (this.hasFatalError) {
            return this.labels.verificationFailed;
        }
        if (this.useInstallToolPassword) {
            return this.labels.verifyWithInstallToolPassword;
        }
        return this.labels.verifyWithUserPassword;
    }
    async verifyPassword(evt) {
        evt.preventDefault();
        this.errorMessage = null;
        try {
            const response = await new AjaxRequest(this.verifyActionUri).post({
                password: this.passwordElement.value,
                useInstallToolPassword: this.useInstallToolPassword ? 1 : 0
            });
            const responseData = await response.resolve('application/json');
            this.dispatchEvent(new Event('typo3:sudo-mode:verified'));
            this.closest('typo3-backend-modal').hideModal();
            if (!this.isAjax && responseData.redirect) {
                const { uri } = responseData.redirect;
                const windowRef = this.windowRef ?? window;
                if (windowRef.name === 'list_frame') {
                    Viewport.ContentContainer.setUrl(uri);
                }
                else {
                    windowRef.location.assign(uri);
                }
            }
        }
        catch (e) {
            if (e instanceof AjaxResponse) {
                const response = await e.resolve('application/json');
                this.errorMessage = response.message;
            }
            else {
                throw e;
            }
        }
    }
    toggleUseInstallToolPassword(evt) {
        evt.preventDefault();
        this.useInstallToolPassword = !this.useInstallToolPassword;
    }
};
__decorate([
    state()
], SudoModeForm.prototype, "useInstallToolPassword", void 0);
__decorate([
    state()
], SudoModeForm.prototype, "errorMessage", void 0);
__decorate([
    query('#password')
], SudoModeForm.prototype, "passwordElement", void 0);
SudoModeForm = __decorate([
    customElement('typo3-backend-security-sudo-mode-form')
], SudoModeForm);
export { SudoModeForm };
