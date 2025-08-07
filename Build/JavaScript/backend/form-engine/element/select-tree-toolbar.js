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
import { customElement } from 'lit/decorators';
import { lll } from '@typo3/core/lit-helper';
let SelectTreeToolbar = class SelectTreeToolbar extends LitElement {
    constructor() {
        super(...arguments);
        this.settings = {
            collapseAllBtn: 'collapse-all-btn',
            expandAllBtn: 'expand-all-btn',
            searchInput: 'search-input',
            toggleHideUnchecked: 'hide-unchecked-btn'
        };
        /**
         * State of the hide unchecked toggle button
         *
         * @type {boolean}
         */
        this.hideUncheckedState = false;
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    render() {
        return html `
      <div class="tree-toolbar btn-toolbar">
        <div class="input-group">
          <span class="input-group-text input-group-icon filter">
            <typo3-backend-icon identifier="actions-filter" size="small"></typo3-backend-icon>
          </span>
          <input type="search" class="form-control ${this.settings.searchInput}" placeholder="${lll('tcatree.findItem')}" @input="${(evt) => this.filter(evt)}">
        </div>
        <div class="btn-group">
          <button type="button" class="btn btn-default ${this.settings.expandAllBtn}" title="${lll('tcatree.expandAll')}" @click="${() => this.expandAll()}">
            <typo3-backend-icon identifier="apps-pagetree-category-expand-all" size="small"></typo3-backend-icon>
          </button>
          <button type="button" class="btn btn-default ${this.settings.collapseAllBtn}" title="${lll('tcatree.collapseAll')}" @click="${(evt) => this.collapseAll(evt)}">
            <typo3-backend-icon identifier="apps-pagetree-category-collapse-all" size="small"></typo3-backend-icon>
          </button>
          <button type="button" class="btn btn-default ${this.settings.toggleHideUnchecked}" title="${lll('tcatree.toggleHideUnchecked')}" @click="${() => this.toggleHideUnchecked()}">
            <typo3-backend-icon identifier="apps-pagetree-category-toggle-hide-checked" size="small"></typo3-backend-icon>
          </button>
        </div>
      </div>
    `;
    }
    /**
     * Collapse children of root node
     */
    collapseAll(evt) {
        evt.preventDefault();
        // Only collapse nodes that aren't on the root level
        this.tree.nodes.forEach((node) => {
            if (node.__parents.length) {
                this.tree.hideChildren(node);
            }
        });
    }
    /**
     * Expand all nodes
     */
    expandAll() {
        this.tree.expandAll();
    }
    filter(event) {
        const inputEl = event.target;
        this.tree.filter(inputEl.value.trim());
    }
    /**
     * Show only checked items
     */
    toggleHideUnchecked() {
        this.hideUncheckedState = !this.hideUncheckedState;
        if (this.hideUncheckedState) {
            this.tree.nodes.forEach((node) => {
                if (node.checked) {
                    this.tree.showParents(node);
                    node.expanded = true;
                    node.__hidden = false;
                }
                else {
                    node.expanded = false;
                    node.__hidden = true;
                }
            });
        }
        else {
            this.tree.nodes.forEach((node) => node.__hidden = false);
        }
    }
};
SelectTreeToolbar = __decorate([
    customElement('typo3-backend-form-selecttree-toolbar')
], SelectTreeToolbar);
export { SelectTreeToolbar };
