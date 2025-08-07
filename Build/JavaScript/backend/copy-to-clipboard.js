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
import Notification from '@typo3/backend/notification';
import { lll } from '@typo3/core/lit-helper';
export function copyToClipboard(text) {
    if (!text.length) {
        console.warn('No text for copy to clipboard given.');
        Notification.error(lll('copyToClipboard.error'));
        return;
    }
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            Notification.success(lll('copyToClipboard.success'), '', 1);
        }).catch(() => {
            Notification.error(lll('copyToClipboard.error'));
        });
    }
    else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            if (document.execCommand('copy')) {
                Notification.success(lll('copyToClipboard.success'), '', 1);
            }
            else {
                Notification.error(lll('copyToClipboard.error'));
            }
        }
        catch {
            Notification.error(lll('copyToClipboard.error'));
        }
        document.body.removeChild(textarea);
    }
}
/**
 * Module: @typo3/backend/copy-to-clipboard
 *
 * This module can be used to copy a given text to
 * the operating systems' clipboard.
 *
 * @example
 * <typo3-copy-to-clipboard text="some text">
 *   Copy to clipboard
 * </typo3-copy-to-clipboard>
 */
let CopyToClipboard = class CopyToClipboard extends LitElement {
    static { this.styles = [css `:host { cursor: pointer; appearance: button; }`]; }
    constructor() {
        super();
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyToClipboard();
        });
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.copyToClipboard();
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
    copyToClipboard() {
        if (typeof this.text !== 'string') {
            console.warn('No text for copy to clipboard given.');
            Notification.error(lll('copyToClipboard.error'));
            return;
        }
        copyToClipboard(this.text);
    }
};
__decorate([
    property({ type: String })
], CopyToClipboard.prototype, "text", void 0);
CopyToClipboard = __decorate([
    customElement('typo3-copy-to-clipboard')
], CopyToClipboard);
export { CopyToClipboard };
