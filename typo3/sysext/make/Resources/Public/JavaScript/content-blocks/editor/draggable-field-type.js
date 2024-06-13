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
var __decorate=function(e,t,i,r){var a,n=arguments.length,d=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(a=e[l])&&(d=(n<3?a(d):n>3?a(t,i,d):a(t,i))||d);return n>3&&d&&Object.defineProperty(t,i,d),d};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let DraggableFieldType=class extends LitElement{constructor(){super(...arguments),this.identifierIndex=0}render(){if(this.fieldTypeSetting){let e=this.fieldTypeSetting.type+"_"+this.identifierIndex,t=this.fieldTypeSetting.type;return this.fieldTypeInfo&&(e=this.fieldTypeInfo.identifier,t=e+" ("+t+")"),html`
        <div class="draggable-field-type d-flex gap-2 text-start btn btn-default d-block mb-3 justify-content-start" draggable="true" @dragstart="${e=>{this.handleDragStart(e,this.fieldTypeSetting.type)}}" data-identifier="${e}" @click="${()=>{this.activateSettings(e)}}" @dragend="${()=>{this.handleDragEnd()}}" >
          <span class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </span>
          <span>${t}</span>
        </div>
      `}return html`<p>No FieldTypeSetting</p>`}handleDragStart(e,t){console.log("Drag started"),e.dataTransfer?.setData("text/plain",t),this.dispatchEvent(new CustomEvent("dragStart",{bubbles:!0,composed:!0}))}handleDragEnd(){this.dispatchEvent(new CustomEvent("dragEnd",{bubbles:!0,composed:!0}))}activateSettings(e){this.fieldTypeInfo&&this.dispatchEvent(new CustomEvent("activateSettings",{detail:{identifier:e},bubbles:!0,composed:!0}))}createRenderRoot(){return this}};DraggableFieldType.styles=css`  `,__decorate([property()],DraggableFieldType.prototype,"fieldTypeSetting",void 0),__decorate([property()],DraggableFieldType.prototype,"fieldTypeInfo",void 0),__decorate([property()],DraggableFieldType.prototype,"identifierIndex",void 0),DraggableFieldType=__decorate([customElement("draggable-field-type")],DraggableFieldType);export{DraggableFieldType};