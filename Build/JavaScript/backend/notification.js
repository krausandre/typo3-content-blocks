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
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { classMap } from 'lit/directives/class-map';
import { ifDefined } from 'lit/directives/if-defined';
import { SeverityEnum } from './enum/severity';
import Severity from './severity';
import '@typo3/backend/element/icon-element';
import { lll } from '@typo3/core/lit-helper';
/**
 * Module: @typo3/backend/notification
 * Notification API for the TYPO3 backend
 */
class Notification {
    static { this.duration = 5; }
    static { this.showClearAllButtonCount = 2; }
    static { this.totalNotifications = 0; }
    static { this.messageContainer = null; }
    static { this.notificationList = null; }
    static { this.clearAllButton = null; }
    /**
     * Show a notice notification
     *
     * @param {string} title
     * @param {string} message
     * @param {number} duration
     * @param {Action[]} actions
     */
    static notice(title, message, duration, actions) {
        Notification.showMessage(title, message, SeverityEnum.notice, duration, actions);
    }
    /**
     * Show a info notification
     *
     * @param {string} title
     * @param {string} message
     * @param {number} duration
     * @param {Action[]} actions
     */
    static info(title, message, duration, actions) {
        Notification.showMessage(title, message, SeverityEnum.info, duration, actions);
    }
    /**
     * Show a success notification
     *
     * @param {string} title
     * @param {string} message
     * @param {number} duration
     * @param {Action[]} actions
     */
    static success(title, message, duration, actions) {
        Notification.showMessage(title, message, SeverityEnum.ok, duration, actions);
    }
    /**
     * Show a warning notification
     *
     * @param {string} title
     * @param {string} message
     * @param {number} duration
     * @param {Action[]} actions
     */
    static warning(title, message, duration, actions) {
        Notification.showMessage(title, message, SeverityEnum.warning, duration, actions);
    }
    /**
     * Show a error notification
     *
     * @param {string} title
     * @param {string} message
     * @param {number} duration
     * @param {Action[]} actions
     */
    static error(title, message, duration = 0, actions) {
        Notification.showMessage(title, message, SeverityEnum.error, duration, actions);
    }
    /**
     * @param {string} title
     * @param {string} message
     * @param {SeverityEnum} severity
     * @param {number} duration
     * @param {Action[]} actions
     */
    static showMessage(title, message, severity = SeverityEnum.info, duration, actions = []) {
        if (typeof duration === 'undefined') {
            duration = (severity === SeverityEnum.error) ? 0 : this.duration;
        }
        if (this.messageContainer === null || document.getElementById('alert-container') === null) {
            this.messageContainer = document.createElement('div');
            this.messageContainer.setAttribute('id', 'alert-container');
            this.notificationList = document.createElement('div');
            this.notificationList.setAttribute('class', 'alert-list');
            // Enable focusing for keyboard scrolling (accessibility)
            this.notificationList.setAttribute('tabindex', '0');
            this.messageContainer.appendChild(this.notificationList);
            this.clearAllButton = document.createElement('typo3-notification-clear-all');
            this.containerItemVisibility();
            this.messageContainer.prepend(this.clearAllButton);
            document.body.appendChild(this.messageContainer);
            document.addEventListener('typo3-notification-open', () => {
                this.totalNotifications++;
                this.containerItemVisibility();
            });
            document.addEventListener('typo3-notification-clear', () => {
                // Avoid negative value
                if (this.totalNotifications > 0) {
                    this.totalNotifications--;
                }
                this.containerItemVisibility();
            });
        }
        const box = document.createElement('typo3-notification-message');
        box.setAttribute('notification-id', 'notification-' + Math.random().toString(36).substring(2, 6));
        box.setAttribute('notification-title', title);
        if (message) {
            box.setAttribute('notification-message', message);
        }
        box.setAttribute('notification-severity', severity.toString());
        box.setAttribute('notification-duration', duration.toString());
        box.actions = actions;
        // Wait for the animation to finish, before scrolling into view
        setTimeout(() => {
            this.notificationList.querySelector('typo3-notification-message:last-child').scrollIntoView();
        }, Number(duration));
        this.notificationList.appendChild(box);
    }
    static containerItemVisibility() {
        this.clearAllButton.hidden = this.totalNotifications < this.showClearAllButtonCount;
        this.messageContainer.hidden = this.totalNotifications === 0;
    }
}
let ClearNotificationMessages = class ClearNotificationMessages extends LitElement {
    async clearAll() {
        this.dispatchEvent(new CustomEvent('typo3-notification-clear-all', { bubbles: true, composed: true }));
        this.hidden = true;
    }
    createRenderRoot() {
        return this;
    }
    render() {
        return html `<div><button @click=${() => this.clearAll()} class="btn btn-default">
      <typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon> ${lll('button.clearAll') || 'Clear all'}
    </button></div>`;
    }
};
__decorate([
    property({ type: String, attribute: 'notification-container' })
], ClearNotificationMessages.prototype, "notificationId", void 0);
ClearNotificationMessages = __decorate([
    customElement('typo3-notification-clear-all')
], ClearNotificationMessages);
export { ClearNotificationMessages };
let NotificationMessage = class NotificationMessage extends LitElement {
    constructor() {
        super(...arguments);
        this.notificationSeverity = SeverityEnum.info;
        this.notificationDuration = 0;
        this.actions = [];
        this.executingAction = -1;
    }
    async firstUpdated() {
        document.addEventListener('typo3-notification-clear-all', async () => {
            this.clear();
        });
        const event = new CustomEvent('typo3-notification-open', { bubbles: true, composed: true });
        this.dispatchEvent(event);
        await new Promise(resolve => window.setTimeout(resolve, 200));
        await this.requestUpdate();
        if (this.notificationDuration > 0) {
            await new Promise(resolve => window.setTimeout(resolve, this.notificationDuration * 1000));
            this.clear();
        }
    }
    async clear() {
        this.dispatchEvent(new CustomEvent('typo3-notification-clear', { bubbles: true, composed: true }));
        this.addEventListener('typo3-notification-clear-finish', () => {
            this.parentNode?.removeChild(this);
        });
        const dispatchFinishEvent = () => {
            this.dispatchEvent(new CustomEvent('typo3-notification-clear-finish'));
        };
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion && 'animate' in this) {
            this.style.overflow = 'hidden';
            this.style.display = 'block';
            this.animate([
                { height: this.getBoundingClientRect().height + 'px' },
                { height: 0, opacity: 0, marginTop: 0 },
            ], {
                duration: 400,
                easing: 'cubic-bezier(.02, .01, .47, 1)'
            }).onfinish = dispatchFinishEvent;
        }
        else {
            dispatchFinishEvent();
        }
    }
    createRenderRoot() {
        return this;
    }
    render() {
        const className = Severity.getCssClass(this.notificationSeverity);
        let icon = '';
        switch (this.notificationSeverity) {
            case SeverityEnum.notice:
                icon = 'actions-lightbulb';
                break;
            case SeverityEnum.ok:
                icon = 'actions-check';
                break;
            case SeverityEnum.warning:
                icon = 'actions-exclamation';
                break;
            case SeverityEnum.error:
                icon = 'actions-close';
                break;
            case SeverityEnum.info:
            default:
                icon = 'actions-info';
        }
        const randomSuffix = (Math.random() + 1).toString(36).substring(2);
        /* eslint-disable @stylistic/indent */
        return html `
      <div
        id="${ifDefined(this.notificationId || undefined)}"
        class="alert alert-${className} alert-dismissible"
        role="alertdialog"
        aria-labelledby="alert-title-${randomSuffix}"
        aria-describedby="alert-message-${randomSuffix}"
      >
        <button type="button" class="close" @click="${async () => this.clear()}">
          <span aria-hidden="true"><typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon></span>
          <span class="visually-hidden">Close</span>
        </button>
        <div class="alert-inner">
          <div class="alert-icon">
            <span class="icon-emphasized">
              <typo3-backend-icon identifier="${icon}" size="small"></typo3-backend-icon>
            </span>
          </div>
          <div class="alert-content">
            <div class="alert-title" id="alert-title-${randomSuffix}">${this.notificationTitle}</div>
            <p class="alert-message" id="alert-message-${randomSuffix}">${this.notificationMessage ? this.notificationMessage : ''}</p>
          </div>
        </div>
        ${this.actions.length === 0 ? '' : html `
          <div class="alert-actions">
            ${this.actions.map((action, index) => html `
              <a href="#"
                 title="${action.label}"
                 @click="${async (event) => {
            event.preventDefault();
            this.executingAction = index;
            await this.updateComplete;
            if ('action' in action) {
                await action.action.execute(event.currentTarget);
            }
            this.clear();
        }}"
                 class="${classMap({
            executing: this.executingAction === index,
            disabled: this.executingAction >= 0 && this.executingAction !== index
        })}"
                >${action.label}</a>
            `)}
          </div>
        `}
      </div>
    `;
        /* eslint-enable @stylistic/indent */
    }
};
__decorate([
    property({ type: String, attribute: 'notification-id' })
], NotificationMessage.prototype, "notificationId", void 0);
__decorate([
    property({ type: String, attribute: 'notification-title' })
], NotificationMessage.prototype, "notificationTitle", void 0);
__decorate([
    property({ type: String, attribute: 'notification-message' })
], NotificationMessage.prototype, "notificationMessage", void 0);
__decorate([
    property({ type: Number, attribute: 'notification-severity' })
], NotificationMessage.prototype, "notificationSeverity", void 0);
__decorate([
    property({ type: Number, attribute: 'notification-duration' })
], NotificationMessage.prototype, "notificationDuration", void 0);
__decorate([
    property({ type: Array, attribute: false })
], NotificationMessage.prototype, "actions", void 0);
__decorate([
    state()
], NotificationMessage.prototype, "executingAction", void 0);
NotificationMessage = __decorate([
    customElement('typo3-notification-message')
], NotificationMessage);
export { NotificationMessage };
let notificationObject;
try {
    // fetch from parent
    if (parent && parent.window.TYPO3 && parent.window.TYPO3.Notification) {
        notificationObject = parent.window.TYPO3.Notification;
    }
    // fetch object from outer frame
    if (top && top.TYPO3.Notification) {
        notificationObject = top.TYPO3.Notification;
    }
}
catch {
    // This only happens if the opener, parent or top is some other url (eg a local file)
    // which loaded the current window. Then the browser's cross domain policy jumps in
    // and raises an exception.
    // For this case we are safe and we can create our global object below.
}
if (!notificationObject) {
    notificationObject = Notification;
    // attach to global frame
    if (typeof TYPO3 !== 'undefined') {
        TYPO3.Notification = notificationObject;
    }
}
export default notificationObject;
