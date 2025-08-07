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
import Client from '@typo3/backend/storage/client';
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
export class CollapseStatePersister {
    constructor() {
        this.localStorageKey = 'collapse-states-';
        this.localStorageKeyDefaultSuffix = 'general';
        this.searchValueSelector = '.t3js-collapse-search-term';
        this.searchField = null;
        this.searchForm = null;
        this.stateCache = new Map();
        DocumentService.ready().then(() => {
            this.searchField = document.querySelector(this.searchValueSelector);
            if (this.searchField !== null) {
                this.searchForm = this.searchField.closest('form');
                this.searchField.value = Client.get(this.searchField.dataset.persistCollapseSearchKey) ?? '';
            }
            this.registerEventListener();
            this.recoverStates();
        });
    }
    registerEventListener() {
        const delegateEventTo = '.collapse[data-persist-collapse-state="true"]';
        new RegularEvent('show.bs.collapse', (e) => {
            const element = e.target;
            if (element.dataset.persistCollapseState === 'true'
                && ((this.searchField !== null && this.searchField.value === '') || element.dataset.persistCollapseStateNotIfSearch === undefined)) {
                // Persist state only, if there is no search input field, or no search is performed
                this.toStorage(element, true);
            }
        }).delegateTo(document, delegateEventTo);
        new RegularEvent('hide.bs.collapse', (e) => {
            const element = e.target;
            if (element.dataset.persistCollapseState === 'true'
                && ((this.searchField !== null && this.searchField.value === '') || element.dataset.persistCollapseStateNotIfSearch === undefined)) {
                // Persist state only, if there is no search input field, or no search is performed
                this.toStorage(element, false);
            }
        }).delegateTo(document, delegateEventTo);
        if (this.searchForm !== null) {
            new RegularEvent('submit', (e) => {
                e.preventDefault();
                if (this.searchField !== null && this.searchField.value === '') {
                    this.recoverStates();
                }
            }).bindTo(this.searchForm);
        }
    }
    recoverStates() {
        const collapseStateElements = document.querySelectorAll('.collapse[data-persist-collapse-state="true"]');
        collapseStateElements.forEach((element) => {
            const suffix = element.dataset.persistCollapseStateSuffix ?? this.localStorageKeyDefaultSuffix;
            const currentStates = this.fromStorage(suffix);
            const id = element.id;
            if (id === '' || !this.shallRecoverState(element)) {
                return;
            }
            const storeExpandedState = (element.dataset.persistCollapseStateIfState ?? 'shown') === 'shown';
            const storeHiddenState = (element.dataset.persistCollapseStateIfState ?? 'hidden') === 'hidden';
            const isExpanded = element.classList.contains('show');
            if (storeExpandedState === true) {
                // We're not using BootstrapCollapse.getOrCreateInstance() since this is too slow when
                // dealing with many elements like with System > Configuration with TCA tree.
                if (currentStates[id] === true) {
                    if (!isExpanded) {
                        const toggle = document.querySelector('[data-bs-target="#' + id + '"]');
                        toggle.classList.remove('collapsed');
                        toggle.setAttribute('aria-expanded', 'true');
                        element.classList.add('show');
                    }
                }
                else {
                    if (isExpanded) {
                        const toggle = document.querySelector('[data-bs-target="#' + id + '"]');
                        toggle.classList.add('collapsed');
                        toggle.setAttribute('aria-expanded', 'false');
                        element.classList.remove('show');
                    }
                }
            }
            if (storeHiddenState === true) {
                if (currentStates[id] === false) {
                    if (isExpanded) {
                        const toggle = document.querySelector('[data-bs-target="#' + id + '"]');
                        toggle.classList.add('collapsed');
                        toggle.setAttribute('aria-expanded', 'false');
                        element.classList.remove('show');
                    }
                }
                else {
                    if (!isExpanded) {
                        const toggle = document.querySelector('[data-bs-target="#' + id + '"]');
                        toggle.classList.remove('collapsed');
                        toggle.setAttribute('aria-expanded', 'true');
                        element.classList.add('show');
                    }
                }
            }
        });
    }
    shallRecoverState(element) {
        if (element.dataset.persistCollapseStateNotIfSearch === undefined
            || element.dataset.persistCollapseStateNotIfSearch === 'false') {
            return true;
        }
        return this.searchField !== null && this.searchField.value === '';
    }
    fromStorage(suffix) {
        let result;
        if (this.stateCache.has(this.localStorageKey + suffix)) {
            result = this.stateCache.get(this.localStorageKey + suffix);
        }
        else {
            const currentStates = Client.get(this.localStorageKey + suffix);
            result = currentStates !== null ? JSON.parse(currentStates) : {};
            this.stateCache.set(this.localStorageKey + suffix, result);
        }
        return result;
    }
    toStorage(element, expanded) {
        const key = element.id;
        const suffix = element.dataset.persistCollapseStateSuffix ?? this.localStorageKeyDefaultSuffix;
        const currentStates = this.fromStorage(suffix);
        const storeExpandedState = (element.dataset.persistCollapseStateIfState ?? 'shown') === 'shown';
        const storeHiddenState = (element.dataset.persistCollapseStateIfState ?? 'hidden') === 'hidden';
        if (expanded === true && storeExpandedState === true && currentStates[key] !== true) {
            currentStates[key] = true;
            this.updateStates(this.localStorageKey + suffix, currentStates);
        }
        if (expanded === true && storeHiddenState === true && currentStates[key] === false) {
            delete currentStates[key];
            this.updateStates(this.localStorageKey + suffix, currentStates);
        }
        if (expanded === false && storeHiddenState === true && currentStates[key] !== false) {
            currentStates[key] = false;
            this.updateStates(this.localStorageKey + suffix, currentStates);
        }
        if (expanded === false && storeExpandedState === true && currentStates[key] === true) {
            delete currentStates[key];
            this.updateStates(this.localStorageKey + suffix, currentStates);
        }
    }
    updateStates(key, currentStates) {
        Client.set(key, JSON.stringify(currentStates));
        this.stateCache.set(key, currentStates);
    }
}
export default new CollapseStatePersister();
