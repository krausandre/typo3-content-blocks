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
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Notification from '@typo3/backend/notification';
var Modes;
(function (Modes) {
    Modes["switch"] = "switch";
    Modes["exit"] = "exit";
})(Modes || (Modes = {}));
/**
 * Module: @typo3/backend/switch-user
 *
 * @example
 * <typo3-switch-user class="some" targetUser="123" mode="switch">
 *   Switch user
 * </typo3-switch-user>
 */
let SwitchUser = class SwitchUser extends LitElement {
    static { this.styles = [css `:host { cursor: pointer; appearance: button; }`]; }
    constructor() {
        super();
        this.mode = Modes.switch;
        this.addEventListener('click', (event) => {
            event.preventDefault();
            if (this.mode === Modes.switch) {
                this.handleSwitchUser();
            }
            else if (this.mode === Modes.exit) {
                this.handleExitSwitchUser();
            }
        });
        this.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (this.mode === Modes.switch) {
                    this.handleSwitchUser();
                }
                else if (this.mode === Modes.exit) {
                    this.handleExitSwitchUser();
                }
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
    handleSwitchUser() {
        if (!this.targetUser) {
            // Invalid request without target user
            Notification.error('Switching to user went wrong.');
            return;
        }
        (new AjaxRequest(TYPO3.settings.ajaxUrls.switch_user)).post({
            targetUser: this.targetUser,
        }).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.url) {
                top.window.location.href = data.url;
            }
            else {
                Notification.error('Switching to user went wrong.');
            }
        });
    }
    handleExitSwitchUser() {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.switch_user_exit)).post({}).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.url) {
                top.window.location.href = data.url;
            }
            else {
                Notification.error('Exiting current user went wrong.');
            }
        });
    }
};
__decorate([
    property({ type: String })
], SwitchUser.prototype, "targetUser", void 0);
__decorate([
    property({ type: Modes })
], SwitchUser.prototype, "mode", void 0);
SwitchUser = __decorate([
    customElement('typo3-backend-switch-user')
], SwitchUser);
export { SwitchUser };
