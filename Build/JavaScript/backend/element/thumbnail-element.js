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
import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { Task } from '@lit/task';
import '@typo3/backend/element/spinner-element';
import '@typo3/backend/element/icon-element';
export const ThumbnailSize = {
    default: 'default',
    small: 'small',
    medium: 'medium',
    large: 'large',
};
let ThumbnailElement = class ThumbnailElement extends LitElement {
    constructor() {
        super(...arguments);
        this.size = ThumbnailSize.default;
        this.keepAspectRatio = false;
        this.thumbnailTask = new Task(this, {
            task: async ([url, size, keepAspectRatio, width, height]) => {
                const thumbnailUrl = new URL(url, window.origin);
                thumbnailUrl.searchParams.set('size', size);
                thumbnailUrl.searchParams.set('keepAspectRatio', keepAspectRatio ? '1' : '0');
                const img = new Image();
                img.src = thumbnailUrl.toString();
                img.width = width;
                if (!keepAspectRatio) {
                    // Only set height if we do not want to keep the aspect ratio (image is being cropped)
                    img.height = height;
                }
                await new Promise(((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject();
                }));
                return html `${img}`;
            },
            args: () => [this.url, this.size, this.keepAspectRatio, this.width, this.height]
        });
    }
    createRenderRoot() {
        return this;
    }
    render() {
        return this.thumbnailTask.render({
            pending: () => html `<typo3-backend-spinner size=${this.size}></typo3-backend-size>`,
            complete: (markup) => html `${markup}`,
            error: () => html `<typo3-backend-icon identifier="default-not-found" size="small"></typo3-backend-icon>`
        });
    }
};
__decorate([
    property({ type: String, reflect: true })
], ThumbnailElement.prototype, "url", void 0);
__decorate([
    property({ type: String, reflect: true })
], ThumbnailElement.prototype, "size", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], ThumbnailElement.prototype, "keepAspectRatio", void 0);
__decorate([
    property({ type: Number, reflect: true })
], ThumbnailElement.prototype, "width", void 0);
__decorate([
    property({ type: Number, reflect: true })
], ThumbnailElement.prototype, "height", void 0);
ThumbnailElement = __decorate([
    customElement('typo3-backend-thumbnail')
], ThumbnailElement);
export { ThumbnailElement };
