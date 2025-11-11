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
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import { ContentBlockField } from '@friendsoftypo3/content-blocks-gui/interface/definitions';
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
        console.log('Render dropzone');
        return html `
      <style>
        .cb-drop-zone {
          border: 1px dashed #ccc;
          height: 20px;
          margin: 10px;
          background-color: #f9f9f9;

          &:focus {
            background-color: #cbffdb;
          }
        }
      </style>
      <div id="cb-drop-zone-${this.position}"
           class="cb-drop-zone"
           @dragover="${this.handleDragOver}"
           @drop="${this.handleDrop}"
      >
      </div>
    `;
    }
    handleDragOver(event) {
        event.preventDefault();
    }
    handleDrop(event) {
        event.preventDefault();
        this._dispatchFieldTypeDroppedEvent(event.dataTransfer?.getData('text/plain'));
    }
    _dispatchFieldTypeDroppedEvent(data) {
        const dataObject = JSON.parse(data);
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
    property()
], DropzoneField.prototype, "position", void 0);
__decorate([
    property()
], DropzoneField.prototype, "level", void 0);
__decorate([
    property()
], DropzoneField.prototype, "parent", void 0);
DropzoneField = __decorate([
    customElement('dropzone-field')
], DropzoneField);
export { DropzoneField };
