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
var __decorate=function(e,t,i,r){var l,a=arguments.length,o=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var p=e.length-1;p>=0;p--)(l=e[p])&&(o=(a<3?l(o):a>3?l(t,i,o):l(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o};import{html,LitElement,css}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";let DraggableFieldType=class extends LitElement{render(){return this.fieldTypeSetting?html`
        <div class="draggable-field-type" draggable="true"  data-field-type="${this.fieldTypeSetting.type}">
          <div class="icon-wrap">
            <typo3-backend-icon identifier="${this.fieldTypeSetting.icon}" size="small"></typo3-backend-icon>
          </div>
          <span>${this.fieldTypeSetting.type}</span>
        </div>
      `:html`<p>No FieldTypeSetting</p>`}createRenderRoot(){return this}};DraggableFieldType.styles=css`  `,__decorate([property()],DraggableFieldType.prototype,"fieldTypeSetting",void 0),DraggableFieldType=__decorate([customElement("draggable-field-type")],DraggableFieldType);export{DraggableFieldType};