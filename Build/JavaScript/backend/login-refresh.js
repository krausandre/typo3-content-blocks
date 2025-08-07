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
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators';
import Modal, { Styles, Sizes } from '@typo3/backend/modal';
import { SeverityEnum } from './enum/severity';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Notification from '@typo3/backend/notification';
import '@typo3/backend/element/progress-bar-element';
var MarkupIdentifiers;
(function (MarkupIdentifiers) {
    MarkupIdentifiers["loginrefresh"] = "t3js-modal-loginrefresh";
    MarkupIdentifiers["lockedModal"] = "t3js-modal-backendlocked";
    MarkupIdentifiers["loginFormModal"] = "t3js-modal-backendloginform";
})(MarkupIdentifiers || (MarkupIdentifiers = {}));
/**
 * Module: @typo3/backend/login-refresh
 * @exports @typo3/backend/login-refresh
 */
class LoginRefresh {
    constructor() {
        this.intervalTime = 60;
        this.intervalId = null;
        this.backendIsLocked = false;
        this.timeoutModal = null;
        this.backendLockedModal = null;
        this.loginForm = null;
        this.requestTokenUrl = '';
        this.loginFramesetUrl = '';
        this.logoutUrl = '';
        /**
         * Creates additional data based on the security level and "submits" the form
         * via an AJAX request.
         */
        this.submitForm = async (event, form) => {
            event.preventDefault();
            const tokenResponse = await new AjaxRequest(this.requestTokenUrl).post({});
            const tokenData = await tokenResponse.resolve('application/json');
            if (!tokenData.headerName || !tokenData.requestToken) {
                return;
            }
            const passwordField = form.querySelector('input[name=p_field]');
            const useridentField = form.querySelector('input[name=userident]');
            const passwordFieldValue = passwordField.value;
            if (passwordFieldValue === '' && useridentField.value === '') {
                Notification.error(TYPO3.lang['mess.refresh_login_failed'], TYPO3.lang['mess.refresh_login_emptyPassword']);
                passwordField.focus();
                return;
            }
            if (passwordFieldValue) {
                useridentField.value = passwordFieldValue;
                passwordField.value = '';
            }
            const postData = {
                login_status: 'login'
            };
            for (const [name, value] of new FormData(form)) {
                postData[name] = value.toString();
            }
            const headers = new Headers();
            headers.set(tokenData.headerName, tokenData.requestToken);
            const response = await new AjaxRequest(form.getAttribute('action')).post(postData, { headers });
            const data = await response.resolve();
            if (data.login.success) {
                // User is logged in
                this.hideLoginForm();
            }
            else {
                Notification.error(TYPO3.lang['mess.refresh_login_failed'], TYPO3.lang['mess.refresh_login_failed_message']);
                passwordField.focus();
            }
        };
        /**
         * Periodically called task that checks if
         *
         * - the user's backend session is about to expire
         * - the user's backend session has expired
         * - the backend got locked
         *
         * and opens a dialog.
         */
        this.checkActiveSession = async () => {
            try {
                const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.login_timedout).get();
                const data = await response.resolve();
                if (data.login.locked) {
                    if (!this.backendIsLocked) {
                        this.backendIsLocked = true;
                        this.showBackendLockedModal();
                    }
                }
                else {
                    if (this.backendIsLocked) {
                        this.backendIsLocked = false;
                        this.hideBackendLockedModal();
                    }
                }
                if (!this.backendIsLocked) {
                    if (data.login.timed_out || data.login.will_time_out) {
                        if (data.login.timed_out) {
                            this.showLoginForm();
                        }
                        else {
                            this.showTimeoutModal();
                        }
                    }
                }
            }
            catch {
                this.backendIsLocked = true;
                this.showBackendLockedModal();
            }
        };
    }
    /**
     * Initialize login refresh
     */
    initialize(options) {
        if (typeof options === 'object') {
            this.applyOptions(options);
        }
        this.startTask();
    }
    /**
     * Start the task
     */
    startTask() {
        if (this.intervalId !== null) {
            return;
        }
        // set interval to 60 seconds
        const interval = this.intervalTime * 1000;
        this.intervalId = setInterval(this.checkActiveSession, interval);
    }
    /**
     * Stop the task
     */
    stopTask() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
    /**
     * Set interval time
     *
     * @param {number} intervalTime
     */
    setIntervalTime(intervalTime) {
        // To avoid the integer overflow in setInterval, we limit the interval time to be one request per day
        this.intervalTime = Math.min(intervalTime, 86400);
    }
    /**
     * Set the logout URL
     *
     * @param {string} logoutUrl
     */
    setLogoutUrl(logoutUrl) {
        this.logoutUrl = logoutUrl;
    }
    /**
     * Set login frameset url
     */
    setLoginFramesetUrl(loginFramesetUrl) {
        this.loginFramesetUrl = loginFramesetUrl;
    }
    /**
     * Shows the timeout dialog. If the backend is not focused, a Web Notification
     * is displayed, too.
     */
    showTimeoutModal() {
        this.timeoutModal = this.createTimeoutModal();
        this.timeoutModal.addEventListener('typo3-modal-hidden', () => this.timeoutModal = null);
        this.timeoutModal.addEventListener('show-login-form', () => {
            this.timeoutModal.hideModal();
            this.showLoginForm();
        });
    }
    /**
     * Hides the timeout dialog. If a Web Notification is displayed, close it too.
     */
    hideTimeoutModal() {
        this.timeoutModal?.hideModal();
    }
    /**
     * Shows the "backend locked" dialog.
     */
    showBackendLockedModal() {
        if (this.backendLockedModal) {
            return;
        }
        this.backendLockedModal = this.createBackendLockedModal();
        this.backendLockedModal.addEventListener('typo3-modal-hidden', () => this.backendLockedModal = null);
    }
    /**
     * Hides the "backend locked" dialog.
     */
    hideBackendLockedModal() {
        this.backendLockedModal?.hideModal();
    }
    /**
     * Shows the login form.
     */
    showLoginForm() {
        if (this.loginForm) {
            return;
        }
        // log off for sure
        new AjaxRequest(TYPO3.settings.ajaxUrls.logout).get().then(() => {
            if (TYPO3.configuration.showRefreshLoginPopup) {
                this.showLoginPopup();
            }
            else {
                this.loginForm = this.createLoginFormModal();
                this.loginForm.addEventListener('typo3-modal-hidden', () => this.loginForm = null);
            }
        });
    }
    /**
     * Opens the login form in a new window.
     */
    showLoginPopup() {
        const vHWin = window.open(this.loginFramesetUrl, 'relogin_' + Math.random().toString(16).slice(2), 'height=450,width=700,status=0,menubar=0,location=1');
        if (vHWin) {
            vHWin.focus();
        }
    }
    /**
     * Hides the login form.
     */
    hideLoginForm() {
        this.loginForm?.hideModal();
    }
    /**
     * Generates the modal displayed if the backend is locked.
     */
    createBackendLockedModal() {
        return Modal.advanced({
            additionalCssClasses: [MarkupIdentifiers.lockedModal],
            title: TYPO3.lang['mess.please_wait'],
            severity: SeverityEnum.notice,
            style: Styles.light,
            size: Sizes.small,
            staticBackdrop: true,
            hideCloseButton: true,
            content: html `
        <p>${TYPO3.lang['mess.be_locked']}</p>
      `
        });
    }
    /**
     * Generates the modal displayed on near session time outs
     */
    createTimeoutModal() {
        const modal = Modal.advanced({
            additionalCssClasses: [MarkupIdentifiers.loginrefresh],
            title: TYPO3.lang['mess.login_about_to_expire_title'],
            severity: SeverityEnum.notice,
            style: Styles.light,
            size: Sizes.small,
            staticBackdrop: true,
            hideCloseButton: true,
            buttons: [
                {
                    text: TYPO3.lang['mess.refresh_login_logout_button'],
                    active: false,
                    btnClass: 'btn-default',
                    name: 'logout',
                    trigger: () => top.location.href = this.logoutUrl
                },
                {
                    text: TYPO3.lang['mess.refresh_login_refresh_button'],
                    active: true,
                    btnClass: 'btn-primary',
                    name: 'refreshSession',
                    trigger: async (e, modal) => {
                        const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.login_refresh).get();
                        const data = await response.resolve();
                        modal.hideModal();
                        if (!data.refresh.success) {
                            modal.dispatchEvent(new Event('show-login-form'));
                        }
                    }
                }
            ],
            content: html `
        <p>${TYPO3.lang['mess.login_about_to_expire']}</p>
        <typo3-login-refresh-progress-bar
          @progress-bar-overdue=${() => modal.dispatchEvent(new Event('show-login-form'))}
          ></typo3-login-refresh-progress-bar>
      `
        });
        modal.addEventListener('typo3-modal-hidden', () => {
            this.startTask();
        });
        modal.addEventListener('typo3-modal-shown', () => {
            this.stopTask();
        });
        return modal;
    }
    /**
     * Generates the login form displayed if the session has timed out.
     */
    createLoginFormModal() {
        const refresh_login_title = String(TYPO3.lang['mess.refresh_login_title']).replace('%s', TYPO3.configuration.username);
        const modal = Modal.advanced({
            additionalCssClasses: [MarkupIdentifiers.loginFormModal],
            title: refresh_login_title,
            severity: SeverityEnum.notice,
            style: Styles.light,
            size: Sizes.small,
            staticBackdrop: true,
            hideCloseButton: true,
            buttons: [
                {
                    text: TYPO3.lang['mess.refresh_exit_button'],
                    active: false,
                    btnClass: 'btn-default',
                    name: 'logout',
                    trigger: () => top.location.href = this.logoutUrl
                },
                {
                    text: TYPO3.lang['mess.refresh_login_button'],
                    active: false,
                    btnClass: 'btn-primary',
                    name: 'refreshSession',
                    trigger: async (e, modal) => {
                        modal.querySelector('form').requestSubmit();
                        const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.login_refresh).get();
                        const data = await response.resolve();
                        modal.hideModal();
                        if (!data.refresh.success) {
                            modal.dispatchEvent(new Event('show-login-form'));
                        }
                    }
                }
            ],
            content: html `
        <p>${TYPO3.lang['mess.login_expired']}</p>
        <form
            id="beLoginRefresh"
            method="POST"
            action=${TYPO3.settings.ajaxUrls.login}
            @submit=${(e) => this.submitForm(e, e.currentTarget)}>
          <div>
            <input
                type="text"
                name="username"
                class="d-none"
                autocomplete="username"
                .value=${TYPO3.configuration.username}>
            <input
                type="hidden"
                name="userident"
                id="t3-loginrefresh-userident">
          </div>
          <div class="form-group">
            <input
                type="password"
                name="p_field"
                autofocus
                class="form-control"
                autocomplete="current-password"
                placeholder=${TYPO3.lang['mess.refresh_login_password']}>
          </div>
        </form>
      `
        });
        modal.addEventListener('typo3-modal-hidden', () => {
            this.startTask();
        });
        modal.addEventListener('typo3-modal-shown', () => {
            this.stopTask();
        });
        return modal;
    }
    applyOptions(options) {
        if (options.intervalTime !== undefined) {
            this.setIntervalTime(options.intervalTime);
        }
        if (options.loginFramesetUrl !== undefined) {
            this.setLoginFramesetUrl(options.loginFramesetUrl);
        }
        if (options.logoutUrl !== undefined) {
            this.setLogoutUrl(options.logoutUrl);
        }
        if (options.requestTokenUrl !== undefined) {
            this.requestTokenUrl = options.requestTokenUrl;
        }
    }
}
let SelfFillingProgressBarElement = class SelfFillingProgressBarElement extends LitElement {
    constructor() {
        super(...arguments);
        this.current = 0;
        this.max = 100;
        this.advanceProgressBar = () => {
            this.current++;
            const isOverdue = (this.current >= this.max);
            if (isOverdue) {
                this.dispatchEvent(new Event('progress-bar-overdue'));
            }
        };
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(this.advanceProgressBar, 300);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    createRenderRoot() {
        return this;
    }
    render() {
        return html `
      <typo3-backend-progress-bar value=${100 - this.current} max="100"></typo3-backend-progress-bar>
    `;
    }
};
__decorate([
    state()
], SelfFillingProgressBarElement.prototype, "current", void 0);
SelfFillingProgressBarElement = __decorate([
    customElement('typo3-login-refresh-progress-bar')
], SelfFillingProgressBarElement);
export { SelfFillingProgressBarElement };
let loginRefreshObject;
try {
    // fetch from opening window
    if (window.opener && window.opener.TYPO3 && window.opener.TYPO3.LoginRefresh) {
        loginRefreshObject = window.opener.TYPO3.LoginRefresh;
    }
    // fetch from parent
    if (parent && parent.window.TYPO3 && parent.window.TYPO3.LoginRefresh) {
        loginRefreshObject = parent.window.TYPO3.LoginRefresh;
    }
    // fetch object from outer frame
    if (top && top.TYPO3 && top.TYPO3.LoginRefresh) {
        loginRefreshObject = top.TYPO3.LoginRefresh;
    }
}
catch {
    // This only happens if the opener, parent or top is some other url (eg a local file)
    // which loaded the current window. Then the browser's cross domain policy jumps in
    // and raises an exception.
    // For this case we are safe and we can create our global object below.
}
if (!loginRefreshObject) {
    loginRefreshObject = new LoginRefresh();
    // attach to global frame
    if (typeof TYPO3 !== 'undefined') {
        TYPO3.LoginRefresh = loginRefreshObject;
    }
}
export default loginRefreshObject;
