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
var __decorate=function(e,t,o,r){var n,d=arguments.length,l=d<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,r);else for(var i=e.length-1;i>=0;i--)(n=e[i])&&(l=(d<3?n(l):d>3?n(t,o,l):n(t,o))||l);return d>3&&l&&Object.defineProperty(t,o,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let ContentBlockEditorMiddlePane=class extends LitElement{render(){return html`
      <style>
        #cb-drop-zone {
          border: 1px dashed #ccc;
          height: 100px;
          margin: 10px 0;
        }
      </style>

      <p>I am the Middle pane...</p>
      <div id="cb-drop-zone"
            @dragover="${this.handleDragOver}"
            @drop="${this.handleDrop}">
          Drop here to add a new field
      ></div>
    `}handleDragOver(e){e.preventDefault()}handleDrop(e){e.preventDefault(),console.log("Dropped - "),console.log(e)}createRenderRoot(){return this}};__decorate([property()],ContentBlockEditorMiddlePane.prototype,"name",void 0),ContentBlockEditorMiddlePane=__decorate([customElement("content-block-editor-middle-pane")],ContentBlockEditorMiddlePane);export{ContentBlockEditorMiddlePane};