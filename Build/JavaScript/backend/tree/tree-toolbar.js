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
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators';
import { lll } from '@typo3/core/lit-helper';
import DebounceEvent from '@typo3/core/event/debounce-event';
import '@typo3/backend/element/icon-element';
import { Tree } from './tree';
let TreeToolbar = class TreeToolbar extends LitElement {
    constructor() {
        super(...arguments);
        this.tree = null;
        this.settings = {
            searchInput: '.search-input',
            filterTimeout: 450
        };
    }
    createRenderRoot() {
        return this;
    }
    firstUpdated() {
        const inputEl = this.querySelector(this.settings.searchInput);
        if (inputEl) {
            new DebounceEvent('input', (evt) => {
                const el = evt.target;
                this.tree.filter(el.value.trim());
            }, this.settings.filterTimeout).bindTo(inputEl);
        }
    }
    render() {
        return html `
      <div class="tree-toolbar">
        <div class="tree-toolbar__menu">
          <div class="tree-toolbar__search">
              <label for="toolbarSearch" class="visually-hidden">
                ${lll('labels.label.searchString')}
              </label>
              <input type="search" id="toolbarSearch" class="form-control form-control-sm search-input" placeholder="${lll('tree.searchTermInfo')}">
          </div>
        </div>
        <div class="tree-toolbar__submenu">
          <button
            type="button"
            class="tree-toolbar__menuitem dropdown-toggle dropdown-toggle-no-chevron float-end"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <typo3-backend-icon identifier="actions-menu-alternative" size="small"></typo3-backend-icon>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button class="dropdown-item" @click="${() => this.refreshTree()}">
                <span class="dropdown-item-columns">
                  <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
                    <typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>
                  </span>
                  <span class="dropdown-item-column dropdown-item-column-title">
                    ${lll('labels.refresh')}
                  </span>
                </span>
              </button>
            </li>
            <li>
              <button class="dropdown-item" @click="${(evt) => this.collapseAll(evt)}">
                <span class="dropdown-item-columns">
                  <span class="dropdown-item-column dropdown-item-column-icon" aria-hidden="true">
                    <typo3-backend-icon identifier="apps-pagetree-category-collapse-all" size="small"></typo3-backend-icon>
                  </span>
                  <span class="dropdown-item-column dropdown-item-column-title">
                    ${lll('labels.collapse')}
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    `;
    }
    refreshTree() {
        this.tree.refreshOrFilterTree();
    }
    collapseAll(evt) {
        evt.preventDefault();
        // Only collapse nodes that aren't on the root level
        // @TODO Implement into tree
        this.tree.nodes.forEach((node) => {
            if (node.__parents.length) {
                this.tree.hideChildren(node);
            }
        });
    }
};
__decorate([
    property({ type: Tree })
], TreeToolbar.prototype, "tree", void 0);
TreeToolbar = __decorate([
    customElement('typo3-backend-tree-toolbar')
], TreeToolbar);
export { TreeToolbar };
