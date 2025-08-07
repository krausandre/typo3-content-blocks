/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read theÍ
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
import { customElement, property, state } from 'lit/decorators';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import '@typo3/backend/element/icon-element';
let ColorSchemeSwitchElement = class ColorSchemeSwitchElement extends LitElement {
    constructor() {
        super(...arguments);
        this.activeColorScheme = null;
        this.colorSchemes = null;
        this.advancedOptionsExpanded = false;
        this.autoDetect = null;
        this.mql = null;
        this.mediaQueryListener = (mql) => this.autoDetect = mql.matches ? 'dark' : 'light';
    }
    connectedCallback() {
        super.connectedCallback();
        this.mql = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQueryListener(this.mql);
        this.mql.addEventListener('change', this.mediaQueryListener);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.mql.removeEventListener('change', this.mediaQueryListener);
        this.mql = null;
    }
    createRenderRoot() {
        return this;
    }
    getRealColorScheme() {
        if (this.activeColorScheme === 'auto') {
            return this.autoDetect ?? 'light';
        }
        return this.activeColorScheme ?? 'light';
    }
    render() {
        return html `
      <div class="btn-group">
        <button
            type="button"
            class="btn btn-default"
            title=${this.label}
            @click=${(e) => this.toggle(e)}
        >
          <typo3-backend-icon identifier=${this.getIcon(this.activeColorScheme ?? 'auto')} size="small"></typo3-backend-icon>
          ${this.getLabel(this.getRealColorScheme())}
          <typo3-backend-icon identifier="actions-exchange" size="small" style="margin-left: auto;"></typo3-backend-icon>
        </button>

        <button
            type="button"
            class="btn btn-default ${this.advancedOptionsExpanded ? 'active' : ''}"
            aria-haspopup="true"
            aria-expanded=${this.advancedOptionsExpanded ? 'true' : 'false'}
            @click=${(e) => { e.stopPropagation(); this.advancedOptionsExpanded = !this.advancedOptionsExpanded; }}
            >
          <span class="visually-hidden">Show more options</span>
          <typo3-backend-icon identifier=${this.advancedOptionsExpanded ? 'actions-chevron-up' : 'actions-chevron-down'} size="small"></typo3-backend-icon>
        </button>
      </div>
      ${this.advancedOptionsExpanded === false ? nothing : html `
        <ul class="dropdown-list">
          ${this.colorSchemes.map(item => this.renderItem(item))}
        </ul>
      `}
    `;
    }
    getIcon(colorScheme) {
        return this.colorSchemes.find(cs => cs.value === colorScheme)?.icon ?? 'auto';
    }
    getLabel(colorScheme) {
        return this.colorSchemes.find(cs => cs.value === colorScheme)?.label ?? '';
    }
    renderItem(colorScheme) {
        return html `
      <li>
        <button class="dropdown-item" @click="${(e) => this.handleClick(e, colorScheme.value)}" aria-current="${this.activeColorScheme === colorScheme.value ? 'true' : 'false'}">
          <span class="dropdown-item-columns">
            <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
              <typo3-backend-icon identifier="${colorScheme.icon}" size="small"></typo3-backend-icon>
            </span>
            <span class="dropdown-item-column dropdown-item-column-title">
              ${colorScheme.label}
              ${colorScheme.value === 'auto' ? html `<span class="dropdown-item-column-title-info">${this.getLabel(this.autoDetect)}</span>` : ''}
            </span>
            ${this.activeColorScheme === colorScheme.value ? html `
              <span class="text-primary">
                <typo3-backend-icon identifier="actions-dot" size="small"></typo3-backend-icon>
              </span>
            ` : html `
              <typo3-backend-icon identifier="empty-empty" size="small"></typo3-backend-icon>
            `}
          </span>
        </button>
      </li>
    `;
    }
    async toggle(e) {
        e.preventDefault();
        e.stopPropagation();
        const currentColorScheme = this.getRealColorScheme();
        let colorScheme = currentColorScheme === 'dark' ? 'light' : 'dark';
        if (colorScheme === this.autoDetect) {
            // Set to auto if the user toggled to the
            // OS default, that basically means user wants the color
            // scheme to match the current system theme
            colorScheme = 'auto';
        }
        this.triggerSchemeUpdate(colorScheme);
        await this.persistSchemeUpdate(colorScheme);
    }
    async handleClick(e, value) {
        e.preventDefault();
        e.stopPropagation();
        this.triggerSchemeUpdate(value);
        await this.persistSchemeUpdate(value);
        this.advancedOptionsExpanded = false;
    }
    async persistSchemeUpdate(colorScheme) {
        const url = new URL(TYPO3.settings.ajaxUrls.color_scheme_update, window.location.origin);
        return await new AjaxRequest(url).post({ colorScheme });
    }
    triggerSchemeUpdate(colorScheme) {
        document.dispatchEvent(new CustomEvent('typo3:color-scheme:update', { detail: { colorScheme } }));
    }
};
__decorate([
    property({ type: String })
], ColorSchemeSwitchElement.prototype, "activeColorScheme", void 0);
__decorate([
    property({ type: Array })
], ColorSchemeSwitchElement.prototype, "colorSchemes", void 0);
__decorate([
    property({ type: String })
], ColorSchemeSwitchElement.prototype, "label", void 0);
__decorate([
    state()
], ColorSchemeSwitchElement.prototype, "advancedOptionsExpanded", void 0);
__decorate([
    state()
], ColorSchemeSwitchElement.prototype, "autoDetect", void 0);
ColorSchemeSwitchElement = __decorate([
    customElement('typo3-backend-color-scheme-switch')
], ColorSchemeSwitchElement);
export { ColorSchemeSwitchElement };
