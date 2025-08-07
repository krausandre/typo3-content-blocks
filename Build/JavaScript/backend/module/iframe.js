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
import { html, LitElement, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators';
import { lll } from '@typo3/core/lit-helper';
/**
 * Module: @typo3/backend/module/iframe
 */
export const componentName = 'typo3-iframe-module';
let IframeModuleElement = class IframeModuleElement extends LitElement {
    constructor() {
        super(...arguments);
        this.endpoint = '';
    }
    attributeChangedCallback(name, old, value) {
        super.attributeChangedCallback(name, old, value);
        if (name === 'endpoint' && value === old) {
            // Trigger explicit reload if value has been reset to current value,
            // lit doesn't re-set the attribute in this case.
            this.iframe.setAttribute('src', value);
        }
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.endpoint) {
            this.dispatch('typo3-iframe-load', { url: this.endpoint, title: null });
        }
    }
    createRenderRoot() {
        // Disable shadow root as <iframe> needs to be accessible
        // via top.list_frame for legacy-code and backwards compatibility.
        return this;
    }
    render() {
        if (!this.endpoint) {
            return nothing;
        }
        return html `
      <iframe
        src="${this.endpoint}"
        name="list_frame"
        id="typo3-contentIframe"
        class="scaffold-content-module-iframe t3js-scaffold-content-module-iframe"
        title="${lll('iframe.listFrame')}"
        @load="${this._loaded}"
      ></iframe>
    `;
    }
    registerPagehideHandler(iframe) {
        try {
            iframe.contentWindow.addEventListener('pagehide', (e) => this._pagehide(e, iframe), { once: true });
        }
        catch (e) {
            console.error('Failed to access contentWindow of module iframe – using a foreign origin?');
            throw e;
        }
    }
    retrieveModuleStateFromIFrame(iframe) {
        try {
            return {
                url: iframe.contentWindow.location.href,
                title: iframe.contentDocument.title,
                module: iframe.contentDocument.body.querySelector('.module[data-module-name]')?.getAttribute('data-module-name')
            };
        }
        catch {
            console.error('Failed to access contentWindow of module iframe – using a foreign origin?');
            return { url: this.endpoint, title: null };
        }
    }
    _loaded({ target }) {
        const iframe = target;
        // The event handler for the "pagehide" event needs to be attached
        // after every iframe load (for the current iframes's contentWindow).
        this.registerPagehideHandler(iframe);
        const state = this.retrieveModuleStateFromIFrame(iframe);
        this.dispatch('typo3-iframe-loaded', state);
    }
    _pagehide(e, iframe) {
        // Asynchronous execution needed because the URL changes immediately after
        // the `pagehide` event is dispatched, but has not been changed right now.
        new Promise((resolve) => window.setTimeout(resolve, 0)).then(() => {
            if (iframe.contentWindow !== null) {
                this.dispatch('typo3-iframe-load', { url: iframe.contentWindow.location.href, title: null });
            }
        });
    }
    dispatch(type, state) {
        this.dispatchEvent(new CustomEvent(type, { detail: state, bubbles: true, composed: true }));
    }
};
__decorate([
    property({ type: String })
], IframeModuleElement.prototype, "endpoint", void 0);
__decorate([
    query('iframe', true)
], IframeModuleElement.prototype, "iframe", void 0);
IframeModuleElement = __decorate([
    customElement('typo3-iframe-module')
], IframeModuleElement);
export { IframeModuleElement };
