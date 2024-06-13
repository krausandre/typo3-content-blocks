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
var __decorate=function(e,t,i,r){var d,n=arguments.length,o=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(d=e[a])&&(o=(n<3?d(o):n>3?d(t,i,o):d(t,i))||o);return n>3&&o&&Object.defineProperty(t,i,o),o};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let DraggableFieldType=class extends LitElement{constructor(){super(...arguments),this.identifierIndex=0}render(){if(this.fieldTypeSetting){let e=this.fieldTypeSetting.type+"_"+this.identifierIndex,t=this.fieldTypeSetting.type;return this.fieldTypeInfo&&(e=this.fieldTypeInfo.identifier,t=e+" ("+t+")"),html`
        <div class="draggable-field-type" draggable="true" @dragstart="${()=>{this.handleDragStart(this.fieldTypeSetting.type)}}" data-identifier="${e}" @click="${()=>{this.activateSettings(e)}}" >
          <div class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </div>
          <span>${t}</span>
        </div>
      `}return html`<p>No FieldTypeSetting</p>`}handleDragStart(e){console.log("dispatch DragEnd"),this.dispatchEvent(new CustomEvent("fetchDragEnd",{detail:{type:e,position:0,targetId:"cb-drop-zone"},bubbles:!0,composed:!0}))}activateSettings(e){this.fieldTypeInfo&&this.dispatchEvent(new CustomEvent("activateSettings",{detail:{identifier:e},bubbles:!0,composed:!0}))}createRenderRoot(){return this}};DraggableFieldType.styles=css`  `,__decorate([property()],DraggableFieldType.prototype,"fieldTypeSetting",void 0),__decorate([property()],DraggableFieldType.prototype,"fieldTypeInfo",void 0),__decorate([property()],DraggableFieldType.prototype,"identifierIndex",void 0),DraggableFieldType=__decorate([customElement("draggable-field-type")],DraggableFieldType);export{DraggableFieldType};