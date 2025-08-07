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
import { customElement, property } from 'lit/decorators';
import { Sizes } from '../enum/icon-types';
import { IconStyles } from '@typo3/backend/icons';
/**
 * Module: @typo3/backend/element/spinner-element
 *
 * @example
 * <typo3-backend-spinner size="small"></typo3-backend-spinner>
 * + attribute size can be one of small, default, large or mega
 */
let SpinnerElement = class SpinnerElement extends LitElement {
    constructor() {
        super(...arguments);
        this.size = Sizes.default;
    }
    static { this.styles = IconStyles.getStyles(); }
    render() {
        return html `
      <span class="icon icon-size-${this.size} icon-state-default icon-spin">
        <span class="icon-markup">
          <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 16 16">
            <g fill="currentColor">
              <path d="M8 15c-3.86 0-7-3.141-7-7 0-3.86 3.14-7 7-7 3.859 0 7 3.14 7 7 0 3.859-3.141 7-7 7zM8 3C5.243 3 3 5.243 3 8s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" opacity=".3"/><path d="M14 9a1 1 0 0 1-1-1c0-2.757-2.243-5-5-5a1 1 0 0 1 0-2c3.859 0 7 3.14 7 7a1 1 0 0 1-1 1z"/>
            </g>
          </svg>
        </span>
      </span>
    `;
    }
};
__decorate([
    property({ type: String })
], SpinnerElement.prototype, "size", void 0);
SpinnerElement = __decorate([
    customElement('typo3-backend-spinner')
], SpinnerElement);
export { SpinnerElement };
