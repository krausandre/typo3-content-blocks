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
import { html, LitElement, nothing } from 'lit';
let SendToStageFormElement = class SendToStageFormElement extends LitElement {
    constructor() {
        super(...arguments);
        this.data = null;
        this.TYPO3lang = null;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        return html `
      <form>
        ${this.data.sendMailTo !== undefined && this.data.sendMailTo.length > 0 ? html `
          <label class="form-label">${this.TYPO3lang['window.sendToNextStageWindow.itemsWillBeSentTo']}</label>
          ${this.renderRecipientCheckboxes()}
        ` : nothing}
        ${this.data.additional !== undefined ? html `
          <div class="form-group">
            <label for="additional" class="form-label">
              ${this.TYPO3lang['window.sendToNextStageWindow.additionalRecipients']}
            </label>
            <textarea class="form-control" name="additional" id="additional">${this.data.additional.value}</textarea>
            <div class="form-text">
              ${this.TYPO3lang['window.sendToNextStageWindow.additionalRecipients.hint']}
            </div>
          </div>
        ` : nothing}
        <div class="form-group">
          <label for="comments" class="form-label">
            ${this.TYPO3lang['window.sendToNextStageWindow.comments']}
          </label>
          <textarea class="form-control" name="comments" id="comments">${this.data.comments.value}</textarea>
        </div>
      </form>
    `;
    }
    renderRecipientCheckboxes() {
        const renderResult = [];
        this.data.sendMailTo?.forEach((recipient) => {
            renderResult.push(html `
        <div class="form-check">
          <input
            type="checkbox"
            name="recipients"
            class="form-check-input t3js-workspace-recipient"
            id=${recipient.name}
            value=${recipient.value}
            ?checked=${recipient.checked}
            ?disabled=${recipient.disabled}
            />
          <label class="form-check-label" for=${recipient.name}>
            ${recipient.label}
          </label>
        </div>
      `);
        });
        return renderResult;
    }
};
__decorate([
    property({ type: Object })
], SendToStageFormElement.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], SendToStageFormElement.prototype, "TYPO3lang", void 0);
SendToStageFormElement = __decorate([
    customElement('typo3-workspaces-send-to-stage-form')
], SendToStageFormElement);
export { SendToStageFormElement };
