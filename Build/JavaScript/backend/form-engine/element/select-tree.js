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
import { html } from 'lit';
import { Tree } from '@typo3/backend/tree/tree';
import { customElement, state } from 'lit/decorators';
let SelectTree = class SelectTree extends Tree {
    constructor() {
        super();
        this.settings = {
            unselectableElements: [],
            exclusiveNodesIdentifiers: '',
            validation: {},
            readOnlyMode: false,
            showIcons: true,
            width: 300,
            dataUrl: '',
            defaultProperties: {},
            expandUpToLevel: null,
        };
        /**
         * Exclusive node which is currently selected
         */
        this.exclusiveSelectedNode = null;
        this.addEventListener('typo3:tree:nodes-prepared', this.prepareLoadedNodes);
    }
    /**
     * Expand all nodes and refresh view
     */
    expandAll() {
        this.nodes.forEach((node) => { this.showChildren(node); });
    }
    /**
     * Node selection logic (triggered by different events) to select multiple
     * nodes (unlike SVG Tree itself).
     */
    selectNode(node, propagate = true) {
        if (!this.isNodeSelectable(node)) {
            return;
        }
        const checked = node.checked;
        this.handleExclusiveNodeSelection(node);
        if (this.settings.validation && this.settings.validation.maxItems) {
            if (!checked && this.getSelectedNodes().length >= this.settings.validation.maxItems) {
                return;
            }
        }
        node.checked = !checked;
        this.dispatchEvent(new CustomEvent('typo3:tree:node-selected', { detail: { node: node, propagate: propagate } }));
    }
    filter(searchTerm) {
        const results = [];
        this.searchTerm = searchTerm;
        if (this.nodes.length) {
            this.nodes[0].__expanded = false;
        }
        const firstNode = this.nodes[0];
        const regex = new RegExp(searchTerm, 'i');
        this.nodes.forEach((node) => {
            // skip the root node in searches
            if (node === firstNode) {
                return;
            }
            node.__expanded = false;
            node.__hidden = true;
            if (regex.test(node.name)) {
                results.push(node);
            }
        });
        results.forEach((node) => {
            node.__hidden = false;
            this.showParents(node);
        });
        // filter for children of results and show them
        const children = this.nodes.filter(node => results.some(result => node.__parents.includes(result.identifier)));
        children.forEach((child) => {
            child.__hidden = false;
        });
    }
    /**
     * Finds and show all parents of node
     */
    showParents(node) {
        if (node.__parents.length === 0) {
            return;
        }
        const parent = this.nodes.find((searchNode) => searchNode.identifier === node.__parents.at(-1));
        parent.__hidden = false;
        parent.__expanded = true;
        this.showParents(parent);
    }
    /**
     * Check whether node can be selected.
     * In some cases (e.g. selecting a parent) it should not be possible to select
     * element (as it's own parent).
     */
    isNodeSelectable(node) {
        return !this.settings.readOnlyMode && this.settings.unselectableElements.indexOf(node.identifier) === -1;
    }
    /**
     * Add checkbox before the icon
     */
    createNodeContent(node) {
        return html `
      ${this.renderCheckbox(node)}
      ${super.createNodeContent(node)}
    `;
    }
    /**
     * Adds svg elements for checkbox rendering.
     */
    renderCheckbox(node) {
        const checked = Boolean(node.checked);
        let icon = 'actions-square';
        if (!this.isNodeSelectable(node) && !checked) {
            icon = 'actions-minus-circle';
        }
        else if (node.checked) {
            icon = 'actions-check-square';
        }
        else if (node.__indeterminate && !checked) {
            icon = 'actions-minus-square';
        }
        return html `
      <span class="node-select">
        <typo3-backend-icon identifier="${icon}" size="small"></typo3-backend-icon>
      </span>
    `;
    }
    /**
     * Check if a node has all information to be used.
     */
    prepareLoadedNodes(evt) {
        const nodes = evt.detail.nodes;
        evt.detail.nodes = nodes.map((node) => {
            if (node.selectable === false) {
                this.settings.unselectableElements.push(node.identifier);
            }
            return node;
        });
    }
    /**
     * Handle exclusive nodes functionality
     * If a node is one of the exclusiveNodesIdentifiers list,
     * all other nodes has to be unselected before selecting this node.
     *
     * @param {Node} node
     */
    handleExclusiveNodeSelection(node) {
        const exclusiveKeys = this.settings.exclusiveNodesIdentifiers.split(',');
        if (this.settings.exclusiveNodesIdentifiers.length && node.checked === false) {
            if (exclusiveKeys.indexOf('' + node.identifier) > -1) {
                // this key is exclusive, so uncheck all others
                this.resetSelectedNodes();
                this.exclusiveSelectedNode = node;
            }
            else if (exclusiveKeys.indexOf('' + node.identifier) === -1 && this.exclusiveSelectedNode) {
                // current node is not exclusive, but other exclusive node is already selected
                this.exclusiveSelectedNode.checked = false;
                this.exclusiveSelectedNode = null;
            }
        }
    }
};
__decorate([
    state()
], SelectTree.prototype, "settings", void 0);
__decorate([
    state()
], SelectTree.prototype, "exclusiveSelectedNode", void 0);
SelectTree = __decorate([
    customElement('typo3-backend-form-selecttree')
], SelectTree);
export { SelectTree };
