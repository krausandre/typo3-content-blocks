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
import '@friendsoftypo3/content-blocks-gui/editor/draggable-field-type.js';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <editor-left-pane-components></editor-left-pane-components>
 */
let EditorLeftPaneComponents = class EditorLeftPaneComponents extends LitElement {
    constructor() {
        super(...arguments);
        this.fieldTypes = [
            { icon: 'form-textarea', type: 'Textarea', properties: [{ name: 'test', dataType: 'text' }] },
            { icon: 'actions-refresh', type: 'Collection', properties: [{ name: 'test', dataType: 'text' }] },
            { icon: 'form-checkbox', type: 'Checkbox', properties: [{ name: 'test', dataType: 'text' }] },
        ];
    }
    static { this.styles = css ``; }
    render() {
        return html `
      <ul class="list-unstyled row">
        ${this.fieldTypes.map((item) => html `
              <li class="col-12 col-xl-6 col-xxl-4 mb-3">
                <draggable-field-type .fieldTypeSetting="${item}"></draggable-field-type>
              </li>`)}
      </ul>
    `;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
};
__decorate([
    property()
], EditorLeftPaneComponents.prototype, "fieldTypes", void 0);
EditorLeftPaneComponents = __decorate([
    customElement('editor-left-pane-components')
], EditorLeftPaneComponents);
export { EditorLeftPaneComponents };
