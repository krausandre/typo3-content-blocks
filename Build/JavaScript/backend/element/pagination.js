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
import { html, LitElement } from 'lit';
import { range } from 'lit/directives/range';
import { map } from 'lit/directives/map';
import { classMap } from 'lit/directives/class-map';
let PaginationElement = class PaginationElement extends LitElement {
    constructor() {
        super(...arguments);
        this.paging = null;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        return html `
      <ul class="pagination">
        <li class=${classMap({ 'page-item': true, disabled: this.paging.currentPage === 1 })}>
          <button type="button" class="page-link" data-action="previous" ?disabled=${this.paging.currentPage === 1}>
            <typo3-backend-icon identifier="actions-view-paging-previous" size="small"></typo3-backend-icon>
          </button>
        </li>
        ${map(range(1, this.paging.totalPages + 1), (page) => html `
          <li class=${classMap({ 'page-item': true, active: this.paging.currentPage === page })}>
            <button type="button" class="page-link" data-action="page" data-page=${page}>
              <span>${page}</span>
            </button>
          </li>
        `)}
        <li class=${classMap({ 'page-item': true, disabled: this.paging.currentPage === this.paging.totalPages })}>
          <button type="button" class="page-link" data-action="next" ?disabled=${this.paging.currentPage === this.paging.totalPages}>
            <typo3-backend-icon identifier="actions-view-paging-next" size="small"></typo3-backend-icon>
          </button>
        </li>
      </ul>
    `;
    }
};
__decorate([
    property({ type: Object })
], PaginationElement.prototype, "paging", void 0);
PaginationElement = __decorate([
    customElement('typo3-backend-pagination')
], PaginationElement);
export { PaginationElement };
