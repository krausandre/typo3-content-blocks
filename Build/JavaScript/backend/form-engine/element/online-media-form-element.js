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
import { LitElement, html } from 'lit';
/**
 * Module: @typo3/backend/form-engine/element/online-media-form-element
 */
let OnlineMediaFormElement = class OnlineMediaFormElement extends LitElement {
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        return html `
      <form @submit="${this.dispatchSubmitEvent}">
        <div class="form-control-wrap">
          <input type="text" class="form-control" name="online-media-url" placeholder="${this.placeholder}" required>
          <div class="form-text">
            ${this.allowedExtensionsHelpText}<br>
            <ul class="badge-list">
            ${this.allowedExtensions.split(',').map((ext) => html `
              <li><span class="badge badge-success">${ext.trim().toUpperCase()}</span></li>
            `)}
            </ul>
          </div>
        </div>
      </form>
    `;
    }
    dispatchSubmitEvent(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const submittedData = Object.fromEntries(formData);
        this.dispatchEvent(new CustomEvent('typo3:formengine:online-media-added', {
            detail: submittedData
        }));
    }
};
__decorate([
    property({ type: String })
], OnlineMediaFormElement.prototype, "placeholder", void 0);
__decorate([
    property({ type: String, attribute: 'help-text' })
], OnlineMediaFormElement.prototype, "allowedExtensionsHelpText", void 0);
__decorate([
    property({ type: String, attribute: 'extensions' })
], OnlineMediaFormElement.prototype, "allowedExtensions", void 0);
OnlineMediaFormElement = __decorate([
    customElement('typo3-backend-formengine-online-media-form')
], OnlineMediaFormElement);
export { OnlineMediaFormElement };
