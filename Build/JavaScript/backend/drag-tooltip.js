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
import { BroadcastMessage } from '@typo3/backend/broadcast-message';
import BroadcastService from '@typo3/backend/broadcast-service';
import { DataTransferTypes } from '@typo3/backend/enum/data-transfer-types';
import '@typo3/backend/element/thumbnail-element';
import { ThumbnailSize } from '@typo3/backend/element/thumbnail-element';
let DragToolTip = class DragToolTip extends LitElement {
    constructor() {
        super();
        /** Dragging is active (in this or another tab) */
        this.active = false;
        this.statusIconIdentifier = 'apps-pagetree-drag-move-into';
        this.tooltipIconIdentifier = null;
        this.thumbnails = [];
        /** This particular drag tooltip instance is active (drag item is being dragged over the tab of this instance) */
        this.visible = false;
        this.posX = 0;
        this.posY = 0;
        this.dragAllowed = false;
        this.skipNextUpdateBroadcast = false;
        this.eventAbortController = null;
        this.updatePositionFromDragEvent = (event) => {
            this.visible = !(event.clientX === 0 && event.clientY === 0);
            const offset = this.calculateIframeOffset(event.view, window);
            this.posX = event.clientX + offset.x;
            this.posY = event.clientY + offset.y;
            if (this.visible) {
                this.broadcast('visible');
            }
        };
        this.trackDragOverAllowed = (event) => {
            this.dragAllowed = event.defaultPrevented;
        };
        this.trackDragEnd = () => {
            this.active = false;
        };
        this.trackDragStart = (event) => {
            if (event.defaultPrevented) {
                return;
            }
            if (event.dataTransfer.types.includes(DataTransferTypes.dragTooltip)) {
                event.dataTransfer.setDragImage(this.ghostImage, 0, 0);
                const metadata = JSON.parse(event.dataTransfer.getData(DataTransferTypes.dragTooltip));
                this.reset();
                Object.assign(this, metadata);
                this.broadcast('visible');
            }
        };
        this.onMetadataUpdate = (event) => {
            const metadata = event.detail;
            Object.assign(this, metadata);
        };
        this.onBroadcastVisible = () => {
            // Another tab is dragging, hide our instance
            this.visible = false;
        };
        this.onBroadcastChangedProperties = (event) => {
            const newProperties = event.detail.payload;
            Object.keys(newProperties).forEach((key) => {
                this[key] = newProperties[key];
            });
            this.skipNextUpdateBroadcast = true;
        };
        this.onIframeLoaded = (event) => {
            let win;
            try {
                win = event.target.querySelector('iframe')?.contentWindow;
            }
            catch {
                return;
            }
            if (win) {
                this.eventAbortController?.abort();
                this.eventAbortController = new AbortController();
                const { signal } = this.eventAbortController;
                const capture = true, passive = true;
                win.addEventListener('dragover', this.updatePositionFromDragEvent, { capture, passive, signal });
                win.addEventListener('dragover', this.trackDragOverAllowed, { passive, signal });
                win.addEventListener('dragend', this.trackDragEnd, { capture, passive, signal });
                win.addEventListener('dragstart', this.trackDragStart, { passive, signal });
            }
        };
        // This creates a ghost image we are using as drag preview.
        //
        // We are building a custom preview, so this is a transparent image
        // to prevent the default behaviour of the browser to show a snapshot
        // of the dragged element.
        //
        // This only accepts drag images that are preloaded.
        // So we are creating this image early in the process.
        this.ghostImage = new Image();
        this.ghostImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    }
    connectedCallback() {
        super.connectedCallback();
        const capture = true, passive = true;
        // own drags (including frames)
        // external drags
        window.addEventListener('dragover', this.updatePositionFromDragEvent, { capture, passive });
        // state of drags
        window.addEventListener('dragover', this.trackDragOverAllowed, { passive });
        // finish of own drags
        window.addEventListener('dragend', this.trackDragEnd, { capture, passive });
        window.addEventListener('dragstart', this.trackDragStart, { passive });
        document.addEventListener('typo3:drag-tooltip:visible', this.onBroadcastVisible);
        document.addEventListener('typo3:drag-tooltip:changedProperties', this.onBroadcastChangedProperties);
        document.addEventListener('typo3:drag-tooltip:metadata-update', this.onMetadataUpdate);
        document.addEventListener('typo3-iframe-loaded', this.onIframeLoaded);
        this.eventAbortController?.abort();
        this.eventAbortController = new AbortController();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        const capture = true;
        //window.removeEventListener('drag', this.updatePositionFromDragEvent, { capture: true });
        window.removeEventListener('dragover', this.updatePositionFromDragEvent, { capture });
        window.removeEventListener('dragover', this.trackDragOverAllowed);
        window.removeEventListener('dragend', this.trackDragEnd, { capture });
        window.removeEventListener('dragstart', this.trackDragStart);
        document.removeEventListener('typo3:drag-tooltip:visible', this.onBroadcastVisible);
        document.removeEventListener('typo3:drag-tooltip:changedProperties', this.onBroadcastChangedProperties);
        document.removeEventListener('typo3:drag-tooltip:metadata-update', this.onMetadataUpdate);
        document.removeEventListener('typo3-iframe-loaded', this.onIframeLoaded);
        this.eventAbortController?.abort();
        this.eventAbortController = null;
    }
    reset() {
        this.active = true;
        this.visible = true;
        this.statusIconIdentifier = 'apps-pagetree-drag-move-into';
        this.tooltipIconIdentifier = '';
        this.tooltipLabel = '';
        this.tooltipDescription = '';
        this.thumbnails = [];
        this.posX = 0;
        this.posY = 0;
        this.dragAllowed = false;
    }
    updated(changedProperties) {
        if (this.skipNextUpdateBroadcast) {
            this.skipNextUpdateBroadcast = false;
            return;
        }
        const propertyNames = [...changedProperties.keys()].filter((propName) => this.constructor.elementProperties.get(propName).attribute !== false);
        if (propertyNames.length === 0) {
            return;
        }
        const newProperties = propertyNames.map((propName) => [propName, this[propName]]);
        this.broadcast('changedProperties', Object.fromEntries(newProperties));
    }
    broadcast(eventName, payload) {
        BroadcastService.post(new BroadcastMessage('drag-tooltip', eventName, payload || {}));
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
    createRenderRoot() {
        return this;
    }
    render() {
        if (!this.active || !this.visible) {
            return nothing;
        }
        if (this.posX === 0 && this.posY === 0) {
            return nothing;
        }
        return html `
      <div class="dragging-tooltip" style="top: ${this.posY + 18 + 'px'}; left: ${this.posX + 18 + 'px'};">
        <div class="dragging-tooltip-control">
          <typo3-backend-icon identifier="${this.dragAllowed ? (this.statusIconIdentifier ?? 'actions-question') : 'actions-ban'}" size="small">
          </typo3-backend-icon>
        </div>
        <div class="dragging-tooltip-content">
          <div class="dragging-tooltip-content-icon">
            <typo3-backend-icon identifier="${this.tooltipIconIdentifier}" size="small"></typo3-backend-icon>
          </div>
          <div class="dragging-tooltip-content-label">
            ${this.tooltipLabel !== '' ? html `<div class="dragging-tooltip-content-name">${this.tooltipLabel}</div>` : nothing}
            ${this.tooltipDescription !== '' ? html `<div class="dragging-tooltip-content-description">${this.tooltipDescription}</div>` : nothing}
          </div>
          ${this.thumbnails.length === 0 ? nothing : html `
            <div class="dragging-tooltip-thumbnails">
              ${this.thumbnails.slice(0, 3).map(image => html `
                <typo3-backend-thumbnail url=${image.src} size=${ThumbnailSize.small} width=${image.width} height=${image.height}></typo3-backend-thumbnail>
              `)}
            </div>
          `}
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], DragToolTip.prototype, "active", void 0);
__decorate([
    property({ type: String, reflect: true })
], DragToolTip.prototype, "statusIconIdentifier", void 0);
__decorate([
    property({ type: String })
], DragToolTip.prototype, "tooltipIconIdentifier", void 0);
__decorate([
    property({ type: String })
], DragToolTip.prototype, "tooltipLabel", void 0);
__decorate([
    property({ type: String })
], DragToolTip.prototype, "tooltipDescription", void 0);
__decorate([
    property({ type: Array })
], DragToolTip.prototype, "thumbnails", void 0);
__decorate([
    state()
], DragToolTip.prototype, "visible", void 0);
__decorate([
    state()
], DragToolTip.prototype, "posX", void 0);
__decorate([
    state()
], DragToolTip.prototype, "posY", void 0);
__decorate([
    state()
], DragToolTip.prototype, "dragAllowed", void 0);
DragToolTip = __decorate([
    customElement('typo3-backend-drag-tooltip')
], DragToolTip);
export { DragToolTip };
