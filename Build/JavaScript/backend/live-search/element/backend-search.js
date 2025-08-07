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
import { customElement } from 'lit/decorators';
import { LitElement } from 'lit';
/**
 * Module: @typo3/backend/live-search/element/backend-search
 * Simple wrapper element around search container
 * @exports @typo3/backend/live-search/element/backend-search
 */
let BackendSearch = class BackendSearch extends LitElement {
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
};
BackendSearch = __decorate([
    customElement('typo3-backend-live-search')
], BackendSearch);
export { BackendSearch };
