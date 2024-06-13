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
var __decorate=function(e,t,r,i){var l,a=arguments.length,o=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,r,i);else for(var d=e.length-1;d>=0;d--)(l=e[d])&&(o=(a<3?l(o):a>3?l(t,r,o):l(t,r))||o);return a>3&&o&&Object.defineProperty(t,r,o),o};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let DraggableFieldType=class extends LitElement{render(){return this.fieldTypeSetting?html`
        <div class="draggable-field-type" draggable="true" @dragstart="${()=>{this.handleDragStart(this.fieldTypeSetting.type)}}">
          <div class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </div>
          <span>${this.fieldTypeSetting.type}</span>
        </div>
      `:html`<p>No FieldTypeSetting</p>`}handleDragStart(e){console.log("dispatch DragEnd"),this.dispatchEvent(new CustomEvent("fetchDragEnd",{detail:{type:e,position:0,targetId:"cb-drop-zone"},bubbles:!0,composed:!0}))}createRenderRoot(){return this}};DraggableFieldType.styles=css`  `,__decorate([property()],DraggableFieldType.prototype,"fieldTypeSetting",void 0),DraggableFieldType=__decorate([customElement("draggable-field-type")],DraggableFieldType);export{DraggableFieldType};