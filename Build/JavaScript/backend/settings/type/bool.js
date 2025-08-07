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
export const componentName = 'typo3-backend-settings-type-bool';
let BoolTypeElement = class BoolTypeElement extends BaseElement {
    render() {
        return html `
      <div class="form-check form-check-type-toggle">
        <input
          type="checkbox"
          id=${this.formid}
          class="form-check-input"
          value="1"
          ?disabled=${this.readonly}
          .checked=${this.value}
          @change=${(e) => this.value = e.target.checked}
        />
      </div>
    `;
    }
};
__decorate([
    property({
        type: Boolean,
        converter: {
            toAttribute: (value) => {
                return value ? '1' : '0';
            },
            fromAttribute: (value) => {
                return value === '1' || value === 'true';
            }
        }
    })
], BoolTypeElement.prototype, "value", void 0);
BoolTypeElement = __decorate([
    customElement(componentName)
], BoolTypeElement);
export { BoolTypeElement };
