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
import { customElement, property, query } from 'lit/decorators';
import { until } from 'lit/directives/until';
import { lll } from '@typo3/core/lit-helper';
import { PageTree } from '@typo3/backend/tree/page-tree';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import '@typo3/backend/tree/tree-toolbar';
import ElementBrowser from '@typo3/backend/element-browser';
import LinkBrowser from '@typo3/backend/link-browser';
import '@typo3/backend/element/icon-element';
import Persistent from '@typo3/backend/storage/persistent';
/**
 * Extension of the Tree, allowing to show additional actions on the right hand of the tree to directly link
 * select a page
 */
let PageBrowserTree = class PageBrowserTree extends PageTree {
    getNodeClasses(node) {
        const classList = super.getNodeClasses(node);
        if (!this.settings.actions.includes('link')) {
            return classList;
        }
        if (!this.isLinkable(node)) {
            classList.push('node-disabled');
        }
        return classList;
    }
    createNodeContentAction(node) {
        if (this.settings.actions.includes('link')) {
            return this.isLinkable(node)
                ? html `
          <span class="node-action" @click="${() => this.linkItem(node)}">
            <typo3-backend-icon identifier="actions-link" size="small"></typo3-backend-icon>
          </span>
        `
                : super.createNodeContentAction(node);
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
     * Page Link Handler specific
     */
    linkItem(node) {
        LinkBrowser.finalizeFunction('t3://page?uid=' + node.identifier);
    }
    /**
     * The following page doktypes can be browsed, but not directly added as "action":
     * - Spacer
     * - SysFolder
     * - Recycler
     */
    isLinkable(node) {
        const nonLinkableDoktypes = ['199', '254', '255'];
        return nonLinkableDoktypes.includes(String(node.recordType)) === false;
    }
    /**
     * Element Browser specific
     */
    selectItem(node) {
        ElementBrowser.insertElement(node.recordType, node.identifier, node.name, '', true);
    }
};
PageBrowserTree = __decorate([
    customElement('typo3-backend-component-page-browser-tree')
], PageBrowserTree);
export { PageBrowserTree };
/**
 * The actual element used in the HTML composing the tree and the toolbar
 * <typo3-backend-component-page-browser type="pages"></typo3-backend-component-page-browser>
 */
let PageBrowser = class PageBrowser extends LitElement {
    constructor() {
        super(...arguments);
        this.mountPointPath = null;
        this.activePageId = 0;
        // selectPage
        this.actions = [];
        this.configuration = null;
        this.selectActivePageInTree = (evt) => {
            // Activate the current node
            const nodes = evt.detail.nodes;
            evt.detail.nodes = nodes.map((node) => {
                if (parseInt(node.identifier, 10) === this.activePageId) {
                    node.checked = true;
                }
                return node;
            });
        };
        /**
         * If a page is clicked, the content area needs to be updated
         */
        this.loadRecordsOfPage = (evt) => {
            const node = evt.detail.node;
            if (!node.checked) {
                return;
            }
            const contentsUrl = new URL(document.location.href, window.location.origin);
            contentsUrl.searchParams.set('contentOnly', '1');
            contentsUrl.searchParams.set('expandPage', node.identifier);
            (new AjaxRequest(contentsUrl)).get()
                .then((response) => response.resolve())
                .then((response) => {
                const contentContainer = document.querySelector('.element-browser-main-content .element-browser-body');
                contentContainer.innerHTML = response;
            });
        };
        this.setMountPoint = (e) => {
            this.setTemporaryMountPoint(e.detail.pageId);
        };
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('typo3:pagetree:mountPoint', this.setMountPoint);
    }
    disconnectedCallback() {
        document.removeEventListener('typo3:pagetree:mountPoint', this.setMountPoint);
        super.disconnectedCallback();
    }
    firstUpdated() {
        this.activePageId = parseInt(this.getAttribute('active-page'), 10);
        this.actions = JSON.parse(this.getAttribute('tree-actions') ?? '[]');
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    getConfiguration() {
        if (this.configuration !== null) {
            return Promise.resolve(this.configuration);
        }
        const configurationUrl = top.TYPO3.settings.ajaxUrls.page_tree_browser_configuration;
        const alternativeEntryPoints = this.hasAttribute('alternative-entry-points') ? JSON.parse(this.getAttribute('alternative-entry-points')) : [];
        let request = new AjaxRequest(configurationUrl);
        if (alternativeEntryPoints.length) {
            request = request.withQueryArguments('alternativeEntryPoints=' + encodeURIComponent(alternativeEntryPoints));
        }
        return request.get()
            .then(async (response) => {
            const configuration = await response.resolve('json');
            configuration.actions = this.actions;
            this.configuration = configuration;
            this.mountPointPath = configuration.temporaryMountPoint || null;
            return configuration;
        });
    }
    render() {
        return html `
      <div class="tree">
      ${until(this.renderTree(), '')}
      </div>
    `;
    }
    renderTree() {
        return this.getConfiguration()
            .then((configuration) => {
            const initialized = () => {
                this.tree.addEventListener('typo3:tree:node-selected', this.loadRecordsOfPage);
                this.tree.addEventListener('typo3:tree:nodes-prepared', this.selectActivePageInTree);
                // set up toolbar now with updated properties
                const toolbar = this.querySelector('typo3-backend-tree-toolbar');
                toolbar.tree = this.tree;
            };
            return html `
          <typo3-backend-tree-toolbar .tree="${this.tree}"></typo3-backend-tree-toolbar>
          <div class="navigation-tree-container">
            ${this.renderMountPoint()}
            <typo3-backend-component-page-browser-tree id="typo3-pagetree-tree" class="tree-wrapper" .setup=${configuration} @tree:initialized=${initialized}></typo3-backend-component-page-browser-tree>
          </div>
        `;
        });
    }
    unsetTemporaryMountPoint() {
        Persistent.unset('pageTree_temporaryMountPoint').then(() => {
            this.mountPointPath = null;
        });
    }
    renderMountPoint() {
        if (this.mountPointPath === null) {
            return nothing;
        }
        return html `
      <div class="node-mount-point">
        <div class="node-mount-point__icon"><typo3-backend-icon identifier="actions-info-circle" size="small"></typo3-backend-icon></div>
        <div class="node-mount-point__text">${this.mountPointPath}</div>
        <div class="node-mount-point__icon mountpoint-close" @click="${() => this.unsetTemporaryMountPoint()}" title="${lll('labels.temporaryDBmount')}">
          <typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon>
        </div>
      </div>
    `;
    }
    setTemporaryMountPoint(pid) {
        (new AjaxRequest(this.configuration.setTemporaryMountPointUrl))
            .post('pid=' + pid, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((response) => response.resolve())
            .then((response) => {
            if (response && response.hasErrors) {
                this.tree.errorNotification(response.message);
                this.tree.loadData();
            }
            else {
                this.mountPointPath = response.mountPointPath;
            }
        })
            .catch((error) => {
            this.tree.errorNotification(error);
            this.tree.loadData();
        });
    }
};
__decorate([
    property({ type: String })
], PageBrowser.prototype, "mountPointPath", void 0);
__decorate([
    query('.tree-wrapper')
], PageBrowser.prototype, "tree", void 0);
PageBrowser = __decorate([
    customElement('typo3-backend-component-page-browser')
], PageBrowser);
export { PageBrowser };
