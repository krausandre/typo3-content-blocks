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
import { html, LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@typo3/backend/element/icon-element.js';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <draggable-field-type></draggable-field-type>
 */
let DraggableFieldType = class DraggableFieldType extends LitElement {
    constructor() {
        super(...arguments);
        this.identifierIndex = 0;
        this.position = 0;
        this.level = 0;
        this.parent = null;
        this.showDeleteButton = false;
    }
    static { this.styles = css `  `; }
    render() {
        if (this.fieldTypeSetting) {
            let identifier = this.fieldTypeSetting.type + '_' + this.identifierIndex;
            let renderLabel = this.fieldTypeSetting.type;
            if (this.fieldTypeInfo) {
                identifier = this.fieldTypeInfo.identifier;
                renderLabel = identifier + ' (' + renderLabel + ')';
            }
            return html `
        <div class="draggable-field-type d-flex gap-2 text-start btn btn-default d-block justify-content-start"
             draggable="true"
             @dragstart="${(event) => { this.handleDragStart(event, this.fieldTypeSetting.type, identifier); }}"
             data-identifier="${identifier}"
             @click="${() => { this.activateSettings(identifier); }}" @dragend="${() => { this.handleDragEnd(); }}"
        >
          <span class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </span>
          <span>${renderLabel}</span>
          ${this.showDeleteButton ? html `<div class="delete-icon-wrap ms-auto" @click="${() => { this.removeFieldType(); }}">
            <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
          </div>` : ''}
        </div>
      `;
        }
        else {
            return html `<p>No FieldTypeSetting</p>`;
        }
    }
    handleDragStart(event, type, identifier) {
        const data = {
            type: type,
            identifier: identifier,
        };
        event.dataTransfer?.setData('text/plain', JSON.stringify(data));
        this.dispatchEvent(new CustomEvent('dragStart', {
            bubbles: true,
            composed: true,
        }));
    }
    handleDragEnd() {
        this.dispatchEvent(new CustomEvent('dragEnd', {
            bubbles: true,
            composed: true,
        }));
    }
    activateSettings(identifier) {
        if (this.fieldTypeInfo) {
            this.dispatchEvent(new CustomEvent('activateSettings', {
                detail: {
                    identifier: identifier,
                    position: this.position - 1,
                    level: this.level,
                    parent: this.parent,
                },
                bubbles: true,
                composed: true,
            }));
        }
    }
    removeFieldType() {
        this.dispatchEvent(new CustomEvent('removeFieldType', {
            detail: {
                position: this.position - 1,
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
], DraggableFieldType.prototype, "fieldTypeSetting", void 0);
__decorate([
    property()
], DraggableFieldType.prototype, "fieldTypeInfo", void 0);
__decorate([
    property({ type: Number })
], DraggableFieldType.prototype, "identifierIndex", void 0);
__decorate([
    property({ type: Number })
], DraggableFieldType.prototype, "position", void 0);
__decorate([
    property({ type: Number })
], DraggableFieldType.prototype, "level", void 0);
__decorate([
    property()
], DraggableFieldType.prototype, "parent", void 0);
__decorate([
    property()
], DraggableFieldType.prototype, "showDeleteButton", void 0);
DraggableFieldType = __decorate([
    customElement('draggable-field-type')
], DraggableFieldType);
export { DraggableFieldType };
