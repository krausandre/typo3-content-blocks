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
export const componentName = 'typo3-backend-settings-type-number';
let NumberTypeElement = class NumberTypeElement extends BaseElement {
    handleChange(e) {
        const input = e.target;
        if (input.reportValidity()) {
            this.value = input.valueAsNumber;
        }
    }
    render() {
        return html `
      <input
        type="number"
        id=${this.formid}
        class="form-control"
        ?readonly=${this.readonly}
        .value=${live(this.value)}
        required
        min=${this.options.min ?? nothing}
        max=${this.options.max ?? nothing}
        step=${this.options.step ?? '0.01'}
        @change=${this.handleChange}
      />
    `;
    }
};
__decorate([
    property({ type: Number })
], NumberTypeElement.prototype, "value", void 0);
NumberTypeElement = __decorate([
    customElement(componentName)
], NumberTypeElement);
export { NumberTypeElement };
