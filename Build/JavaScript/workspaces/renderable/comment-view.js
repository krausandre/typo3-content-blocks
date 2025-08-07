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
import { nl2br } from '@typo3/core/directive/nl2br';
let CommentViewElement = class CommentViewElement extends LitElement {
    constructor() {
        super(...arguments);
        this.comments = [];
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        return html `
      <div>
        ${repeat(this.comments, (comment) => comment.tstamp, (comment) => this.renderComment(comment))}
      </div>
    `;
    }
    renderComment(comment) {
        return html `
      <div class="media">
        <div class="media-left text-center">
          <div>
            ${unsafeHTML(comment.user_avatar)}
          </div>
          ${comment.user_username}
        </div>
        <div class="panel panel-default">
          ${comment.user_comment ? html `
          <div class="panel-body">
            ${nl2br(comment.user_comment)}
          </div>
        ` : nothing}
          <div class="panel-footer">
            <span class="badge badge-success me-2">
              ${comment.previous_stage_title} ⇾ ${comment.stage_title}
            </span>
            <span class="badge badge-info">
              ${comment.tstamp}
          </div>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Array })
], CommentViewElement.prototype, "comments", void 0);
CommentViewElement = __decorate([
    customElement('typo3-workspaces-comment-view')
], CommentViewElement);
export { CommentViewElement };
