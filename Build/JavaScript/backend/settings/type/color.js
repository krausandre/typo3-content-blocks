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
import { html } from 'lit';
import { customElement, property } from 'lit/decorators';
import { BaseElement } from './base';
import '@typo3/backend/color-picker';
import RegularEvent from '@typo3/core/event/regular-event';
export const componentName = 'typo3-backend-settings-type-color';
let ColorTypeElement = class ColorTypeElement extends BaseElement {
    firstUpdated() {
        const inputElement = this.getInputElement();
        if (inputElement) {
            new RegularEvent('blur', (e) => {
                this.updateValue(e.target.value);
            }).bindTo(inputElement);
        }
    }
    updateValue(value) {
        this.value = value;
    }
    render() {
        return html `
      <typo3-backend-color-picker>
        <input
          type="text"
          id=${this.formid}
          class="form-control"
          ?readonly=${this.readonly}
          .value=${this.value}
          @change=${(e) => this.updateValue(e.target.value)}
        />
      </typo3-backend-color-picker>
    `;
    }
    getInputElement() {
        return this.querySelector('input');
    }
};
__decorate([
    property({ type: String })
], ColorTypeElement.prototype, "value", void 0);
ColorTypeElement = __decorate([
    customElement(componentName)
], ColorTypeElement);
export { ColorTypeElement };
