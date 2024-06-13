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
var __decorate=function(e,t,i,o){var r,n=arguments.length,d=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(d=(n<3?r(d):n>3?r(t,i,d):r(t,i))||d);return n>3&&d&&Object.defineProperty(t,i,d),d};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let DraggableFieldType=class extends LitElement{constructor(){super(...arguments),this.identifierIndex=0,this.position=0,this.showDeleteButton=!1}render(){if(this.fieldTypeSetting){let e=this.fieldTypeSetting.type+"_"+this.identifierIndex,t=this.fieldTypeSetting.type;this.fieldTypeInfo&&(e=this.fieldTypeInfo.identifier,t=e+" ("+t+")");let i=html` `;return this.showDeleteButton&&(i=html`<div class="delete-icon-wrap" @click="${()=>{this.removeFieldType()}}">
            <typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon>
          </div>`),html`
        ${i}
        <div class="draggable-field-type"
             draggable="true"
             @dragstart="${t=>{this.handleDragStart(t,this.fieldTypeSetting.type,e)}}"
             data-identifier="${e}"
             @click="${()=>{this.activateSettings(e)}}" @dragend="${()=>{this.handleDragEnd()}}"
        >
          <div class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </div>
          <span>${t}</span>
        </div>
      `}return html`<p>No FieldTypeSetting</p>`}handleDragStart(e,t,i){const o={type:t,identifier:i};e.dataTransfer?.setData("text/plain",JSON.stringify(o)),this.dispatchEvent(new CustomEvent("dragStart",{bubbles:!0,composed:!0}))}handleDragEnd(){this.dispatchEvent(new CustomEvent("dragEnd",{bubbles:!0,composed:!0}))}activateSettings(e){this.fieldTypeInfo&&this.dispatchEvent(new CustomEvent("activateSettings",{detail:{identifier:e,position:this.position},bubbles:!0,composed:!0}))}removeFieldType(){this.dispatchEvent(new CustomEvent("removeFieldType",{detail:{position:this.position},bubbles:!0,composed:!0}))}createRenderRoot(){return this}};DraggableFieldType.styles=css`  `,__decorate([property()],DraggableFieldType.prototype,"fieldTypeSetting",void 0),__decorate([property()],DraggableFieldType.prototype,"fieldTypeInfo",void 0),__decorate([property()],DraggableFieldType.prototype,"identifierIndex",void 0),__decorate([property()],DraggableFieldType.prototype,"position",void 0),__decorate([property()],DraggableFieldType.prototype,"showDeleteButton",void 0),DraggableFieldType=__decorate([customElement("draggable-field-type")],DraggableFieldType);export{DraggableFieldType};