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
import { customElement, property, state } from 'lit/decorators';
import { Offset } from '@typo3/backend/offset';
var Action;
(function (Action) {
    Action["move"] = "move";
    Action["resizeN"] = "resizeN";
    Action["resizeE"] = "resizeE";
    Action["resizeS"] = "resizeS";
    Action["resizeW"] = "resizeW";
    Action["resizeSE"] = "resizeSE";
    Action["resizeSW"] = "resizeSW";
    Action["resizeNE"] = "resizeNE";
    Action["resizeNW"] = "resizeNW";
})(Action || (Action = {}));
const resizeNorth = [Action.resizeNW, Action.resizeN, Action.resizeNE];
const resizeEast = [Action.resizeNE, Action.resizeE, Action.resizeSE];
const resizeSouth = [Action.resizeSE, Action.resizeS, Action.resizeSW];
const resizeWest = [Action.resizeSW, Action.resizeW, Action.resizeNW];
/**
 * Module: @typo3/backend/element/typo3-backend-draggable-resizable
 *
 * Emitted events:
 * + @draggable-resizable-started with { action: Action, originOffset: Offset }
 * + @draggable-resizable-updated with { action: Action, originOffset: Offset }
 * + @draggable-resizable-finished with { action: Action, originOffset: Offset }
 *
 * @example
 * <typo3-backend-draggable-resizable offset="..." container="..."></typo3-backend-draggable-resizable>
 *
 * const element = document.create('typo3-backend-draggable-resizable offset');
 * element.offset = new Offset(0, 0, 1000, 500); // { left, top, width, height }
 * element.container = document.querySelector('#container');
 * document.appendChild(element);
 */
let DraggableResizableElement = class DraggableResizableElement extends LitElement {
    constructor() {
        super(...arguments);
        this.reverting = false;
        this.action = null;
        this.originOffset = null;
        this.originPosition = null;
        this.handleStart = (evt) => {
            const target = evt.target;
            if (evt.buttons !== 1 || !this.contains(target)) {
                return;
            }
            if (target.dataset.resize) {
                const actionName = 'resize' + target.dataset.resize.toUpperCase();
                this.action = Action[actionName];
            }
            else {
                this.action = Action.move;
            }
            this.reverting = false;
            this.originOffset = this.offset.clone();
            this.originPosition = { x: evt.clientX, y: evt.clientY };
            this.dispatchEvent(this.createEvent('draggable-resizable-started', { action: this.action, originOffset: this.originOffset }));
        };
        this.handleUpdate = (evt) => {
            if (!this.action) {
                return;
            }
            const deltaPos = {
                x: evt.clientX - this.originPosition.x,
                y: evt.clientY - this.originPosition.y,
            };
            // assign offset (and update styles implicitly)
            this.offset = this.adjustOffset(this.originOffset, deltaPos);
            this.dispatchEvent(this.createEvent('draggable-resizable-updated', { action: this.action, originOffset: this.originOffset }));
        };
        this.handleFinish = () => {
            if (!this.action) {
                return;
            }
            this.dispatchEvent(this.createEvent('draggable-resizable-finished', { action: this.action, originOffset: this.originOffset }));
            this.action = null;
            this.originOffset = null;
            this.originPosition = null;
        };
    }
    /**
     * Reverts the position/dimension back to `offset`, having a transition effect enabled.
     */
    revert(offset) {
        this.reverting = true;
        this.offset = offset;
        // remove state after `transition-duration: 0.5s`
        setTimeout(() => this.reverting = false, 500);
    }
    connectedCallback() {
        super.connectedCallback();
        this.pointerEventNames.pointerDown.forEach((name) => document.addEventListener(name, this.handleStart, true));
        this.pointerEventNames.pointerMove.forEach((name) => document.addEventListener(name, this.handleUpdate, true));
        this.pointerEventNames.pointerUp.forEach((name) => document.addEventListener(name, this.handleFinish, true));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.pointerEventNames.pointerDown.forEach((name) => document.removeEventListener(name, this.handleStart, true));
        this.pointerEventNames.pointerMove.forEach((name) => document.removeEventListener(name, this.handleUpdate, true));
        this.pointerEventNames.pointerUp.forEach((name) => document.removeEventListener(name, this.handleFinish, true));
    }
    render() {
        return html `
      <div class="cropper-focus-area ui-draggable ui-draggable-handle ui-resizable">
        <div class="ui-resizable-handle ui-resizable-n" data-resize="n"></div>
        <div class="ui-resizable-handle ui-resizable-e" data-resize="e"></div>
        <div class="ui-resizable-handle ui-resizable-s" data-resize="s"></div>
        <div class="ui-resizable-handle ui-resizable-w" data-resize="w"></div>
        <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" data-resize="se"></div>
        <div class="ui-resizable-handle ui-resizable-sw" data-resize="sw"></div>
        <div class="ui-resizable-handle ui-resizable-ne" data-resize="ne"></div>
        <div class="ui-resizable-handle ui-resizable-nw" data-resize="nw"></div>
      </div>
    `;
    }
    update(changedProperties) {
        super.update(changedProperties);
        Object.assign(this.style, this.getOffsetStyles(this.offset));
    }
    createRenderRoot() {
        return this;
    }
    adjustOffset(originOffset, delta) {
        // width & height cannot be lower
        const dimensionMin = 2;
        const containerBounds = this.parentElement.getBoundingClientRect();
        const offset = originOffset.clone();
        if (this.action === Action.move) {
            offset.left = this.minMax(offset.left + delta.x, 0, containerBounds.width - offset.width);
            offset.top = this.minMax(offset.top + delta.y, 0, containerBounds.height - offset.height);
        }
        if (resizeNorth.includes(this.action)) {
            // hint: delta is negative here
            const deltaY = this.minMax(delta.y, -offset.top, offset.height - dimensionMin);
            offset.top += deltaY;
            offset.height -= deltaY;
        }
        else if (resizeSouth.includes(this.action)) {
            offset.height = this.minMax(offset.height + delta.y, dimensionMin, containerBounds.height - offset.top);
        }
        if (resizeWest.includes(this.action)) {
            // hint: delta is negative here
            const deltaX = this.minMax(delta.x, -offset.left, offset.width - dimensionMin);
            offset.left += deltaX;
            offset.width -= deltaX;
        }
        else if (resizeEast.includes(this.action)) {
            offset.width += delta.x;
        }
        return offset;
    }
    minMax(value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }
    createEvent(type, detail) {
        return new CustomEvent(type, { detail, bubbles: true, composed: true });
    }
    getOffsetStyles(offset) {
        return {
            left: `${(offset.left)}px`,
            top: `${offset.top}px`,
            width: `${offset.width}px`,
            height: `${offset.height}px`,
        };
    }
};
__decorate([
    property({ type: Object, converter: data => Offset.fromObject(JSON.parse(data)), reflect: true })
], DraggableResizableElement.prototype, "offset", void 0);
__decorate([
    property({ type: Object })
], DraggableResizableElement.prototype, "pointerEventNames", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], DraggableResizableElement.prototype, "reverting", void 0);
__decorate([
    state()
], DraggableResizableElement.prototype, "action", void 0);
DraggableResizableElement = __decorate([
    customElement('typo3-backend-draggable-resizable')
], DraggableResizableElement);
export { DraggableResizableElement };
