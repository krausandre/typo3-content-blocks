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
import { lll } from '@typo3/core/lit-helper';
import Modal from '../modal';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/input/clearable';
import '../live-search/element/hint';
import '../live-search/element/result/result-pagination';
import '../live-search/element/search-option-item';
import '../live-search/live-search-shortcut';
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
import DebounceEvent from '@typo3/core/event/debounce-event';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import BrowserSession from '@typo3/backend/storage/browser-session';
import { componentName as resultContainerComponentName } from '@typo3/backend/live-search/element/result/result-container';
import { ModuleStateStorage } from '@typo3/backend/storage/module-state-storage';
var Identifiers;
(function (Identifiers) {
    Identifiers["toolbarItem"] = ".t3js-topbar-button-search";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/backend/toolbar/live-search
 * Global search to deal with everything in the backend that is search-related
 * @exports @typo3/backend/toolbar/live-search
 */
class LiveSearch {
    constructor() {
        this.currentSearchRequest = null;
        this.search = async (formData) => {
            const query = formData.get('query').toString();
            if (query === '') {
                this.updateSearchResults(null);
            }
            else {
                const searchResultContainer = document.querySelector(resultContainerComponentName);
                searchResultContainer.loading = true;
                this.currentSearchRequest?.abort();
                try {
                    this.currentSearchRequest = new AjaxRequest(TYPO3.settings.ajaxUrls.livesearch);
                    const response = await this.currentSearchRequest.post(formData);
                    const json = await response.raw().json();
                    this.currentSearchRequest = null;
                    this.updateSearchResults(json);
                }
                catch (err) {
                    if (err instanceof DOMException && err.name === 'AbortError') {
                        // Request has been aborted, do not flood the error console
                        return;
                    }
                    // Something else happened, throw again
                    throw err;
                }
            }
        };
        DocumentService.ready().then(() => {
            this.registerEvents();
        });
    }
    registerEvents() {
        new RegularEvent('click', () => {
            this.openSearchModal();
        }).delegateTo(document, Identifiers.toolbarItem);
        new RegularEvent('typo3:live-search:trigger-open', () => {
            if (Modal.currentModal) {
                return;
            }
            this.openSearchModal();
        }).bindTo(document);
    }
    openSearchModal() {
        const url = new URL(TYPO3.settings.ajaxUrls.livesearch_form, window.location.origin);
        const moduleStateStorage = ModuleStateStorage.current('web');
        if (moduleStateStorage.identifier) {
            url.searchParams.set('pageId', moduleStateStorage.identifier);
        }
        url.searchParams.set('query', BrowserSession.get('livesearch-term') ?? '');
        url.searchParams.set('offset', BrowserSession.get('livesearch-offset') ?? '0');
        const persistedSearchOptions = Object.entries(BrowserSession.getByPrefix('livesearch-option-'))
            .filter((item) => item[1] === '1')
            .map((item) => {
            const trimmedKey = item[0].replace('livesearch-option-', '');
            const [key, value] = trimmedKey.split('-', 2);
            return { key, value };
        });
        const searchOptions = this.composeSearchOptions(persistedSearchOptions);
        for (const [optionKey, optionValues] of Object.entries(searchOptions)) {
            for (const optionValue of optionValues) {
                url.searchParams.append(`${optionKey}[]`, optionValue);
            }
        }
        const modal = Modal.advanced({
            type: Modal.types.ajax,
            content: url.toString(),
            title: lll('labels.search'),
            severity: SeverityEnum.notice,
            size: Modal.sizes.medium,
            ajaxCallback: () => {
                const liveSearchContainer = modal.querySelector('typo3-backend-live-search');
                const searchForm = liveSearchContainer.querySelector('form');
                const searchField = searchForm.querySelector('input[type="search"]');
                const offsetField = searchForm.querySelector('input[name="offset"]');
                new RegularEvent('livesearch:demand-changed', () => {
                    offsetField.value = '0';
                    searchForm.requestSubmit();
                }).bindTo(liveSearchContainer);
                new RegularEvent('livesearch:pagination-selected', (e) => {
                    offsetField.value = e.detail.offset.toString(10);
                    searchForm.requestSubmit();
                }).bindTo(liveSearchContainer);
                new RegularEvent('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(searchForm);
                    this.search(formData).then(() => {
                        const query = formData.get('query').toString();
                        const offset = formData.get('offset')?.toString();
                        BrowserSession.set('livesearch-term', query);
                        if (offset) {
                            BrowserSession.set('livesearch-offset', offset);
                        }
                    });
                    const optionCounterElement = searchForm.querySelector('[data-active-options-counter]');
                    const count = parseInt(optionCounterElement.dataset.activeOptionsCounter, 10);
                    optionCounterElement.querySelector('output').textContent = count.toString(10);
                    optionCounterElement.classList.toggle('hidden', count === 0);
                }).bindTo(searchForm);
                searchField.clearable({
                    onClear: () => {
                        searchForm.requestSubmit();
                    },
                });
                const searchResultContainer = document.querySelector('typo3-backend-live-search-result-container');
                new RegularEvent('live-search:item-chosen', () => {
                    Modal.dismiss();
                }).bindTo(searchResultContainer);
                new RegularEvent('typo3:live-search:option-invoked', (e) => {
                    const optionCounterElement = searchForm.querySelector('[data-active-options-counter]');
                    let count = parseInt(optionCounterElement.dataset.activeOptionsCounter, 10);
                    count = e.detail.active ? count + 1 : count - 1;
                    // Update data attribute only, the visible text content is updated in the submit handler
                    optionCounterElement.dataset.activeOptionsCounter = count.toString(10);
                    liveSearchContainer.dispatchEvent(new CustomEvent('livesearch:demand-changed'));
                }).bindTo(liveSearchContainer);
                new DebounceEvent('input', () => {
                    liveSearchContainer.dispatchEvent(new CustomEvent('livesearch:demand-changed'));
                }).bindTo(searchField);
                new RegularEvent('keydown', this.handleKeyDown).bindTo(searchField);
                searchForm.requestSubmit();
            }
        });
        /**
         * The events `modal-loaded` and `typo3-modal-shown` are dispatched in any order, therefore we have to listen to
         * both events to handle search field focus. Unfortunately, there's currently a bug that makes it impossible using
         * Promises  instead, which would be much better: https://forge.typo3.org/issues/100026
         *
         * Once the aforementioned issue is fixed, we may use this instead:
         *
         * ```
         * Promise.all([
         *   new Promise(res1 => modal.addEventListener('modal-loaded', res1)),
         *   new Promise(res2 => modal.addEventListener('typo3-modal-shown', res2))
         * ]).then((): void => {
         *   // do stuff here
         * });
         */
        ['modal-loaded', 'typo3-modal-shown'].forEach((eventToListenOn) => {
            modal.addEventListener(eventToListenOn, () => {
                const searchField = modal.querySelector('input[type="search"]');
                if (searchField !== null) {
                    searchField.focus();
                    searchField.select();
                }
            });
        });
    }
    composeSearchOptions(searchOptions) {
        const composedSearchOptions = {};
        searchOptions.forEach((searchOption) => {
            if (composedSearchOptions[searchOption.key] === undefined) {
                composedSearchOptions[searchOption.key] = [];
            }
            composedSearchOptions[searchOption.key].push(searchOption.value);
        });
        return composedSearchOptions;
    }
    handleKeyDown(e) {
        if (e.key !== 'ArrowDown') {
            return;
        }
        e.preventDefault();
        // Select first available result item
        const firstSearchResultItem = document.querySelector('typo3-backend-live-search').querySelector('typo3-backend-live-search-result-item');
        firstSearchResultItem?.focus();
    }
    updateSearchResults(response) {
        const searchResultContainer = document.querySelector('typo3-backend-live-search-result-container');
        searchResultContainer.results = response?.results ?? null;
        searchResultContainer.loading = false;
        this.updatePagination(response?.pagination ?? null);
    }
    updatePagination(pagination) {
        const paginationElement = document.querySelector('typo3-backend-live-search-result-pagination');
        paginationElement.pagination = pagination;
    }
}
let liveSearchObject;
if (!top.TYPO3.LiveSearch) {
    liveSearchObject = new LiveSearch();
    top.TYPO3.LiveSearch = liveSearchObject;
}
else {
    liveSearchObject = top.TYPO3.LiveSearch;
}
export default liveSearchObject;
