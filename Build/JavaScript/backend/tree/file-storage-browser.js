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
import { customElement, query } from 'lit/decorators';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import {} from '@typo3/backend/tree/tree-toolbar';
import ElementBrowser from '@typo3/backend/element-browser';
import LinkBrowser from '@typo3/backend/link-browser';
import '@typo3/backend/element/icon-element';
import { FileStorageTree } from './file-storage-tree';
/**
 * Extension of the Tree, allowing to show additional actions on the right hand of the tree to directly link
 * select a folder
 */
let FileStorageBrowserTree = class FileStorageBrowserTree extends FileStorageTree {
    createNodeContentAction(node) {
        if (this.settings.actions.includes('link')) {
            return html `
        <span class="node-action" @click="${() => this.linkItem(node)}">
          <typo3-backend-icon identifier="actions-link" size="small"></typo3-backend-icon>
        </span>
      `;
        }
        else if (this.settings.actions.includes('select')) {
            return html `
        <span class="node-action" @click="${() => this.selectItem(node)}">
          <typo3-backend-icon identifier="actions-link" size="small"></typo3-backend-icon>
        </span>
      `;
        }
        return super.createNodeContentAction(node);
    }
    /**
     * Link to a folder - Link Handler specific
     */
    linkItem(node) {
        LinkBrowser.finalizeFunction('t3://folder?storage=' + node.storage + '&identifier=' + node.pathIdentifier);
    }
    /**
     * Element Browser specific
     */
    selectItem(node) {
        ElementBrowser.insertElement(node.recordType, node.identifier, node.name, node.identifier, true);
    }
};
FileStorageBrowserTree = __decorate([
    customElement('typo3-backend-component-filestorage-browser-tree')
], FileStorageBrowserTree);
export { FileStorageBrowserTree };
let FileStorageBrowser = class FileStorageBrowser extends LitElement {
    constructor() {
        super(...arguments);
        this.activeFolder = '';
        this.actions = [];
        this.selectActiveNode = (evt) => {
            // Activate the current node
            const nodes = evt.detail.nodes;
            evt.detail.nodes = nodes.map((node) => {
                if (decodeURIComponent(node.identifier) === this.activeFolder) {
                    node.checked = true;
                }
                return node;
            });
        };
        /**
         * If a page is clicked, the content area needs to be updated
         */
        this.loadFolderDetails = (evt) => {
            const node = evt.detail.node;
            if (!node.checked) {
                return;
            }
            const contentsUrl = document.location.href + '&contentOnly=1&expandFolder=' + node.identifier;
            (new AjaxRequest(contentsUrl)).get()
                .then((response) => response.resolve())
                .then((response) => {
                const contentContainer = document.querySelector('.element-browser-main-content .element-browser-body');
                contentContainer.innerHTML = response;
            });
        };
    }
    firstUpdated() {
        this.activeFolder = this.getAttribute('active-folder') || '';
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    render() {
        if (this.hasAttribute('tree-actions') && this.getAttribute('tree-actions').length) {
            this.actions = JSON.parse(this.getAttribute('tree-actions'));
        }
        const treeSetup = {
            dataUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_data,
            filterUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_filter,
            showIcons: true,
            actions: this.actions
        };
        const initialized = () => {
            this.tree.addEventListener('typo3:tree:node-selected', this.loadFolderDetails);
            this.tree.addEventListener('typo3:tree:nodes-prepared', this.selectActiveNode);
            // set up toolbar now with updated properties
            const toolbar = this.querySelector('typo3-backend-tree-toolbar');
            toolbar.tree = this.tree;
        };
        return html `
      <div class="tree">
        <typo3-backend-tree-toolbar .tree="${this.tree}"></typo3-backend-tree-toolbar>
        <div class="navigation-tree-container">
          <typo3-backend-component-filestorage-browser-tree class="tree-wrapper" .setup=${treeSetup} @tree:initialized=${initialized}></typo3-backend-component-page-browser-tree>
        </div>
      </div>
    `;
    }
};
__decorate([
    query('.tree-wrapper')
], FileStorageBrowser.prototype, "tree", void 0);
FileStorageBrowser = __decorate([
    customElement('typo3-backend-component-filestorage-browser')
], FileStorageBrowser);
export { FileStorageBrowser };
