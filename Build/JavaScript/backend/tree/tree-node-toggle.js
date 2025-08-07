/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General License, either version 2
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
import { customElement, property } from 'lit/decorators';
import { html, LitElement } from 'lit';
import '@typo3/backend/element/icon-element';
let TreeNodeToggle = class TreeNodeToggle extends LitElement {
    constructor() {
        super(...arguments);
        this.expanded = 'false';
    }
    render() {
        return html `<typo3-backend-icon size="small" identifier="${this.expanded === 'true' ? 'actions-chevron-down' : 'actions-chevron-right'}"></typo3-backend-icon>`;
    }
};
__decorate([
    property({ type: String, reflect: true, attribute: 'aria-expanded' })
], TreeNodeToggle.prototype, "expanded", void 0);
TreeNodeToggle = __decorate([
    customElement('typo3-backend-tree-node-toggle')
], TreeNodeToggle);
export default TreeNodeToggle;
