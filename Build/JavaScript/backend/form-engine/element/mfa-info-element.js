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
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
import Notification from '@typo3/backend/notification';
import Modal from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import { selector } from '@typo3/core/literals';
import { sudoModeInterceptor } from '@typo3/backend/security/sudo-mode-interceptor';
var Selectors;
(function (Selectors) {
    Selectors["deactivteProviderButton"] = ".t3js-deactivate-provider-button";
    Selectors["deactivteMfaButton"] = ".t3js-deactivate-mfa-button";
    Selectors["providerslist"] = ".t3js-mfa-active-providers-list";
    Selectors["mfaStatusLabel"] = ".t3js-mfa-status-label";
})(Selectors || (Selectors = {}));
class MfaInfoElement {
    constructor(selector, options) {
        this.options = null;
        this.fullElement = null;
        this.deactivteProviderButtons = null;
        this.deactivteMfaButton = null;
        this.providersList = null;
        this.mfaStatusLabel = null;
        this.request = null;
        this.options = options;
        DocumentService.ready().then((document) => {
            this.fullElement = document.querySelector(selector);
            this.deactivteProviderButtons = this.fullElement.querySelectorAll(Selectors.deactivteProviderButton);
            this.deactivteMfaButton = this.fullElement.querySelector(Selectors.deactivteMfaButton);
            this.providersList = this.fullElement.querySelector(Selectors.providerslist);
            this.mfaStatusLabel = this.fullElement.parentElement.querySelector(Selectors.mfaStatusLabel);
            this.registerEvents();
        });
    }
    registerEvents() {
        new RegularEvent('click', (e) => {
            e.preventDefault();
            this.prepareDeactivateRequest(this.deactivteMfaButton);
        }).bindTo(this.deactivteMfaButton);
        this.deactivteProviderButtons.forEach((buttonElement) => {
            new RegularEvent('click', (e) => {
                e.preventDefault();
                this.prepareDeactivateRequest(buttonElement);
            }).bindTo(buttonElement);
        });
    }
    prepareDeactivateRequest(button) {
        const modal = Modal.show(button.dataset.confirmationTitle || button.getAttribute('title') || 'Deactivate provider(s)', button.dataset.confirmationContent || 'Are you sure you want to continue? This action cannot be undone and will be applied immediately!', SeverityEnum.warning, [
            {
                text: button.dataset.confirmationCancelText || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                name: 'cancel'
            },
            {
                text: button.dataset.confirmationDeactivateText || 'Deactivate',
                btnClass: 'btn-warning',
                name: 'deactivate',
                trigger: () => {
                    this.sendDeactivateRequest(button.dataset.provider);
                }
            }
        ]);
        modal.addEventListener('button.clicked', () => {
            modal.hideModal();
        });
    }
    sendDeactivateRequest(provider) {
        if (this.request instanceof AjaxRequest) {
            this.request.abort();
        }
        this.request = (new AjaxRequest(TYPO3.settings.ajaxUrls.mfa)).addMiddleware(sudoModeInterceptor);
        this.request.post({
            action: 'deactivate',
            provider: provider,
            userId: this.options.userId,
            tableName: this.options.tableName
        }).then(async (response) => {
            const data = await response.resolve();
            if (data.status.length > 0) {
                data.status.forEach((status) => {
                    if (data.success) {
                        Notification.success(status.title, status.message);
                    }
                    else {
                        Notification.error(status.title, status.message);
                    }
                });
            }
            if (!data.success) {
                return;
            }
            if (provider === undefined || data.remaining === 0) {
                this.deactivateMfa();
                return;
            }
            if (this.providersList === null) {
                return;
            }
            const providerEntry = this.providersList.querySelector(selector `li#provider-${provider}`);
            if (providerEntry === null) {
                return;
            }
            providerEntry.remove();
            const providerEntries = this.providersList.querySelectorAll('li');
            if (providerEntries.length === 0) {
                this.deactivateMfa();
            }
        }).finally(() => {
            this.request = null;
        });
    }
    deactivateMfa() {
        this.deactivteMfaButton.classList.add('disabled');
        this.deactivteMfaButton.setAttribute('disabled', 'disabled');
        if (this.providersList !== null) {
            this.providersList.remove();
        }
        if (this.mfaStatusLabel !== null) {
            this.mfaStatusLabel.innerText = this.mfaStatusLabel.dataset.alternativeLabel;
            this.mfaStatusLabel.classList.remove('badge-success');
            this.mfaStatusLabel.classList.add('badge-danger');
        }
    }
}
export default MfaInfoElement;
