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
import { repeat } from 'lit/directives/repeat';
import { unsafeHTML } from 'lit/directives/unsafe-html';
let HistoryViewElement = class HistoryViewElement extends LitElement {
    constructor() {
        super(...arguments);
        this.historyItems = [];
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        return html `
      <div>
        ${repeat(this.historyItems, (historyItem) => historyItem.datetime, (historyItem) => this.renderHistoryItem(historyItem))}
      </div>
    `;
    }
    renderHistoryItem(historyItem) {
        if (typeof historyItem.differences === 'object' && historyItem.differences.length === 0) {
            return nothing;
        }
        return html `
      <div class="media">
        <div class="media-left text-center">
          <div>
            ${unsafeHTML(historyItem.user_avatar)}
          </div>
          ${historyItem.user}
        </div>
        <div class="media-body">
          <div class="panel panel-default">
            ${typeof historyItem.differences === 'object' ? html `
          <div>
            <div class="diff">
              ${repeat(historyItem.differences, (diff) => diff, (diff) => html `
              <div class="diff-item">
                <div class="diff-item-title">
                  ${diff.label}
                </div>
                <div class="diff-item-result diff-item-result-inline">
                  ${unsafeHTML(diff.html)}
                </div>
              </div>
            `)}
            </div>
          </div>
        ` : html `
          <div class="panel-body">
            ${historyItem.differences}
          </div>
        `}
        <div class="panel-footer">
          <span class="badge badge-info">
            ${historyItem.datetime}
          </span>
            </div>
          </div>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Array })
], HistoryViewElement.prototype, "historyItems", void 0);
HistoryViewElement = __decorate([
    customElement('typo3-workspaces-history-view')
], HistoryViewElement);
export { HistoryViewElement };
