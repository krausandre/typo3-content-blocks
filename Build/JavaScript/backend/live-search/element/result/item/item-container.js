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
import '@typo3/backend/element/spinner-element';
import LiveSearchConfigurator from '@typo3/backend/live-search/live-search-configurator';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators';
import { until } from 'lit/directives/until';
import '../../provider/default-result-item';
import {} from './item';
export const componentName = 'typo3-backend-live-search-result-item-container';
let ItemContainer = class ItemContainer extends LitElement {
    constructor() {
        super(...arguments);
        this.results = null;
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('scroll', this.onScroll);
    }
    disconnectedCallback() {
        this.removeEventListener('scroll', this.onScroll);
        super.disconnectedCallback();
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    render() {
        const groupedResults = {};
        const filteredResults = this.results.filter((result) => result !== null);
        if (filteredResults.length !== this.results.length) {
            console.warn('The result set contained "null" values, indicating something went wrong while building the search results. Affected values were removed to no break the user interface.');
        }
        filteredResults.forEach((result) => {
            if (!(result.typeLabel in groupedResults)) {
                groupedResults[result.typeLabel] = [result];
            }
            else {
                groupedResults[result.typeLabel].push(result);
            }
        });
        return html `<typo3-backend-live-search-result-list>
      ${this.renderGroupedResults(groupedResults)}
    </typo3-backend-live-search-result-list>`;
    }
    renderGroupedResults(groupedResults) {
        const items = [];
        for (const [type, results] of Object.entries(groupedResults)) {
            const countElements = results.length;
            items.push(html `<h6 class="livesearch-result-item-group-label">${type} (${countElements})</h6>`);
            items.push(...results.map((result) => html `${until(this.renderResultItem(result), html `<typo3-backend-spinner></typo3-backend-spinner>`)}`));
        }
        return html `${items}`;
    }
    async renderResultItem(resultItem) {
        const renderers = LiveSearchConfigurator.getRenderers();
        let innerResultItemComponent;
        if (renderers[resultItem.provider] !== undefined) {
            await import(renderers[resultItem.provider].module);
            innerResultItemComponent = renderers[resultItem.provider].callback(resultItem);
        }
        else {
            innerResultItemComponent = html `<typo3-backend-live-search-result-item-default
        title="${resultItem.typeLabel}: ${resultItem.itemTitle}"
        .icon="${resultItem.icon}"
        .itemTitle="${resultItem.itemTitle}"
        .typeLabel="${resultItem.typeLabel}"
        .extraData="${resultItem.extraData}">
      </typo3-backend-live-search-result-item-default>`;
        }
        return html `<typo3-backend-live-search-result-item
      .resultItem="${resultItem}"
      @click="${() => this.invokeAction(resultItem, resultItem.actions[0])}"
      @focus="${() => this.requestActions(resultItem)}">
      ${innerResultItemComponent}
    </typo3-backend-live-search-result-item>`;
    }
    requestActions(resultItem) {
        this.parentElement.dispatchEvent(new CustomEvent('livesearch:request-actions', {
            detail: {
                resultItem: resultItem
            }
        }));
    }
    invokeAction(resultItem, action) {
        this.parentElement.dispatchEvent(new CustomEvent('livesearch:invoke-action', {
            detail: {
                resultItem: resultItem,
                action: action
            }
        }));
    }
    onScroll(e) {
        this.querySelectorAll('.livesearch-result-item-group-label').forEach((groupLabel) => {
            groupLabel.classList.toggle('sticky', groupLabel.offsetTop <= e.target.scrollTop);
        });
    }
};
__decorate([
    property({ type: Object, attribute: false })
], ItemContainer.prototype, "results", void 0);
ItemContainer = __decorate([
    customElement('typo3-backend-live-search-result-item-container')
], ItemContainer);
export { ItemContainer };
let ResultList = class ResultList extends LitElement {
    static { this.styles = css `
    :host {
      display: block;
    }
  `; }
    connectedCallback() {
        this.parentContainer = this.closest('typo3-backend-live-search-result-container');
        this.resultItemDetailContainer = this.parentContainer.querySelector('typo3-backend-live-search-result-item-detail-container');
        super.connectedCallback();
        this.addEventListener('keydown', this.handleKeyDown);
        this.addEventListener('keyup', this.handleKeyUp);
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this.handleKeyDown);
        this.removeEventListener('keyup', this.handleKeyUp);
        super.disconnectedCallback();
    }
    render() {
        return html `<slot></slot>`;
    }
    handleKeyDown(e) {
        if (!['ArrowDown', 'ArrowUp', 'ArrowRight'].includes(e.key)) {
            return;
        }
        const expectedTagName = 'typo3-backend-live-search-result-item';
        if (document.activeElement.tagName.toLowerCase() !== expectedTagName) {
            return;
        }
        e.preventDefault();
        let focusableCandidate;
        if (e.key === 'ArrowDown') {
            let nextSibling = document.activeElement.nextElementSibling;
            while (nextSibling !== null && nextSibling.tagName.toLowerCase() !== expectedTagName) {
                nextSibling = nextSibling.nextElementSibling;
            }
            focusableCandidate = nextSibling;
        }
        else if (e.key === 'ArrowUp') {
            let prevSibling = document.activeElement.previousElementSibling;
            while (prevSibling !== null && prevSibling.tagName.toLowerCase() !== expectedTagName) {
                prevSibling = prevSibling.previousElementSibling;
            }
            focusableCandidate = prevSibling;
            if (focusableCandidate === null) {
                // No possible candidate found, fall back to search input
                focusableCandidate = (document.querySelector('typo3-backend-live-search').querySelector('input[type="search"]'));
            }
        }
        else if (e.key === 'ArrowRight') {
            focusableCandidate = this.resultItemDetailContainer.querySelector('typo3-backend-live-search-result-item-action');
        }
        if (focusableCandidate !== null) {
            focusableCandidate.focus();
        }
    }
    handleKeyUp(e) {
        if (!['Enter', ' '].includes(e.key)) {
            return;
        }
        e.preventDefault();
        const resultItem = e.target.resultItem;
        this.invokeAction(resultItem);
    }
    invokeAction(item) {
        this.parentContainer.dispatchEvent(new CustomEvent('livesearch:invoke-action', {
            detail: {
                resultItem: item,
                action: item.actions[0]
            }
        }));
    }
};
ResultList = __decorate([
    customElement('typo3-backend-live-search-result-list')
], ResultList);
export { ResultList };
