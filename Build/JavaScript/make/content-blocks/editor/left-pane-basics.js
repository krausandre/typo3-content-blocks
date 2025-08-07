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
import { html, LitElement, TemplateResult, css } from 'lit';
import { customElement } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
// import '@typo3/backend/element/info-box';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <editor-left-pane-basics></editor-left-pane-basics>
 */
let EditorLeftPaneBasics = class EditorLeftPaneBasics extends LitElement {
    static { this.styles = css ``; }
    render() {
        // return html`
        //   <typo3-infobox severity="2" subject="Oooops an error occured!" content="No basics are available"></typo3-infobox>
        // `;
        return html `
      <div>
        <h2>Basics</h2>
      </div>
    `;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
};
EditorLeftPaneBasics = __decorate([
    customElement('editor-left-pane-basics')
], EditorLeftPaneBasics);
export { EditorLeftPaneBasics };
