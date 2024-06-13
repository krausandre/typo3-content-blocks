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
var __decorate=function(t,e,o,r){var i,n=arguments.length,c=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,e,o,r);else for(var l=t.length-1;l>=0;l--)(i=t[l])&&(c=(n<3?i(c):n>3?i(e,o,c):i(e,o))||c);return n>3&&c&&Object.defineProperty(e,o,c),c};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";import MultiStepWizard from"@typo3/backend/multi-step-wizard.js";import Severity from"@typo3/backend/severity.js";let ContentBlockEditor=class extends LitElement{constructor(){super(...arguments),this.values={identifier:"text1",type:"Textarea",default:"default text",placeholder:"placeholder text",required:!1,enableRichtext:!0,richtextConfiguration:"full",rows:5}}render(){const t=JSON.parse(this.data),e=JSON.parse(this.fieldconfig).filter((t=>"Textarea"===t.type))[0],o=JSON.parse(this.groups),r=JSON.parse(this.extensions);return"copy"===this.mode&&this._initMultiStepWizard(),html`
      <div class="row">
        <div class="col-4">
          <content-block-editor-left-pane .contentBlockYaml="${t.yaml}" .groups="${o}" .extensions="${r}"></content-block-editor-left-pane>
        </div>
        <div class="col-4">
          <content-block-editor-middle-pane></content-block-editor-middle-pane>
        </div>
        <div class="col-4">
          <content-block-editor-right-pane .schema="${e}" .values="${this.values}"></content-block-editor-right-pane>
        </div>
      </div>
      <button @click="${()=>{this._dispatchBackEvent()}}" type="button" class="btn btn-primary">Back
      </button>
    `}createRenderRoot(){return this}_initMultiStepWizard(){MultiStepWizard.addSlide("step-1","Step 1","",Severity.notice,"Step 1",(async function(t,e){console.log(e),MultiStepWizard.unlockNextStep(),t.html('<h2>Select vendor</h2><p><select><option value="1">Sample</option></select></p>')})),MultiStepWizard.addSlide("step-2","Step 2","",Severity.notice,"Step 2",(async function(t,e){console.log(e),t.html("Test 2"),MultiStepWizard.unlockPrevStep()})),MultiStepWizard.show()}_dispatchBackEvent(){this.dispatchEvent(new CustomEvent("contentBlockBack",{}))}};__decorate([property()],ContentBlockEditor.prototype,"name",void 0),__decorate([property()],ContentBlockEditor.prototype,"mode",void 0),__decorate([property()],ContentBlockEditor.prototype,"data",void 0),__decorate([property()],ContentBlockEditor.prototype,"extensions",void 0),__decorate([property()],ContentBlockEditor.prototype,"groups",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldconfig",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};
