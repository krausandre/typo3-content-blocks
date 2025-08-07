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
import '@typo3/backend/element/icon-element';
let ResultPagination = class ResultPagination extends LitElement {
    constructor() {
        super(...arguments);
        this.pagination = null;
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        if (this.pagination === null || this.pagination.allPageNumbers.length <= 1) {
            return nothing;
        }
        return html `<nav>
      <ul class="pagination">
        <li class="page-item">
          <typo3-backend-live-search-result-page class="page-link ${!this.pagination.previousPageNumber || this.pagination.previousPageNumber < this.pagination.firstPage ? 'disabled' : ''}" page="${this.pagination.previousPageNumber}" perPage="${this.pagination.itemsPerPage}">
            <typo3-backend-icon identifier="actions-view-paging-previous" size="small"></typo3-backend-icon>
          </typo3-backend-live-search-result-page>
        </li>
        ${!this.pagination.allPageNumbers.includes(this.pagination.firstPage) ? html `
          <li class="page-item">
            <typo3-backend-live-search-result-page class="page-link" page="${this.pagination.firstPage}" perPage="${this.pagination.itemsPerPage}">
              ${this.pagination.firstPage}
            </typo3-backend-live-search-result-page>
          </li>` : nothing}
        ${this.pagination.hasLessPages ? html `<li class="page-item disabled"><span class="page-link disabled">&hellip;</span></li>` : nothing}
        ${this.pagination.allPageNumbers.map((page) => html `
          <li class="page-item">
            <typo3-backend-live-search-result-page page="${page}" perPage="${this.pagination.itemsPerPage}" class="page-link ${this.pagination.currentPage === page ? 'active' : ''}">${page}</typo3-backend-live-search-result-page>
          </li>
        `)}
        ${this.pagination.hasMorePages ? html `<li class="page-item"><span class="page-link disabled">&hellip;</span></li>` : nothing}
        ${!this.pagination.allPageNumbers.includes(this.pagination.lastPage) ? html `
          <li class="page-item">
            <typo3-backend-live-search-result-page class="page-link" page="${this.pagination.lastPage}" perPage="${this.pagination.itemsPerPage}">
              ${this.pagination.lastPage}
            </typo3-backend-live-search-result-page>
          </li>` : nothing}
        <li class="page-item">
          <typo3-backend-live-search-result-page class="page-link ${!this.pagination.nextPageNumber || this.pagination.nextPageNumber > this.pagination.lastPage ? 'disabled' : ''}" page="${this.pagination.nextPageNumber}" perPage="${this.pagination.itemsPerPage}">
            <typo3-backend-icon identifier="actions-view-paging-next" size="small"></typo3-backend-icon>
          </typo3-backend-live-search-result-page>
        </li>
      </ul>
    </nav>`;
    }
};
__decorate([
    property({ type: Object })
], ResultPagination.prototype, "pagination", void 0);
ResultPagination = __decorate([
    customElement('typo3-backend-live-search-result-pagination')
], ResultPagination);
export { ResultPagination };
let ResultPaginationPage = class ResultPaginationPage extends LitElement {
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this.dispatchPaginationEvent);
    }
    disconnectedCallback() {
        this.removeEventListener('click', this.dispatchPaginationEvent);
        super.disconnectedCallback();
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        return nothing;
    }
    dispatchPaginationEvent() {
        const liveSearchContainer = this.closest('typo3-backend-live-search');
        liveSearchContainer.dispatchEvent(new CustomEvent('livesearch:pagination-selected', {
            detail: {
                offset: (this.page - 1) * this.perPage,
            }
        }));
    }
};
__decorate([
    property({ type: Number })
], ResultPaginationPage.prototype, "page", void 0);
__decorate([
    property({ type: Number })
], ResultPaginationPage.prototype, "perPage", void 0);
ResultPaginationPage = __decorate([
    customElement('typo3-backend-live-search-result-page')
], ResultPaginationPage);
export { ResultPaginationPage };
