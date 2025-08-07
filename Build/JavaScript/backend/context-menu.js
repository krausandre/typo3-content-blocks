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
import { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import ContextMenuActions from './context-menu-actions';
import '@typo3/backend/element/spinner-element';
import { customElement, queryAll, state } from 'lit/decorators';
import { html, LitElement, nothing } from 'lit';
import { delay } from '@typo3/core/lit-helper';
import { styleMap } from 'lit/directives/style-map';
import { unsafeHTML } from 'lit/directives/unsafe-html';
import { Task, initialState } from '@lit/task';
import Notification from '@typo3/backend/notification';
var ContextMenuEvent;
(function (ContextMenuEvent) {
    ContextMenuEvent["open"] = "typo3:contextmenu:open";
    ContextMenuEvent["close"] = "typo3:contextmenu:close";
})(ContextMenuEvent || (ContextMenuEvent = {}));
/**
 * Module: @typo3/backend/context-menu
 * Container used to load the context menu via AJAX to render the result in a layer next to the mouse cursor
 */
class ContextMenu {
    constructor() {
        document.addEventListener('click', (event) => {
            this.handleTriggerEvent(event);
        });
        document.addEventListener('contextmenu', (event) => {
            this.handleTriggerEvent(event);
        });
    }
    /**
     * Main function, called from most context menu links
     *
     * @param {string} table Table from where info should be fetched
     * @param {number|string} uid The UID of the item
     * @param {string|null} context Context of the item
     * @param {string} unusedParam1
     * @param {string} unusedParam2
     * @param {HTMLElement} eventSource Source Element
     * @param {Event} originalEvent
     */
    show(table, uid, context, unusedParam1, unusedParam2, eventSource = null, originalEvent = null) {
        const contextMenuEvent = new CustomEvent(ContextMenuEvent.open, {
            detail: {
                table: table,
                uid: uid,
                context: context,
                eventSource: eventSource,
                originalEvent: originalEvent,
            },
            bubbles: true,
            composed: true
        });
        top.document.dispatchEvent(contextMenuEvent);
    }
    handleTriggerEvent(event) {
        if (!(event.target instanceof Element)) {
            return;
        }
        const contextTarget = event.target.closest('[data-contextmenu-trigger]');
        if (contextTarget instanceof HTMLElement) {
            this.handleContextMenuEvent(event, contextTarget);
            return;
        }
    }
    handleContextMenuEvent(event, element) {
        const contextTrigger = element.dataset.contextmenuTrigger;
        if (contextTrigger === 'click' || contextTrigger === event.type) {
            event.preventDefault();
            if ((element.dataset.contextmenuTable ?? '') === '') {
                console.error('Referenced element misses data-contextmenu-table', element);
                throw new Error('No data-contextmenu-table attribute provided in contextmenu trigger markup');
            }
            if ((element.dataset.contextmenuUid ?? '') === '') {
                console.error('Referenced element misses data-contextmenu-uid', element);
                throw new Error('No data-contextmenu-uid attribute provided in contextmenu trigger markup');
            }
            this.show(element.dataset.contextmenuTable ?? '', element.dataset.contextmenuUid ?? '', element.dataset.contextmenuContext ?? '', '', '', element, event);
        }
    }
}
export default new ContextMenu();
let ContextMenuElement = class ContextMenuElement extends LitElement {
    constructor() {
        super(...arguments);
        this.open = false;
        this.table = '';
        this.uid = '';
        this.context = '';
        this.rootPositionY = 0;
        this.rootPositionX = 0;
        this.eventSource = null;
        this.rootIdentifier = 'root';
        this.focusFirstElement = false;
        this.fetchTask = new Task(this, {
            autoRun: false,
            args: () => [this.table, this.uid, this.context, this.open],
            task: async ([table, uid, context, isOpen], { signal }) => {
                if (!isOpen) {
                    return initialState;
                }
                const parameters = new URLSearchParams();
                if (table !== '') {
                    parameters.set('table', table);
                }
                if (uid !== '') {
                    parameters.set('uid', uid.toString());
                }
                if ((context ?? '') !== '') {
                    parameters.set('context', context);
                }
                if (parameters.size === 0) {
                    return initialState;
                }
                const url = TYPO3.settings.ajaxUrls.contextmenu;
                const response = await new AjaxRequest(url)
                    .withQueryArguments(parameters)
                    .get({ signal });
                const data = Object.values(await response.resolve());
                if (data.length === 0) {
                    return initialState;
                }
                return this.enhanceNodes('root', data);
            },
            onComplete: () => {
                this.focusFirstElement = true;
            },
            onError: (error) => {
                if (error instanceof AjaxResponse) {
                    Notification.error('', error.response.status + ' ' + error.response.statusText, 5);
                }
                else {
                    Notification.error('', error.message);
                }
            },
        });
        this.show = (event) => {
            const detail = event.detail;
            this.open = true;
            this.table = detail.table;
            this.uid = detail.uid;
            this.context = detail.context;
            this.eventSource = detail.eventSource;
            if (detail.originalEvent !== null) {
                const offset = this.calculateIframeOffset(detail.originalEvent.view, window);
                this.rootPositionY = detail.originalEvent.clientY + offset.y;
                this.rootPositionX = detail.originalEvent.clientX + offset.x;
            }
            this.fetchTask.run();
        };
        this.hide = async () => {
            if (!this.open) {
                return;
            }
            this.open = false;
            this.fetchTask.run();
            await this.updateComplete;
            this.eventSource?.focus();
        };
    }
    get nodes() {
        return this.fetchTask.value ?? [];
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this.hide);
        document.addEventListener(ContextMenuEvent.open, this.show);
        document.addEventListener(ContextMenuEvent.close, this.hide);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this.hide);
        document.removeEventListener(ContextMenuEvent.open, this.show);
        document.removeEventListener(ContextMenuEvent.close, this.hide);
    }
    updated() {
        if (this.focusFirstElement) {
            if (this.contextMenuItemElements.length > 0) {
                const firstItemElement = Array.from(this.contextMenuItemElements).at(0);
                firstItemElement.focus();
            }
            this.focusFirstElement = false;
        }
        this.updateContextMenuPositions();
    }
    createRenderRoot() {
        return this;
    }
    render() {
        return this.fetchTask.render({
            initial: () => nothing,
            pending: () => [
                this.renderOverlay(),
                // Delay the spinner by 80 ms to prevent flickering for fast connections.
                delay(80, () => this.renderMenu(null, this.rootIdentifier, this.rootPositionY, this.rootPositionX)),
            ],
            complete: (nodes) => [
                this.renderOverlay(),
                this.renderMenu(nodes, this.rootIdentifier, this.rootPositionY, this.rootPositionX),
                this.flattenMenuItems(nodes)
                    .filter(node => node.type === 'submenu')
                    .map(node => !this.isNodeExpanded(node) ? nothing : this.renderMenu(node.childItems, this.getNodeIdentifier(node), this.rootPositionY, this.rootPositionX)),
            ],
        });
    }
    renderOverlay() {
        return html `
      <div
        class="context-menu-overlay"
        @click="${(event) => this.handleOverlayClick(event)}"
        @contextmenu="${(event) => this.handleOverlayClick(event)}"
      ></div>
    `;
    }
    renderMenu(nodes, parentIdentifier, posY, posX) {
        const styles = {
            top: posY + 'px',
            insetInlineStart: posX + 'px',
        };
        // pending state
        if (nodes === null) {
            return html `
        <div id="contextmenu-${parentIdentifier}" data-contextmenu-parent=${parentIdentifier} class="context-menu" style=${styleMap(styles)}>
          <typo3-backend-spinner size="medium"></typo3-backend-spinner>
        </div>
      `;
        }
        if (nodes.length === 0) {
            return nothing;
        }
        return html `
      <div id="contextmenu-${parentIdentifier}" data-contextmenu-parent=${parentIdentifier} class="context-menu" style=${styleMap(styles)}>
        <ul class="context-menu-group" role="menu">
          ${nodes.map(node => html `
            <li role="presentation">${this.renderMenuItem(node)}</li>
          `)}
        </ul>
      </div>
    `;
    }
    renderMenuItem(node) {
        if (node.type === 'divider') {
            return html `<hr class="context-menu-divider">`;
        }
        return html `
      <button
        type="button"
        class="context-menu-item"
        tabindex="-1"
        role="menuitem"
        data-contextmenu-id=${this.getNodeIdentifier(node)}
        data-contextmenu-type=${node.type}
        aria-posinset=${this.getNodePositionInSet(node)}
        aria-setsize=${this.getNodeSetSize(node)}
        aria-label=${node.label}
        aria-popup=${(node.type === 'submenu' ? 'menu' : false) || nothing}
        @click=${(event) => { this.handleNodeClick(event, node); }}
        @keydown=${(event) => { this.handleNodeKeyDown(event, node); }}
      >
        <span class="context-menu-item-icon" role="presentation">${unsafeHTML(node.icon)}</span>
        <span class="context-menu-item-label" role="presentation">${unsafeHTML(node.label)}</span>
        ${node.type === 'submenu' ? html `<span class="context-menu-item-indicator"><typo3-backend-icon identifier="actions-chevron-${this.getDocumentDirection() === 'ltr' ? 'right' : 'left'}" size="small"></typo3-backend-icon></span>` : ''}
      </button>
    `;
    }
    showSubmenu(node) {
        node.__expanded = true;
    }
    hideSubmenu(node) {
        node.__expanded = false;
    }
    handleNodeClick(event, node) {
        if (node.type === 'submenu') {
            if (this.isNodeExpanded(node)) {
                this.hideSubmenu(node);
            }
            else {
                this.showSubmenu(node);
            }
            return;
        }
        const dataset = this.extractDataAttributesAndConvertToDataset(node.additionalAttributes);
        const callbackAction = node.callbackAction;
        const { callbackModule, ...dataAttributesToPass } = dataset;
        if (callbackModule) {
            import(callbackModule + '.js').then(({ default: callbackModuleCallback }) => {
                callbackModuleCallback[callbackAction](this.table, this.uid, dataAttributesToPass);
            });
        }
        else if (ContextMenuActions && typeof ContextMenuActions[callbackAction] === 'function') {
            ContextMenuActions[callbackAction](this.table, this.uid, dataAttributesToPass);
        }
        else {
            console.error('action: ' + callbackAction + ' not found');
        }
        this.hide();
    }
    mapIframeTarget(target, event) {
        if (target.tagName !== 'IFRAME') {
            return target;
        }
        const iframe = target;
        let win;
        try {
            win = iframe.contentWindow;
        }
        catch {
            return target;
        }
        const rect = iframe.getBoundingClientRect();
        const iframeTarget = win.document.elementFromPoint(event.clientX - rect.x, event.clientY - rect.y);
        return iframeTarget ?? target;
    }
    async handleOverlayClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.eventSource = null;
        await this.hide();
        let target = document.elementFromPoint(event.clientX, event.clientY);
        if (target && target !== event.currentTarget) {
            target = this.mapIframeTarget(target, event);
            target.dispatchEvent(new PointerEvent(event.type, event));
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                target.focus();
            }
        }
    }
    async handleNodeKeyDown(event, node) {
        const handledKeys = [
            'ArrowDown',
            'ArrowUp',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
            'Enter',
            'Space',
            'Escape',
            'Tab',
        ];
        if (!handledKeys.includes(event.code) || event.altKey || event.ctrlKey) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const nodeList = this.getParralellNodesForNavigation(node);
        const firstNode = this.getFirstNode(nodeList);
        const lastNode = this.getLastNode(nodeList);
        const parentNode = this.getParentNode(node);
        const previousNode = this.getPreviousNode(node);
        const nextNode = this.getNextNode(node);
        switch (event.code) {
            case 'Enter':
            case 'Space':
                if (node.type === 'submenu') {
                    this.showSubmenu(node);
                    await this.updateComplete;
                    const firstNode = this.getFirstNode(node.childItems);
                    if (firstNode) {
                        this.getElementFromNode(firstNode)?.focus();
                    }
                }
                else {
                    this.getElementFromNode(node)?.click();
                }
                break;
            case 'Tab':
                this.hide();
                break;
            case 'Escape':
                if (parentNode) {
                    this.hideSubmenu(parentNode);
                    await this.updateComplete;
                    this.getElementFromNode(parentNode)?.focus();
                }
                else {
                    this.hide();
                }
                break;
            case 'ArrowUp':
                if (previousNode) {
                    this.getElementFromNode(previousNode)?.focus();
                }
                break;
            case 'ArrowDown':
                if (nextNode) {
                    this.getElementFromNode(nextNode)?.focus();
                }
                break;
            case 'ArrowRight':
                if (node.type === 'submenu') {
                    this.showSubmenu(node);
                    await this.updateComplete;
                    const firstNode = this.getFirstNode(node.childItems);
                    if (firstNode) {
                        this.getElementFromNode(firstNode)?.focus();
                    }
                }
                break;
            case 'ArrowLeft':
                if (parentNode) {
                    this.hideSubmenu(parentNode);
                    await this.updateComplete;
                    this.getElementFromNode(parentNode)?.focus();
                }
                break;
            case 'Home':
                this.getElementFromNode(firstNode)?.focus();
                break;
            case 'End':
                this.getElementFromNode(lastNode)?.focus();
                break;
            default:
                return;
        }
        return;
    }
    getNodeIdentifier(node) {
        return node.__contextMenuIdentifier;
    }
    getNodeParentIdentifier(node) {
        return node.__contextMenuParentIdentifier;
    }
    getNodePositionInSet(node) {
        const nodeSet = this.getParralellNodesForNavigation(node);
        return nodeSet.indexOf(node) + 1;
    }
    getNodeSetSize(node) {
        return this.getParralellNodesForNavigation(node).length;
    }
    getParentNode(node) {
        const parentNodeIdentifier = this.getNodeParentIdentifier(node);
        return this.getNodeByIdentifier(parentNodeIdentifier);
    }
    getNodeByIdentifier(identifier) {
        const flattenedNodes = this.flattenMenuItems(this.nodes);
        return flattenedNodes.find((node) => {
            return this.getNodeIdentifier(node) === identifier;
        }) ?? null;
    }
    getPreviousNode(node) {
        const nodeList = this.getParralellNodesForNavigation(node);
        const position = nodeList.indexOf(node);
        const nextPosition = position - 1;
        if (nodeList[nextPosition]) {
            return nodeList[nextPosition];
        }
        return this.getLastNode(nodeList);
    }
    getNextNode(node) {
        const nodeList = this.getParralellNodesForNavigation(node);
        const position = nodeList.indexOf(node);
        const nextPosition = position + 1;
        if (nodeList[nextPosition]) {
            return nodeList[nextPosition];
        }
        return this.getFirstNode(nodeList);
    }
    getFirstNode(nodes) {
        return nodes.at(0) ?? null;
    }
    getLastNode(nodes) {
        return nodes.at(-1) ?? null;
    }
    isNodeExpanded(node) {
        return node.__expanded === true;
    }
    getElementFromNode(node) {
        return this.querySelector('[data-contextmenu-id="' + this.getNodeIdentifier(node) + '"]');
    }
    enhanceNodes(parentIdentifier, nodes) {
        const enhancedNodes = nodes.reduce((nodes, node) => {
            const contextMenuIdentifier = parentIdentifier + '_' + node.identifier;
            const enhancedNode = {
                ...node,
                __contextMenuIdentifier: contextMenuIdentifier,
                __contextMenuParentIdentifier: parentIdentifier,
                __expanded: false,
                childItems: this.enhanceNodes(contextMenuIdentifier, Object.values(node.childItems ?? {})),
            };
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const that = this;
            return [
                ...nodes,
                new Proxy(enhancedNode, {
                    set(target, key, value) {
                        if (target[key] !== value) {
                            target[key] = value;
                            that.requestUpdate();
                        }
                        return true;
                    },
                })
            ];
        }, []);
        return enhancedNodes;
    }
    calculateIframeOffset(contentWindow, currentWindow) {
        let x = 0, y = 0;
        if (contentWindow === currentWindow) {
            return { x, y };
        }
        const parentOffset = this.calculateIframeOffset(contentWindow.parent, currentWindow);
        x += parentOffset.x;
        y += parentOffset.y;
        const iframe = contentWindow.frameElement;
        if (iframe) {
            const rect = iframe.getBoundingClientRect();
            x += rect.x;
            y += rect.y;
        }
        return { x, y };
    }
    extractDataAttributesAndConvertToDataset(attributes) {
        const camelCase = (key) => key
            .replace(/^data-/, '')
            .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        return Object.fromEntries(Object.entries(attributes)
            .filter(([key]) => key.startsWith('data-'))
            .map(([key, value]) => [camelCase(key), String(value)]));
    }
    ;
    updateContextMenuPositions() {
        if (this.contextMenuElements.length > 0) {
            const firstMenuElement = this.contextMenuElements[0];
            this.updateContextMenuPosition(firstMenuElement, this.rootPositionY, this.rootPositionX);
            const subMenuElements = [...this.contextMenuElements].slice(1);
            const documentDirection = this.getDocumentDirection();
            subMenuElements.forEach((element) => {
                const parentNode = this.getNodeByIdentifier(element.dataset.contextmenuParent);
                const parentElement = this.getElementFromNode(parentNode);
                const parentRect = parentElement.getBoundingClientRect();
                const top = parentRect.top - 7;
                const start = documentDirection === 'ltr' ? parentRect.right : parentRect.left;
                this.updateContextMenuPosition(element, top, start);
            });
        }
    }
    updateContextMenuPosition(element, startPositionY, startPositionX) {
        const space = 10;
        const offset = 5;
        const direction = this.getDocumentDirection();
        const dimensions = {
            width: element.offsetWidth,
            height: element.offsetHeight
        };
        const windowDimentions = {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        };
        let start = 0, top = 0;
        top = startPositionY;
        start = direction === 'ltr' ? startPositionX : windowDimentions.width - startPositionX;
        const canPlaceBelow = (top + dimensions.height + space + offset < windowDimentions.height);
        const canPlaceStart = (start + dimensions.width + space + offset < windowDimentions.width);
        // adjusting the top position of the layer to fit it into the window frame
        if (!canPlaceBelow) {
            top = windowDimentions.height - dimensions.height - space;
        }
        else {
            top += offset;
        }
        // adjusting the start position of the layer to fit it into the window frame
        if (!canPlaceStart) {
            start = windowDimentions.width - dimensions.width - space;
        }
        else {
            start += offset;
        }
        element.style.top = Math.round(top) + 'px';
        element.style.insetInlineStart = Math.round(start) + 'px';
    }
    flattenMenuItems(nodes) {
        const items = [];
        for (const node of nodes) {
            items.push(node);
            if (node.childItems) {
                items.push(...this.flattenMenuItems(node.childItems));
            }
        }
        return items;
    }
    getParralellNodesForNavigation(node) {
        const parentNode = this.getParentNode(node);
        if (parentNode) {
            return parentNode.childItems.filter(node => node.type !== 'divider');
        }
        return this.nodes.filter(node => node.type !== 'divider');
    }
    getDocumentDirection() {
        return document.querySelector('html').dir === 'rtl' ? 'rtl' : 'ltr';
    }
};
__decorate([
    state()
], ContextMenuElement.prototype, "open", void 0);
__decorate([
    state()
], ContextMenuElement.prototype, "table", void 0);
__decorate([
    state()
], ContextMenuElement.prototype, "uid", void 0);
__decorate([
    state()
], ContextMenuElement.prototype, "context", void 0);
__decorate([
    state()
], ContextMenuElement.prototype, "rootPositionY", void 0);
__decorate([
    state()
], ContextMenuElement.prototype, "rootPositionX", void 0);
__decorate([
    state()
], ContextMenuElement.prototype, "eventSource", void 0);
__decorate([
    queryAll('.context-menu')
], ContextMenuElement.prototype, "contextMenuElements", void 0);
__decorate([
    queryAll('.context-menu-item')
], ContextMenuElement.prototype, "contextMenuItemElements", void 0);
ContextMenuElement = __decorate([
    customElement('typo3-backend-context-menu')
], ContextMenuElement);
export { ContextMenuElement };
