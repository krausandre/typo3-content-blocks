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
import { live } from 'lit/directives/live.js';
export const componentName = 'typo3-backend-settings-type-stringlist';
let StringlistTypeElement = class StringlistTypeElement extends BaseElement {
    updateValue(value, index) {
        const copy = [...this.value];
        copy[index] = value;
        this.value = copy;
    }
    addValue(index, value = '') {
        this.value = this.value.toSpliced(index + 1, 0, value);
    }
    removeValue(index) {
        this.value = this.value.toSpliced(index, 1);
    }
    renderItem(value, index) {
        return html `
      <tr>
        <td width="99%">
          <input
            id=${`${this.formid}${index > 0 ? '-' + index : ''}`}
            type="text"
            class="form-control"
            ?readonly=${this.readonly}
            .value=${live(value)}
            @change=${(e) => this.updateValue(e.target.value, index)}
          />
        </td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-default" type="button" ?disabled=${this.readonly} @click=${() => this.addValue(index)}>
              <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
            </button>
            <button class="btn btn-default" type="button" ?disabled=${this.readonly} @click=${() => this.removeValue(index)}>
              <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
            </button>
          </div>
        </td>
      </tr>
    `;
    }
    render() {
        const value = this.value || [];
        return html `
      <div class="form-control-wrap">
        <div class="table-fit">
          <table class="table table-hover">
            <tbody>
              ${value.map((v, i) => this.renderItem(v, i))}
            </tbody>
          </table>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Array })
], StringlistTypeElement.prototype, "value", void 0);
StringlistTypeElement = __decorate([
    customElement(componentName)
], StringlistTypeElement);
export { StringlistTypeElement };
