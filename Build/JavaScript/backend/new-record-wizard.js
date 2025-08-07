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
import { html, css, LitElement, nothing } from 'lit';
import Modal from '@typo3/backend/modal';
import '@typo3/backend/element/icon-element';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { lll } from '@typo3/core/lit-helper';
import Notification from '@typo3/backend/notification';
import Viewport from '@typo3/backend/viewport';
import RegularEvent from '@typo3/core/event/regular-event';
import { KeyTypesEnum } from '@typo3/backend/enum/key-types';
const booleanConverter = {
    fromAttribute: (value) => {
        if (value === null) {
            return true;
        }
        return value.toLowerCase() === 'true';
    },
    toAttribute: (value) => (value ? 'true' : 'false'),
};
class Item {
    constructor(identifier, label, description, icon, url, requestType, defaultValues, saveAndClose, event) {
        this.identifier = identifier;
        this.label = label;
        this.description = description;
        this.icon = icon;
        this.url = url;
        this.requestType = requestType;
        this.defaultValues = defaultValues;
        this.saveAndClose = saveAndClose;
        this.event = event;
        this.visible = true;
    }
    static fromData(data) {
        return new Item(data.identifier, data.label, data.description, data.icon, data.url ?? null, data.requestType ?? 'location', data.defaultValues ?? [], data.saveAndClose ?? false, data.event ?? null);
    }
    reset() {
        this.visible = true;
    }
}
export class Category {
    constructor(identifier, label, items) {
        this.identifier = identifier;
        this.label = label;
        this.items = items;
        this.disabled = false;
    }
    static fromData(data) {
        return new Category(data.identifier, data.label, data.items.map((item) => Item.fromData(item)));
    }
    reset() {
        this.disabled = false;
        this.items.forEach((item) => {
            item.reset();
        });
    }
    activeItems() {
        return this.items.filter((item) => item.visible) ?? [];
    }
}
export class Categories {
    constructor(items) {
        this.items = items;
    }
    static fromData(data) {
        return new Categories(Object.values(data).map((item) => Category.fromData(item)));
    }
    reset() {
        this.items.forEach((item) => {
            item.reset();
        });
    }
    categoriesWithItems() {
        return this.items.filter((item) => item.activeItems().length > 0) ?? [];
    }
}
/**
 * Module: @typo3/backend/new-record-wizard
 */
let NewRecordWizard = class NewRecordWizard extends LitElement {
    constructor() {
        super(...arguments);
        this.categories = new Categories([]);
        this.searchPlaceholder = 'newRecordWizard.filter.placeholder';
        this.searchNothingFoundLabel = 'newRecordWizard.filter.noResults';
        this.displayMenu = true;
        this.displayFilter = true;
        this.selectedCategory = null;
        this.searchTerm = '';
        this.messages = [];
        this.toggleMenu = false;
    }
    static { this.styles = [
        css `
      :host {
        display: block;
        container-type: inline-size;
      }

      .element {
        display: flex;
        flex-direction: column;
        gap: var(--typo3-spacing);
        font-size: var(--typo3-component-font-size);
        line-height: var(--typo3-component-line-height);
      }

      .main {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: calc(var(--typo3-spacing) * 2);
      }

      @container (min-width: 500px) {
        .main {
          flex-direction: row;
        }
      }

      .main > * {
        flex-grow: 1;
      }

      .navigation {
        position: relative;
        flex-shrink: 0;
      }

      @container (min-width: 500px) {
        .navigation {
          flex-grow: 0;
          width: 200px;
        }
      }

      @container (min-width: 500px) {
        .navigation-toggle {
          display: none !important;
        }
      }

      .navigation-list {
        display: none;
        flex-direction: column;
        gap: 2px;
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .navigation-list.show {
        display: flex;
      }

      @container (max-width: 499px) {
        .navigation-list {
          z-index: 1;
          position: absolute;
          padding: var(--typo3-component-border-width);
          background: var(--typo3-component-bg);
          border: var(--typo3-component-border-width) solid var(--typo3-component-border-color);
          border-radius: var(--typo3-component-border-radius);
          box-shadow: var(--typo3-component-box-shadow);
        }
      }

      @container (min-width: 500px) {
        .navigation-list {
          display: flex;
        }
      }

      .navigation-item {
        cursor: pointer;
        align-items: center;
        display: flex;
        width: 100%;
        gap: calc(var(--typo3-spacing) / 2);
        text-align: start;
        color: inherit;
        background: transparent;
        border: var(--typo3-component-border-width) solid var(--typo3-component-border-color);
        border-radius: var(--typo3-component-border-radius);
        padding: var(--typo3-list-item-padding-y) var(--typo3-list-item-padding-x);
      }

      @container (max-width: 499px) {
        .navigation-item {
          border-radius: calc(var(--typo3-component-border-radius) - var(--typo3-component-border-width));
        }
      }

      .navigation-item:hover {
        color: var(--typo3-component-hover-color);
        background: var(--typo3-component-hover-bg);
        border-color: var(--typo3-component-hover-border-color);
      }

      .navigation-item:focus {
        outline: none;
        color: var(--typo3-component-focus-color);
        background: var(--typo3-component-focus-bg);
        border-color: var(--typo3-component-focus-border-color);
      }

      .navigation-item.active {
        color: var(--typo3-component-active-color);
        background: var(--typo3-component-active-bg);
        border-color: var(--typo3-component-active-border-color);
      }

      .navigation-item:disabled {
        cursor: not-allowed;
        color: var(--typo3-component-disabled-color);
        background: var(--typo3-component-disabled-bg);
        border-color: var(--typo3-component-disabled-border-color);
      }

      .navigation-item-label {
        flex-grow: 1;
      }

      .navigation-item-count {
        opacity: .75;
        flex-shrink: 0;
      }

      .content {
        container-type: inline-size;
      }

      .elementwizard-categories {
        display: grid;
        gap: var(--typo3-spacing);
      }

      .elementwizard-category-headline {
        font-weight: bold;
        color: var(--typo3-text-color-variant);
        margin-bottom: calc(var(--typo3-spacing) / 2);
      }

      .elementwizard-category-items {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--typo3-spacing);
      }

      @container (min-width: 500px) {
        .elementwizard-category-items {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @container (min-width: 750px) {
        .elementwizard-category-items {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      .item {
        cursor: pointer;
        display: flex;
        gap: calc(var(--typo3-spacing) / 2);
        text-align: start;
        border: var(--typo3-component-border-width) solid transparent;
        border-radius: var(--typo3-component-border-radius);
        padding: var(--typo3-list-item-padding-y) var(--typo3-list-item-padding-x);
        background: transparent;
        color: inherit;
      }

      .item:hover {
        color: var(--typo3-component-hover-color);
        background: var(--typo3-component-hover-bg);
        border-color: var(--typo3-component-hover-border-color);
      }

      .item:focus {
        outline: none;
        color: var(--typo3-component-focus-color);
        background: var(--typo3-component-focus-bg);
        border-color: var(--typo3-component-focus-border-color);
      }

      .item-body-label {
        text-wrap: balance;
        font-weight: bold;
        margin-bottom: .25rem;
      }

      .item-body-description {
        opacity: .75;
        text-wrap: pretty;
      }
    `
    ]; }
    firstUpdated() {
        // Load shared css file
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', TYPO3.settings.cssUrls.backend);
        this.shadowRoot.appendChild(link);
        if (this.displayFilter === true) {
            const filterField = this.renderRoot.querySelector('input[name="search"]');
            filterField.focus();
        }
        this.selectAvailableCategory();
    }
    getLanguageLabel(label) {
        const languageLabel = lll(label);
        if (languageLabel !== '') {
            return languageLabel;
        }
        return label;
    }
    selectAvailableCategory() {
        const needsCategoryChange = this.categories.categoriesWithItems()
            .filter((item) => item === this.selectedCategory).length === 0;
        if (needsCategoryChange) {
            this.selectedCategory = this.categories.categoriesWithItems()[0] ?? null;
        }
        this.messages = [];
        if (this.selectedCategory === null) {
            this.messages = [{
                    message: this.getLanguageLabel(this.searchNothingFoundLabel),
                    severity: 'info'
                }];
        }
    }
    filter(searchTerm) {
        this.searchTerm = searchTerm;
        this.categories.reset();
        this.categories.items.forEach((category) => {
            const categoryText = category.label.trim().replace(/\s+/g, ' ');
            const categoryMatch = !(this.searchTerm !== '' && !RegExp(this.searchTerm, 'i').test(categoryText));
            if (!categoryMatch) {
                category.items.forEach((item) => {
                    const text = item.label.trim().replace(/\s+/g, ' ') + item.description?.trim().replace(/\s+/g, ' ');
                    item.visible = !(this.searchTerm !== '' && !RegExp(this.searchTerm, 'i').test(text));
                });
            }
            category.disabled = category.items.filter((item) => item.visible).length === 0;
        });
        this.selectAvailableCategory();
    }
    render() {
        return html `
      <div class="element">
        ${this.displayFilter === true ? this.renderFilter() : nothing}
        ${this.renderMessages()}
        ${this.selectedCategory === null ? nothing : html `
          <div class="main">
            ${this.categories.items.length > 1 && this.displayMenu === true ? html `
              <div class="navigation">
                ${this.renderNavigationToggle()}
                ${this.renderNavigationList()}
              </div>` : nothing}
            <div class="content">
              ${this.renderCategories()}
            </div>
          </div>
        `}
      </div>
    `;
    }
    renderFilter() {
        return html `
      <form class="filter" @submit="${(event) => event.preventDefault()}">
        <input
          name="search"
          type="search"
          autocomplete="off"
          class="form-control"
          .value="${this.searchTerm}"
          @input="${(event) => { this.filter(event.target.value); }}"
          @keydown="${(event) => { if (event.key === KeyTypesEnum.ESCAPE) {
            event.stopImmediatePropagation();
            this.filter('');
        } }}"
          placeholder="${this.getLanguageLabel(this.searchPlaceholder)}"
        />
      </form>
    `;
    }
    renderMessages() {
        return html `${this.messages.length > 0 ?
            html `<div class="messages">${this.messages.map((message) => html `<div class="alert alert-${message.severity}" role="alert">${message.message}</div>`)}</div>` :
            nothing}`;
    }
    renderNavigationToggle() {
        return html `
        <button
          class="navigation-toggle btn btn-light"
          @click="${() => { this.toggleMenu = !this.toggleMenu; }}"
        >
          ${this.selectedCategory.label}
          <typo3-backend-icon identifier="actions-chevron-${(this.toggleMenu === true) ? 'up' : 'down'}" size="small"></typo3-backend-icon>
        </button>
      `;
    }
    renderNavigationList() {
        return html `
      <div class="navigation-list${(this.toggleMenu === true) ? ' show' : ''}" role="tablist">
    ${this.categories.items.map((category) => {
            return html `
        <button
          data-identifier="${category.identifier}"
          class="navigation-item${(this.selectedCategory === category) ? ' active' : ''}"
          ?disabled="${category.disabled}"
          @click="${() => { this.selectedCategory = category; this.toggleMenu = false; }}"
        >
          <span class="navigation-item-label">${category.label}</span>
          <span class="navigation-item-count">${category.activeItems().length}</span>
        </button>
      `;
        })}
      </div>`;
    }
    renderCategories() {
        return html `
      <div class="elementwizard-categories">
  ${this.categories.items.map((category) => {
            return this.renderCategory(category);
        })}
      </div>
    `;
    }
    renderCategory(category) {
        return html `${(this.selectedCategory === category || this.displayMenu === false) && !category.disabled ?
            html `
        <div class="elementwizard-category">
          ${this.displayMenu === false ? html `<div class="elementwizard-category-headline">${category.label}</div>` : nothing}
          <div class="elementwizard-category-items">
            ${category.items.map((item) => this.renderCategoryItem(item))}
          </div>
        </div>` :
            nothing}`;
    }
    renderCategoryItem(item) {
        return html `${item.visible ?
            html `
      <button
        type="button"
        class="item"
        data-identifier="${item.identifier}"
        @click="${(event) => { event.preventDefault(); this.handleItemClick(item); }}"
      >
        <div class="item-icon">
          <typo3-backend-icon identifier="${item.icon || 'empty-empty'}" size="medium"></typo3-backend-icon>
        </div>
        <div class="item-body">
          <div class="item-body-label">${item.label}</div>
          <div class="item-body-description">${item.description}</div>
        </div>
      </button>
      ` :
            nothing}`;
    }
    handleItemClick(item) {
        if (item.requestType === 'event') {
            const event = new CustomEvent(item.event, {
                detail: {
                    item: item
                }
            });
            this.dispatchEvent(event);
            Modal.dismiss();
            return;
        }
        if (item.url.trim() === '') {
            return;
        }
        if (item.requestType === 'location') {
            Viewport.ContentContainer.setUrl(item.url);
            Modal.dismiss();
            return;
        }
        if (item.requestType === 'ajax') {
            (new AjaxRequest(item.url)).post({
                defVals: item.defaultValues,
                saveAndClose: item.saveAndClose ? '1' : '0'
            }).then(async (response) => {
                const result = document.createRange().createContextualFragment(await response.resolve());
                // Handle buttons with data-target
                Modal.currentModal.addEventListener('modal-updated', () => {
                    new RegularEvent('click', (e, eventTarget) => {
                        e.preventDefault();
                        const target = eventTarget.dataset.target;
                        if (!target) {
                            return;
                        }
                        Viewport.ContentContainer.setUrl(target);
                        Modal.dismiss();
                    }).delegateTo(Modal.currentModal, 'button[data-target]');
                });
                Modal.currentModal.setContent(result);
            }).catch(() => {
                Notification.error('Could not load module data');
            });
        }
    }
};
__decorate([
    property({
        type: Object,
        converter: {
            fromAttribute: (value) => {
                const data = JSON.parse(value);
                return Categories.fromData(data);
            },
        }
    })
], NewRecordWizard.prototype, "categories", void 0);
__decorate([
    property({ type: String })
], NewRecordWizard.prototype, "searchPlaceholder", void 0);
__decorate([
    property({ type: String })
], NewRecordWizard.prototype, "searchNothingFoundLabel", void 0);
__decorate([
    property({
        type: Boolean,
        converter: booleanConverter
    })
], NewRecordWizard.prototype, "displayMenu", void 0);
__decorate([
    property({
        type: Boolean,
        converter: booleanConverter
    })
], NewRecordWizard.prototype, "displayFilter", void 0);
__decorate([
    property({ type: String, attribute: false })
], NewRecordWizard.prototype, "selectedCategory", void 0);
__decorate([
    property({ type: String, attribute: false })
], NewRecordWizard.prototype, "searchTerm", void 0);
__decorate([
    property({ type: Array, attribute: false })
], NewRecordWizard.prototype, "messages", void 0);
__decorate([
    property({ type: Boolean, attribute: false })
], NewRecordWizard.prototype, "toggleMenu", void 0);
NewRecordWizard = __decorate([
    customElement('typo3-backend-new-record-wizard')
], NewRecordWizard);
export { NewRecordWizard };
