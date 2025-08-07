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
import { customElement, property, state } from 'lit/decorators';
import { lll } from '@typo3/core/lit-helper';
import Persistent from '../storage/persistent';
import '@typo3/backend/element/icon-element';
const selectorConverter = {
    fromAttribute(selector) {
        return document.querySelector(selector);
    }
};
var ReadingModeDirection;
(function (ReadingModeDirection) {
    ReadingModeDirection["ltr"] = "ltr";
    ReadingModeDirection["rtl"] = "rtl";
})(ReadingModeDirection || (ReadingModeDirection = {}));
class ReadingMode {
    static get() {
        return document.querySelector('html').dir === 'rtl' ? ReadingModeDirection.rtl : ReadingModeDirection.ltr;
    }
}
let ResizableNavigation = class ResizableNavigation extends LitElement {
    constructor() {
        super(...arguments);
        this.minimumWidth = 250;
        this.resizing = false;
        this.toggleNavigation = (event) => {
            event.stopPropagation();
            this.parentContainer.classList.toggle('scaffold-content-navigation-expanded');
            if (event.currentTarget instanceof HTMLElement) {
                const sibling = (event.currentTarget.nextElementSibling ?? event.currentTarget.previousElementSibling);
                sibling.focus();
            }
        };
        this.fallbackNavigationSizeIfNeeded = (event) => {
            const window = event.currentTarget;
            if (this.getNavigationWidth() === 0) {
                return;
            }
            if (window.outerWidth < this.getNavigationWidth() + this.getNavigationPosition().left + this.minimumWidth) {
                this.autoNavigationWidth();
            }
        };
        this.handleMouseMove = (event) => {
            this.resizeNavigation(event.clientX);
        };
        this.handleTouchMove = (event) => {
            this.resizeNavigation(event.changedTouches[0].clientX);
        };
        this.resizeNavigation = (position) => {
            let width = 0;
            if (ReadingMode.get() === ReadingModeDirection.ltr) {
                width = Math.round(position) - Math.round(this.getNavigationPosition().left);
            }
            else {
                width = Math.round(this.getNavigationPosition().right) - Math.round(position);
            }
            this.setNavigationWidth(width);
        };
        this.startResizeNavigation = (event) => {
            if (event instanceof MouseEvent && event.button === 2) {
                return;
            }
            event.stopPropagation();
            this.resizing = true;
            document.addEventListener('mousemove', this.handleMouseMove, false);
            document.addEventListener('mouseup', this.stopResizeNavigation, false);
            document.addEventListener('touchmove', this.handleTouchMove, false);
            document.addEventListener('touchend', this.stopResizeNavigation, false);
        };
        this.stopResizeNavigation = () => {
            this.resizing = false;
            document.removeEventListener('mousemove', this.handleMouseMove, false);
            document.removeEventListener('mouseup', this.stopResizeNavigation, false);
            document.removeEventListener('touchmove', this.handleTouchMove, false);
            document.removeEventListener('touchend', this.stopResizeNavigation, false);
            Persistent.set(this.persistenceIdentifier, this.getNavigationWidth());
            document.dispatchEvent(new CustomEvent('typo3:navigation:resized'));
        };
    }
    connectedCallback() {
        super.connectedCallback();
        const initialWidth = this.initialWidth || parseInt(Persistent.get(this.persistenceIdentifier), 10);
        this.setNavigationWidth(initialWidth);
        window.addEventListener('resize', this.fallbackNavigationSizeIfNeeded, { passive: true });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this.fallbackNavigationSizeIfNeeded);
    }
    // disable shadow dom
    createRenderRoot() {
        return this;
    }
    async firstUpdated() {
        // Give the browser a chance to paint
        await new Promise((r) => setTimeout(r, 0));
        // needed to avoid any issues related to browsers, as lit-decorators (eventOptions) do not work yet
        // properly https://lit-element.polymer-project.org/guide/events - @touchstart would throw warnings in browser console without passive=true
        this.querySelector('.scaffold-content-navigation-switcher-btn').addEventListener('touchstart', this.toggleNavigation, { passive: true });
        this.querySelector('.scaffold-content-navigation-drag').addEventListener('touchstart', this.startResizeNavigation, { passive: true });
    }
    render() {
        return html `
      <div class="scaffold-content-navigation-switcher">
        <button @click="${this.toggleNavigation}" class="btn btn-sm btn-default btn-borderless scaffold-content-navigation-switcher-btn scaffold-content-navigation-switcher-open" role="button" title="${lll('viewport_navigation_show')}">
          <typo3-backend-icon identifier="actions-chevron-right" size="small"></typo3-backend-icon>
        </button>
        <button @click="${this.toggleNavigation}" class="btn btn-sm btn-default btn-borderless scaffold-content-navigation-switcher-btn scaffold-content-navigation-switcher-close" role="button" title="${lll('viewport_navigation_hide')}">
          <typo3-backend-icon identifier="actions-chevron-left" size="small"></typo3-backend-icon>
        </button>
      </div>
      <div @mousedown="${this.startResizeNavigation}" class="scaffold-content-navigation-drag ${this.resizing ? 'resizing' : ''}"></div>
    `;
    }
    getNavigationPosition() {
        return this.navigationContainer.getBoundingClientRect();
    }
    getNavigationWidth() {
        return this.navigationContainer.offsetWidth;
    }
    autoNavigationWidth() {
        this.navigationContainer.style.width = 'auto';
    }
    setNavigationWidth(width) {
        // Allow only 50% of the main document
        const maxWidth = Math.round(this.parentContainer.getBoundingClientRect().width / 2);
        if (width > maxWidth) {
            width = maxWidth;
        }
        width = width > this.minimumWidth ? width : this.minimumWidth;
        this.navigationContainer.style.width = width + 'px';
    }
};
__decorate([
    property({ type: Number, attribute: 'minimum-width' })
], ResizableNavigation.prototype, "minimumWidth", void 0);
__decorate([
    property({ type: Number, attribute: 'initial-width' })
], ResizableNavigation.prototype, "initialWidth", void 0);
__decorate([
    property({ type: String, attribute: 'persistence-identifier' })
], ResizableNavigation.prototype, "persistenceIdentifier", void 0);
__decorate([
    property({ attribute: 'parent', converter: selectorConverter })
], ResizableNavigation.prototype, "parentContainer", void 0);
__decorate([
    property({ attribute: 'navigation', converter: selectorConverter })
], ResizableNavigation.prototype, "navigationContainer", void 0);
__decorate([
    state()
], ResizableNavigation.prototype, "resizing", void 0);
ResizableNavigation = __decorate([
    customElement('typo3-backend-navigation-switcher')
], ResizableNavigation);
export { ResizableNavigation };
