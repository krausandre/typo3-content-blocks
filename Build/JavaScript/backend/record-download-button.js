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
import { SeverityEnum } from '@typo3/backend/enum/severity';
import Severity from '@typo3/backend/severity';
import Modal from '@typo3/backend/modal';
import { lll } from '@typo3/core/lit-helper';
var Selectors;
(function (Selectors) {
    Selectors["formatSelector"] = ".t3js-record-download-format-selector";
    Selectors["formatOptions"] = ".t3js-record-download-format-option";
})(Selectors || (Selectors = {}));
/**
 * Module: @typo3/backend/record-download-button
 *
 * @example
 * <typo3-recordlist-record-download-button url="/url/to/configuration/form" subject="Download records" ok="Download" close="Cancel">
 *   <button>Download records/button>
 * </typo3-recordlist-record-download-button>
 */
let RecordDownloadButton = class RecordDownloadButton extends LitElement {
    static { this.styles = [css `:host { cursor: pointer; appearance: button; }`]; }
    constructor() {
        super();
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.showDownloadConfigurationModal();
        });
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showDownloadConfigurationModal();
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
    showDownloadConfigurationModal() {
        if (!this.url) {
            // Don't render modal in case no url is given
            return;
        }
        const modal = Modal.advanced({
            content: this.url,
            title: this.subject || 'Download records',
            severity: SeverityEnum.notice,
            size: Modal.sizes.small,
            type: Modal.types.ajax,
            buttons: [
                {
                    text: this.close || lll('button.close') || 'Close',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                    trigger: () => modal.hideModal(),
                },
                {
                    text: this.ok || lll('button.ok') || 'Download',
                    btnClass: 'btn-' + Severity.getCssClass(SeverityEnum.info),
                    name: 'download',
                    trigger: () => {
                        const form = modal.querySelector('form');
                        form?.submit();
                        modal.hideModal();
                    }
                }
            ],
            ajaxCallback: () => {
                const formatSelect = modal.querySelector(Selectors.formatSelector);
                const formatOptions = modal.querySelectorAll(Selectors.formatOptions);
                if (formatSelect === null || !formatOptions.length) {
                    // Return in case elements do not exist in the ajax loaded modal content
                    return;
                }
                formatSelect.addEventListener('change', (e) => {
                    const selectetFormat = e.target.value;
                    formatOptions.forEach((option) => {
                        if (option.dataset.formatname !== selectetFormat) {
                            option.classList.add('hide');
                        }
                        else {
                            option.classList.remove('hide');
                        }
                    });
                });
            }
        });
    }
};
__decorate([
    property({ type: String })
], RecordDownloadButton.prototype, "url", void 0);
__decorate([
    property({ type: String })
], RecordDownloadButton.prototype, "subject", void 0);
__decorate([
    property({ type: String })
], RecordDownloadButton.prototype, "ok", void 0);
__decorate([
    property({ type: String })
], RecordDownloadButton.prototype, "close", void 0);
RecordDownloadButton = __decorate([
    customElement('typo3-recordlist-record-download-button')
], RecordDownloadButton);
export { RecordDownloadButton };
