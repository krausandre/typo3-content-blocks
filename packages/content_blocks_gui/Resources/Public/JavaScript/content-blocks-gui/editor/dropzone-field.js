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
import { customElement, property } from 'lit/decorators.js';
import '@typo3/backend/element/icon-element.js';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <dropzone-field></dropzone>
 */
let DropzoneField = class DropzoneField extends LitElement {
    constructor() {
        super(...arguments);
        this.position = 0;
        this.level = 0;
        this.parent = null;
    }
    render() {
        return html `
        <style>
            .cb-drop-zone {
                border: 1px dashed var(--typo3-component-border-color);
                height: 20px;
                margin: 10px;
                background-color: var(--typo3-surface-container-lowest);
                transition: all 0.2s ease;

                &:focus {
                    background-color: var(--typo3-surface-container-success);
                }

                &.drag-over {
                    background-color: var(--typo3-surface-container-primary);
                    border-color: var(--typo3-surface-primary);
                    border-width: 2px;
                }
            }
        </style>
        <div id="cb-drop-zone-${this.position}"
             class="cb-drop-zone"
             @dragover="${this.handleDragOver}"
             @dragleave="${this.handleDragLeave}"
             @drop="${this.handleDrop}"
        >
        </div>
    `;
    }
    handleDragOver(event) {
        event.preventDefault();
        const target = event.currentTarget;
        target.classList.add('drag-over');
    }
    handleDragLeave(event) {
        const target = event.currentTarget;
        target.classList.remove('drag-over');
    }
    handleDrop(event) {
        event.preventDefault();
        const target = event.currentTarget;
        target.classList.remove('drag-over');
        this._dispatchFieldTypeDroppedEvent(event.dataTransfer?.getData('text/plain'));
    }
    _dispatchFieldTypeDroppedEvent(data) {
        let dataObject;
        try {
            dataObject = JSON.parse(data);
        }
        catch (e) {
            console.error('Failed to parse dropped field data', e);
            return;
        }
        this.dispatchEvent(new CustomEvent('fieldTypeDropped', {
            detail: {
                data: dataObject,
                position: this.position,
                level: this.level,
                parent: this.parent,
            },
            bubbles: true,
            composed: true,
        }));
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
};
__decorate([
    property({ type: Number })
], DropzoneField.prototype, "position", void 0);
__decorate([
    property({ type: Number })
], DropzoneField.prototype, "level", void 0);
__decorate([
    property()
], DropzoneField.prototype, "parent", void 0);
DropzoneField = __decorate([
    customElement('dropzone-field')
], DropzoneField);
export { DropzoneField };
