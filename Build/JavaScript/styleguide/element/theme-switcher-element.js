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
import { customElement, property } from 'lit/decorators';
import { html, LitElement } from 'lit';
import { lll } from '@typo3/core/lit-helper';
import '@typo3/backend/element/icon-element';
const selectorConverter = {
    fromAttribute(selector) {
        return document.querySelector(selector);
    }
};
/**
 * Module: @typo3/styleguide/element/theme-switcher-element
 *
 * @example
 * <typo3-styleguide-theme-switcher></typo3-styleguide-theme-switcher>
 */
let ThemeSwitcherElement = class ThemeSwitcherElement extends LitElement {
    constructor() {
        super(...arguments);
        this.activeTheme = 'light';
        this.themes = {
            auto: {
                icon: 'actions-circle-half',
                label: 'colorScheme.auto',
            },
            light: {
                icon: 'actions-brightness-high',
                label: 'colorScheme.light',
            },
            dark: {
                icon: 'actions-moon',
                label: 'colorScheme.dark',
            }
        };
    }
    createRenderRoot() {
        return this;
    }
    render() {
        const dropdownActiveIcon = html `<span class="text-primary"><typo3-backend-icon identifier="actions-dot" size="small"></typo3-backend-icon></span>`;
        const dropdownInactiveIcon = html `<typo3-backend-icon identifier="miscellaneous-placeholder" size="small"></typo3-backend-icon>`;
        const themeOptions = [];
        for (const [identifier, theme] of Object.entries(this.themes)) {
            themeOptions.push(html `
        <li>
          <a class="dropdown-item dropdown-item-spaced" href="#" data-theme="${identifier}" @click="${this.setTheme}">
            ${identifier === this.activeTheme ? dropdownActiveIcon : dropdownInactiveIcon}
            ${lll(theme.label)}
          </a>
        </li>
      `);
        }
        return html `
      <div class="colorscheme-switch">
        ${lll('colorScheme.selector.label')}
        <div class="dropdown">
          <button class="btn btn-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <typo3-backend-icon identifier="${this.themes[this.activeTheme].icon}" size="small"></typo3-backend-icon> ${lll(this.themes[this.activeTheme].label)}
          </button>
          <ul class="dropdown-menu">
            ${themeOptions}
          </ul>
        </div>
      </div>
    `;
    }
    setTheme(event) {
        this.activeTheme = event.target.dataset.theme;
        this.example.dataset.colorScheme = this.activeTheme;
    }
};
__decorate([
    property()
], ThemeSwitcherElement.prototype, "activeTheme", void 0);
__decorate([
    property({ converter: selectorConverter })
], ThemeSwitcherElement.prototype, "example", void 0);
ThemeSwitcherElement = __decorate([
    customElement('typo3-styleguide-theme-switcher')
], ThemeSwitcherElement);
export { ThemeSwitcherElement };
