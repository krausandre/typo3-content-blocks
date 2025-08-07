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
import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { live } from 'lit/directives/live.js';
import '@typo3/backend/element/spinner-element';
import '@typo3/backend/element/icon-element';
import Notification from '@typo3/backend/notification';
import DomHelper from '@typo3/backend/utility/dom-helper';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { copyToClipboard } from '@typo3/backend/copy-to-clipboard';
import { lll } from '@typo3/core/lit-helper';
import { markdown } from '@typo3/core/directive/markdown';
import '@typo3/backend/settings/editor/editable-setting';
import { SettingsMode, sanitizeSettingsMode } from '@typo3/backend/settings/enum/settings-mode.enum';
import '@typo3/backend/element/icon-element';
// preload known/common types
import '@typo3/backend/settings/type/bool';
import '@typo3/backend/settings/type/int';
import '@typo3/backend/settings/type/number';
import '@typo3/backend/settings/type/string';
import '@typo3/backend/settings/type/stringlist';
export class SettingsEditorSubmitEvent extends Event {
    static { this.eventName = 'typo3:settings-editor:submit'; }
    constructor(originalEvent, formData) {
        super(SettingsEditorSubmitEvent.eventName, {
            bubbles: true,
            composed: true,
            cancelable: false,
        });
        this.originalEvent = originalEvent;
        this.formData = formData;
    }
}
let SettingsEditorElement = class SettingsEditorElement extends LitElement {
    constructor() {
        super(...arguments);
        this.formName = 'settings_form';
        this.customFormData = {};
        this.mode = SettingsMode.basic;
        this.searchTerm = '';
        this.activeCategory = '';
        this.visibleCategories = {};
        this.observer = null;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.observer?.disconnect();
    }
    createRenderRoot() {
        return this;
    }
    adjustNavigationSize() {
        const scrollableParent = DomHelper.scrollableParent(this);
        const container = this.querySelector('.settings-navigation-inner');
        const settingsSearchElement = this.querySelector('.settings-search');
        const settingsNavigationElement = this.querySelector('.settings-navigation');
        if (settingsNavigationElement === null) {
            return;
        }
        if (container) {
            const scrollableParentRect = scrollableParent.getBoundingClientRect();
            const navigationRect = settingsNavigationElement.getBoundingClientRect();
            const startPosition = settingsSearchElement?.getBoundingClientRect().bottom ?? Math.max(scrollableParentRect.top, container.getBoundingClientRect().top);
            const maxHeight = scrollableParentRect.bottom - Math.max(0, scrollableParentRect.bottom - navigationRect.bottom) - startPosition;
            container.style.maxHeight = `${maxHeight}px`;
        }
    }
    firstUpdated() {
        const scrollableParent = DomHelper.scrollableParent(this);
        scrollableParent.addEventListener('scroll', () => {
            this.adjustNavigationSize();
        });
    }
    updated(changedProperties) {
        if (changedProperties.has('mode') && this.mode === SettingsMode.minimal) {
            this.observer?.disconnect();
            this.observer = null;
        }
        else if (changedProperties.has('mode') && this.mode !== SettingsMode.minimal) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const key = entry.target.dataset.key;
                    this.visibleCategories[key] = entry.isIntersecting;
                });
                const flatten = (list) => list.reduce((acc, c) => [...acc, c.key, ...flatten(c.categories)], []);
                const active = flatten(this.categories).filter(key => this.visibleCategories[key])[0] || '';
                if (active) {
                    this.activeCategory = active;
                }
            }, {
                root: DomHelper.scrollableParent(this),
                threshold: 0.1,
            });
        }
        [...this.renderRoot.querySelectorAll('.settings-category')].map(entry => this.observer?.observe(entry));
        this.adjustNavigationSize();
        if (changedProperties.has('activeCategory')) {
            const container = this.querySelector('.settings-navigation-inner');
            const activeElement = this.querySelector('.settings-navigation-item.active');
            if (container && activeElement) {
                const currentScrollPosition = container.scrollTop;
                const containerHeight = container.getBoundingClientRect().height;
                const nodeHeight = activeElement.getBoundingClientRect().height;
                const nodeFitsTop = activeElement.offsetTop >= currentScrollPosition;
                const nodeFitsBottom = activeElement.offsetTop + nodeHeight <= currentScrollPosition + containerHeight;
                if (!nodeFitsTop) {
                    this.querySelector('.settings-navigation-inner').scrollTo({ top: Math.max(0, activeElement.offsetTop - nodeHeight), behavior: 'auto' });
                }
                else if (!nodeFitsBottom) {
                    this.querySelector('.settings-navigation-inner').scrollTo({ top: Math.max(0, activeElement.offsetTop + nodeHeight), behavior: 'auto' });
                }
            }
        }
    }
    renderCategoryTree(categories, level) {
        const fallbackIcon = DomHelper.isRTL() ? 'actions-chevron-left' : 'actions-chevron-right';
        return html `
      <ul data-level=${level}>
        ${categories.map(category => html `
          <li ?hidden=${category.__hidden}>
            <button
              type="button"
              @click=${(event) => { event.preventDefault(); this.selectCategory(category); }}
              class="settings-navigation-item ${this.activeCategory === category.key ? 'active' : ''}"
            >
                <span class="settings-navigation-item-icon">
                  <typo3-backend-icon identifier=${category.icon ? category.icon : fallbackIcon} size="small"></typo3-backend-icon>
                </span>
              <span class="settings-navigation-item-label">${category.label}</span>
            </button>
            ${category.categories.length === 0 ? nothing : html `
              ${this.renderCategoryTree(category.categories, level + 1)}
            `}
          </li>
        `)}
      </ul>
    `;
    }
    renderSettings(categories, level) {
        return categories.map(category => html `
      <div class="settings-category-list" data-key=${category.key}>
        <div class="settings-category" data-key=${category.key} ?hidden=${category.__hidden}>
          ${this.renderHeadline(Math.min(level + 1, 6), `category-headline-${category.key}`, category.icon, html `${category.label}`)}
          <div class="settings-category-description">
            ${category.description ? markdown(category.description, 'minimal') : nothing}
          </div>
        </div>
        ${category.settings.map((setting) => html `
          <typo3-backend-editable-setting
              ?hidden=${setting.__hidden}
              .setting=${setting}
              .dumpuri=${this.dumpUrl}
              .mode=${this.mode}
          ></typo3-backend-editable-setting>
        `)}
      </div>
      ${category.categories.length === 0 ? nothing : html `
        ${this.renderSettings(category.categories, level + 1)}
      `}
    `);
    }
    renderHeadline(level, id, icon, content) {
        switch (level) {
            case 1:
                return html `<h1 class="settings-category-headline" id=${id}>${icon ? html `<typo3-backend-icon identifier=${icon}></typo3-backend-icon>` : nothing}${content}</h1>`;
            case 2:
                return html `<h2 class="settings-category-headline" id=${id}>${icon ? html `<typo3-backend-icon identifier=${icon}></typo3-backend-icon>` : nothing}${content}</h2>`;
            case 3:
                return html `<h3 class="settings-category-headline" id=${id}>${icon ? html `<typo3-backend-icon identifier=${icon}></typo3-backend-icon>` : nothing}${content}</h3>`;
            case 4:
                return html `<h4 class="settings-category-headline" id=${id}>${icon ? html `<typo3-backend-icon identifier=${icon}></typo3-backend-icon>` : nothing}${content}</h4>`;
            case 5:
                return html `<h5 class="settings-category-headline" id=${id}>${icon ? html `<typo3-backend-icon identifier=${icon}></typo3-backend-icon>` : nothing}${content}</h5>`;
            case 6:
                return html `<h6 class="settings-category-headline" id=${id}>${icon ? html `<typo3-backend-icon identifier=${icon}></typo3-backend-icon>` : nothing}${content}</h6>`;
            default:
                throw new Error(`Invalid header level: ${level}`);
        }
    }
    selectCategory(category) {
        const targetSelector = `#category-headline-${category.key}`;
        const target = this.renderRoot.querySelector(targetSelector.replaceAll('.', '\\.'));
        const scrollableParent = DomHelper.scrollableParent(this);
        const searchOffset = this.renderRoot.querySelector('.settings-search').offsetHeight;
        const bodyOffset = parseInt(window.getComputedStyle(this.renderRoot.querySelector('.settings-body-inner')).paddingTop, 10);
        const topPosition = target.offsetTop - searchOffset - bodyOffset;
        scrollableParent.scrollTo({
            top: topPosition,
            behavior: 'smooth'
        });
        this.activeCategory = category.key;
    }
    async onSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        const normalizedData = {
            settings: {},
        };
        formData.forEach((value, key) => {
            const match = key.match(/^settings\[(.+?)\]$/);
            if (match) {
                normalizedData.settings[match[1]] = typeof value === 'string' ? value : value.name;
            }
            else {
                normalizedData[key] = typeof value === 'string' ? value : value.name;
            }
        });
        this.dispatchEvent(new SettingsEditorSubmitEvent(e, normalizedData));
        if (e.defaultPrevented) {
            return;
        }
        if (e.submitter?.value === 'export') {
            e.preventDefault();
            const formData = new FormData(form);
            const response = await new AjaxRequest(this.dumpUrl).post(formData);
            const result = await response.resolve();
            if (typeof result.yaml === 'string') {
                copyToClipboard(result.yaml);
            }
            else {
                console.warn('Value can not be copied to clipboard.', typeof result.yaml);
                Notification.error(lll('copyToClipboard.error'));
            }
        }
    }
    async onSearch(e) {
        e.preventDefault();
        this.searchTerm = e.currentTarget.value;
    }
    render() {
        const categories = this.filterCategories();
        const hasVisibleCategories = categories.filter(c => !c.__hidden).length > 0;
        return html `
      <form class="settings-container"
            id=${this.formName}
            name=${this.formName}
            action=${this.actionUrl}
            method="post"
            @submit=${(e) => this.onSubmit(e)}
      >
        ${Object.entries(this.customFormData).map(([name, value]) => html `
          <input type="hidden" name=${name} value=${value}>
        `)}

        <div class="settings">

          ${this.mode !== SettingsMode.minimal ? html `
            <div class="settings-search">
              <label for="settings-search" class="visually-hidden">
                ${lll('settingseditor.search.searchTermVisuallyHiddenLabel')}
              </label>
              <input
                type="search"
                id="settings-search"
                class="form-control"
                placeholder=${lll('settingseditor.search.searchTermPlaceholder')}
                .value=${live(this.searchTerm)}
                @change=${(e) => this.onSearch(e)}
                @input=${(e) => this.onSearch(e)}>
            </div>
            ` : nothing}

          ${this.mode !== SettingsMode.minimal ? html `
            <div class="settings-navigation" ?hidden=${!hasVisibleCategories}>
              <div
                class="settings-navigation-inner"
                @transitionend="${() => this.adjustNavigationSize()}"
              >
                ${this.renderCategoryTree(categories ?? [], 1)}
              </div>
            </div>
            ` : nothing}

          <div class="settings-body" ?hidden=${!hasVisibleCategories}>
            <div class="settings-body-inner">
              ${this.renderSettings(categories ?? [], 1)}
            </div>
          </div>
        </div>

        ${hasVisibleCategories ? nothing : html `
          <div class="callout callout-info mt-3">
            <div class="callout-icon">
              <span class="icon-emphasized">
                <typo3-backend-icon identifier="actions-info" size="small"></typo3-backend-icon>
              </span>
            </div>
            <div class="callout-content">
              <div class="callout-title">${lll('settingseditor.search.noResultsTitle')}</div>
              <div class="callout-body">
                <p>${lll('settingseditor.search.noResultsMessage')}</p>
                <button
                    type="button"
                    class="btn btn-default"
                    @click=${() => this.searchTerm = ''}
                  >${lll('settingseditor.search.noResultsResetButtonLabel')}</button>
              </div>
            </div>
          </div>
        `}
      </form>
    `;
    }
    filterCategories(categories = null) {
        categories ??= this.categories;
        return categories.map(category => {
            const settings = this.filterSettings(category.settings);
            const subcategories = this.filterCategories(category.categories);
            const hasVisibleSettings = settings.filter(setting => !setting.__hidden).length > 0;
            const hasVisibleSubcategories = subcategories.filter(c => !c.__hidden).length > 0;
            return {
                ...category,
                settings,
                categories: subcategories,
                __hidden: !hasVisibleSettings && !hasVisibleSubcategories
            };
        });
    }
    filterSettings(settings) {
        return settings.map((setting) => {
            return {
                ...setting,
                __hidden: !(this.matchesSearchTerm(setting.definition.key) ||
                    this.matchesSearchTerm(setting.definition.label) ||
                    this.matchesSearchTerm(setting.definition.description ?? '') ||
                    this.valueMatchesSearchTerm(setting.value) ||
                    setting.definition.tags.filter(tag => this.matchesSearchTerm(tag)).length > 0)
            };
        });
    }
    matchesSearchTerm(input) {
        if (this.searchTerm === '') {
            return true;
        }
        return this.matchesSubstring(input, this.searchTerm);
    }
    valueMatchesSearchTerm(value) {
        if (typeof value === 'string') {
            return this.matchesSearchTerm(value);
        }
        if (Array.isArray(value)) {
            return value.filter(v => typeof v === 'string' && this.matchesSearchTerm(v)).length > 0;
        }
        return false;
    }
    matchesSubstring(input, searchString) {
        return input.toLowerCase().includes(searchString.toLowerCase());
    }
};
__decorate([
    property({ type: Array })
], SettingsEditorElement.prototype, "categories", void 0);
__decorate([
    property({ type: String, attribute: 'form-name' })
], SettingsEditorElement.prototype, "formName", void 0);
__decorate([
    property({ type: String, attribute: 'action-url' })
], SettingsEditorElement.prototype, "actionUrl", void 0);
__decorate([
    property({ type: String, attribute: 'dump-url' })
], SettingsEditorElement.prototype, "dumpUrl", void 0);
__decorate([
    property({ type: Object, attribute: 'custom-form-data' })
], SettingsEditorElement.prototype, "customFormData", void 0);
__decorate([
    property({ type: String, converter: sanitizeSettingsMode })
], SettingsEditorElement.prototype, "mode", void 0);
__decorate([
    state()
], SettingsEditorElement.prototype, "searchTerm", void 0);
__decorate([
    state()
], SettingsEditorElement.prototype, "activeCategory", void 0);
SettingsEditorElement = __decorate([
    customElement('typo3-backend-settings-editor')
], SettingsEditorElement);
export { SettingsEditorElement };
