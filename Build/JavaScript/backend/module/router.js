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
import { customElement, property, query } from 'lit/decorators';
import { ModuleUtility } from '@typo3/backend/module';
const IFRAME_COMPONENT = '@typo3/backend/module/iframe';
// Trigger a render cycle, even if property has been reset to
// the current value (this is to trigger a module refresh).
const alwaysUpdate = () => true;
/**
 * Module: @typo3/backend/module/router
 */
let ModuleRouter = class ModuleRouter extends LitElement {
    static { this.styles = css `
    :host {
      width: 100%;
      min-height: 100%;
      flex: 1 0 auto;
      display: flex;
      flex-direction: row;
    }
    ::slotted(*) {
      min-height: 100%;
      width: 100%;
    }
  `; }
    constructor() {
        super();
        this.module = '';
        this.endpoint = '';
        // Not a @property, since changes must not cause a module-reload
        this.sitenameFirst = false;
        this.titleComponents = null;
        this.addEventListener('typo3-module-load', ({ target, detail }) => {
            const slotName = target.getAttribute('slot');
            this.pushState({ slotName, detail });
        });
        this.addEventListener('typo3-module-loaded', ({ detail }) => {
            this.updateBrowserState(detail);
        });
        this.addEventListener('typo3-iframe-load', ({ detail }) => {
            let state = {
                slotName: IFRAME_COMPONENT,
                detail: detail
            };
            if (state.detail.url.includes(this.stateTrackerUrl + '?state=')) {
                const parts = state.detail.url.split('?state=');
                state = JSON.parse(decodeURIComponent(parts[1] || '{}'));
            }
            /*
             * Event came frame <typo3-iframe-module>, that means it may have been triggered by an
             * a) explicit iframe src attribute change or by
             * b) browser history backwards or forward navigation
             *
             * In case of b), the following code block manually synchronizes the slot attribute
             */
            if (this.slotElement.getAttribute('name') !== state.slotName) {
                // The "name" attribute of <slot> gets of out sync
                // due to browser history backwards or forward navigation.
                // Synchronize to the state as advertised by the iframe event.
                this.slotElement.setAttribute('name', state.slotName);
            }
            // Mark active and sync endpoint attribute for modules.
            // Do not reset endpoint for iframe modules as the URL has already been
            // updated and a reset would trigger a reload and another event cycle.
            this.markActive(state.slotName, this.slotElement.getAttribute('name') === IFRAME_COMPONENT ? null : state.detail.url, false);
            this.updateBrowserState(state.detail);
            // Send load event (e.g. to be handled by ModuleMenu).
            // Dispated via parent element to prevent routers own event handlers to be invoked.
            // @todo: Introduce a separate event (name) to prevent the parentElement workaround?
            this.parentElement.dispatchEvent(new CustomEvent('typo3-module-load', {
                bubbles: true,
                composed: true,
                detail: state.detail
            }));
        });
        this.addEventListener('typo3-iframe-loaded', ({ detail }) => {
            this.updateBrowserState(detail);
            this.parentElement.dispatchEvent(new CustomEvent('typo3-module-loaded', {
                bubbles: true,
                composed: true,
                detail
            }));
        });
    }
    static get observedAttributes() {
        return [
            ...super.observedAttributes,
            'sitename-first',
        ];
    }
    connectedCallback() {
        super.connectedCallback();
        this.sitenameFirst = this.hasAttribute('sitename-first');
    }
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'sitename-first') {
            this.sitenameFirst = newValue !== null;
            this.updateBrowserTitle();
        }
    }
    render() {
        const moduleData = ModuleUtility.getFromName(this.module);
        const jsModule = moduleData.component || IFRAME_COMPONENT;
        return html `<slot name="${jsModule}"></slot>`;
    }
    updated() {
        const moduleData = ModuleUtility.getFromName(this.module);
        const jsModule = moduleData.component || IFRAME_COMPONENT;
        this.markActive(jsModule, this.endpoint);
    }
    async markActive(jsModule, endpoint, forceEndpointReset = true) {
        const element = await this.getModuleElement(jsModule);
        if (endpoint && (forceEndpointReset || element.getAttribute('endpoint') !== endpoint)) {
            element.setAttribute('endpoint', endpoint);
        }
        if (!element.hasAttribute('active')) {
            element.setAttribute('active', '');
        }
        for (let previous = element.previousElementSibling; previous !== null; previous = previous.previousElementSibling) {
            previous.removeAttribute('active');
        }
        for (let next = element.nextElementSibling; next !== null; next = next.nextElementSibling) {
            next.removeAttribute('active');
        }
    }
    async getModuleElement(moduleName) {
        let element = this.querySelector(`*[slot="${moduleName}"]`);
        if (element !== null) {
            return element;
        }
        try {
            const module = await import(moduleName + '.js');
            element = this.querySelector(`*[slot="${moduleName}"]`);
            if (element !== null) {
                // The element has been created parallelly during the asynchronous module load; use that instance
                return element;
            }
            if (!('componentName' in module)) {
                throw new Error(`module ${moduleName} is missing the "componentName" export`);
            }
            element = document.createElement(module.componentName);
        }
        catch (e) {
            console.error({ msg: `Error importing ${moduleName} as backend module`, err: e });
            throw e;
        }
        element.setAttribute('slot', moduleName);
        this.appendChild(element);
        return element;
    }
    async pushState(state) {
        const url = this.stateTrackerUrl + '?state=' + encodeURIComponent(JSON.stringify(state));
        // push dummy route to iframe. to trigger an implicit browser state update
        const component = await this.getModuleElement(IFRAME_COMPONENT);
        component.setAttribute('endpoint', url);
    }
    updateBrowserTitle() {
        let { titleComponents } = this;
        if (titleComponents === null) {
            // updateBrowserState has not been invoked yet, nothing to update for now
            return;
        }
        if (this.sitenameFirst) {
            titleComponents = titleComponents.toReversed();
        }
        document.title = titleComponents.join(' · ');
    }
    updateBrowserState(state) {
        const url = new URL(state.url || '', window.location.origin);
        const params = new URLSearchParams(url.search);
        const title = 'title' in state ? state.title : '';
        // update/reset document.title if state.title is not null
        // (state.title === null indicates "keep current title")
        if (title !== null) {
            const titleComponents = [this.sitename];
            if (title !== '') {
                titleComponents.unshift(title);
            }
            this.titleComponents = titleComponents;
            this.updateBrowserTitle();
        }
        if (!params.has('token')) {
            // InstallTool doesn't use a backend-route with a token,
            // but has backend-routes that act as wrappers.
            // Rewrite the URL for display in the browser URL bar.
            // @todo: rewrite installtool as webcomponent backend
            // module in order to advertise a proper module URL on it's own
            if (params.has('install[controller]')) {
                const controller = params.get('install[controller]');
                params.delete('install[controller]');
                params.delete('install[context]');
                params.delete('install[colorScheme]');
                params.delete('install[theme]');
                url.pathname = url.pathname.replace(this.installToolPath, this.entryPoint + 'module/tools/' + controller);
            }
            else {
                // non token-urls cannot be mapped by
                // the main backend controller right now
                return;
            }
        }
        params.delete('token');
        url.search = params.toString();
        const niceUrl = url.toString();
        window.history.replaceState(state, '', niceUrl);
    }
};
__decorate([
    property({ type: String, hasChanged: alwaysUpdate })
], ModuleRouter.prototype, "module", void 0);
__decorate([
    property({ type: String, hasChanged: alwaysUpdate })
], ModuleRouter.prototype, "endpoint", void 0);
__decorate([
    property({ type: String, attribute: 'state-tracker' })
], ModuleRouter.prototype, "stateTrackerUrl", void 0);
__decorate([
    property({ type: String, attribute: 'sitename' })
], ModuleRouter.prototype, "sitename", void 0);
__decorate([
    property({ type: String, attribute: 'entry-point' })
], ModuleRouter.prototype, "entryPoint", void 0);
__decorate([
    property({ type: String, attribute: 'install-tool-path' })
], ModuleRouter.prototype, "installToolPath", void 0);
__decorate([
    query('slot', true)
], ModuleRouter.prototype, "slotElement", void 0);
ModuleRouter = __decorate([
    customElement('typo3-backend-module-router')
], ModuleRouter);
export { ModuleRouter };
