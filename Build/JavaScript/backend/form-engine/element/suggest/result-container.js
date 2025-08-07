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
import { css, html, LitElement } from 'lit';
import { lll } from '@typo3/core/lit-helper';
import './result-item';
let ResultContainer = class ResultContainer extends LitElement {
    constructor() {
        super(...arguments);
        this.results = null;
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('keydown', this.handleKeyDown);
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this.handleKeyDown);
        super.disconnectedCallback();
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        let content;
        if (this.results !== null) {
            if (this.results.length === 0) {
                content = html `<div class="alert alert-info">${lll('search.no_records_found')}</div>`;
            }
            else {
                content = html `${this.results.map((result) => this.renderResultItem(result))}`;
            }
        }
        return html `<typo3-backend-formengine-suggest-result-list>${content}</typo3-backend-formengine-suggest-result-list>`;
    }
    renderResultItem(result) {
        return html `<typo3-backend-formengine-suggest-result-item
      tabindex="1"
      icon="${JSON.stringify(result.icon)}"
      uid="${result.uid}"
      table="${result.table}"
      label="${result.label}"
      path="${result.path}">
    </typo3-backend-formengine-suggest-result-item>`;
    }
    handleKeyDown(e) {
        e.preventDefault();
        if (e.key === 'Escape') {
            this.closest('.t3-form-suggest-container').querySelector('input[type="search"]').focus();
            this.hidden = true;
            return;
        }
        if (!['ArrowDown', 'ArrowUp'].includes(e.key)) {
            return;
        }
        if (document.activeElement.tagName.toLowerCase() !== 'typo3-backend-formengine-suggest-result-item') {
            return;
        }
        let focusableCandidate;
        if (e.key === 'ArrowDown') {
            focusableCandidate = document.activeElement.nextElementSibling;
        }
        else {
            focusableCandidate = document.activeElement.previousElementSibling;
            if (focusableCandidate === null) {
                // No possible candidate found, fall back to search input
                focusableCandidate = this.closest('.t3-form-suggest-container').querySelector('input[type="search"]');
            }
        }
        if (focusableCandidate !== null) {
            focusableCandidate.focus();
        }
    }
};
__decorate([
    property({ type: Object })
], ResultContainer.prototype, "results", void 0);
ResultContainer = __decorate([
    customElement('typo3-backend-formengine-suggest-result-container')
], ResultContainer);
export { ResultContainer };
let ResultList = class ResultList extends LitElement {
    static { this.styles = css `
    :host {
      display: block;
    }
  `; }
    render() {
        return html `<slot></slot>`;
    }
};
ResultList = __decorate([
    customElement('typo3-backend-formengine-suggest-result-list')
], ResultList);
export { ResultList };
