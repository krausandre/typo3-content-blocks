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
import { unsafeHTML } from 'lit/directives/unsafe-html';
import '@typo3/workspaces/renderable/diff-view';
import '@typo3/workspaces/renderable/comment-view';
import '@typo3/workspaces/renderable/history-view';
let RecordInformationElement = class RecordInformationElement extends LitElement {
    constructor() {
        super(...arguments);
        this.TYPO3lang = null;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        return html `
      <div>
        <p>${unsafeHTML(this.TYPO3lang.path.replace('{0}', this.record.path_Live))}</p>
        <p>${unsafeHTML(this.TYPO3lang.current_step.replace('{0}', this.record.label_Stage).replace('{1}', this.record.stage_position).replace('{2}', this.record.stage_count))}</p>
        <ul class="nav nav-tabs" role="tablist">
          ${this.record.diff.length > 0 ? this.renderNavLink(this.TYPO3lang['window.recordChanges.tabs.changeSummary'], '#workspace-changes') : nothing}
          ${this.record.comments.length > 0 ? this.renderNavLink(this.TYPO3lang['window.recordChanges.tabs.changeSummary'], '#workspace-comments', this.record.comments.length) : nothing}
          ${this.record.history.data.length > 0 ? this.renderNavLink(this.TYPO3lang['window.recordChanges.tabs.history'], '#workspace-history') : nothing}
        </ul>
        <div class="tab-content">
          ${this.record.diff.length > 0 ? html `
            <div class="tab-pane" id="workspace-changes" role="tabpanel">
              <div class="form-section">
                <typo3-workspaces-diff-view .diffs=${this.record.diff}></typo3-workspaces-diff-view>
              </div>
            </div>
          ` : nothing}
          ${this.record.comments.length > 0 ? html `
            <div class="tab-pane" id="workspace-comments" role="tabpanel">
              <div class="form-section">
                <typo3-workspaces-comment-view .comments=${this.record.comments}></typo3-workspaces-comment-view>
              </div>
            </div>
          ` : nothing}
          ${this.record.history.data.length > 0 ? html `
            <div class="tab-pane" id="workspace-history" role="tabpanel">
              <div class="form-section">
                <typo3-workspaces-history-view .historyItems=${this.record.history.data}></typo3-workspaces-history-view>
              </div>
            </div>
          ` : nothing}
        </div>
      </div>
    `;
    }
    renderNavLink(text, target, count = 0) {
        return html `
      <li class="nav-item" role="presentation">
        <button
          type="button"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="${target}"
          aria-controls="${target}"
          role="tab"
        >
          ${text}
          ${count > 0 ? html `<span class="badge">${count}</span>` : nothing}
        </button>
      </li>
    `;
    }
    firstUpdated() {
        this.renderRoot.querySelector('.nav-link').classList.add('active');
        this.renderRoot.querySelector('.tab-pane').classList.add('active');
    }
};
__decorate([
    property({ type: Object })
], RecordInformationElement.prototype, "record", void 0);
__decorate([
    property({ type: Object })
], RecordInformationElement.prototype, "TYPO3lang", void 0);
RecordInformationElement = __decorate([
    customElement('typo3-workspaces-record-information')
], RecordInformationElement);
export { RecordInformationElement };
