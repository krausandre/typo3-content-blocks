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
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators';
import { live } from 'lit/directives/live';
import { BaseElement } from './base';
export const componentName = 'typo3-backend-settings-type-string';
let StringTypeElement = class StringTypeElement extends BaseElement {
    handleChange(e) {
        const input = e.target;
        if (input.reportValidity()) {
            this.value = input.value;
        }
    }
    renderEnum() {
        return html `
      <select
        id=${this.formid}
        class="form-select"
        ?readonly=${this.readonly}
        .value=${live(this.value)}
        @change=${this.handleChange}
      >
        ${Object.entries(this.enum).map(([value, label]) => html `
          <option ?selected=${this.value === value} value=${value}>${label}${this.debug ? html ` [${value}]` : nothing}</option>
        `)}
      </select>
    `;
    }
    render() {
        if (typeof this.enum === 'object') {
            return this.renderEnum();
        }
        return html `
      <input
        type="text"
        id=${this.formid}
        class="form-control"
        ?readonly=${this.readonly}
        .value=${live(this.value)}
        minlength=${this.options.min ?? nothing}
        maxlength=${this.options.max ?? nothing}
        @change=${this.handleChange}
      />
    `;
    }
};
__decorate([
    property({ type: String })
], StringTypeElement.prototype, "value", void 0);
StringTypeElement = __decorate([
    customElement(componentName)
], StringTypeElement);
export { StringTypeElement };
