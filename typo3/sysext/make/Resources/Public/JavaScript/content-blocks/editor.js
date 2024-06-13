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
var __decorate=function(t,e,o,i){var r,n=arguments.length,l=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,o,i);else for(var p=t.length-1;p>=0;p--)(r=t[p])&&(l=(n<3?r(l):n>3?r(e,o,l):r(e,o))||l);return n>3&&l&&Object.defineProperty(e,o,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";import MultiStepWizard from"@typo3/backend/multi-step-wizard.js";import Severity from"@typo3/backend/severity.js";let ContentBlockEditor=class extends LitElement{constructor(){super(...arguments),this.values={identifier:"text1",type:"Textarea",default:"default text",placeholder:"placeholder text",required:!1,enableRichtext:!0,richtextConfiguration:"full",rows:5},this.init=!1}render(){this.initData();const t=this.fieldTypeList.filter((t=>"Textarea"===t.type))[0];return"copy"===this.mode&&this._initMultiStepWizard(),html`
      <div class="row">
        <div class="col-4">
          <content-block-editor-left-pane
            .contentBlockYaml="${this.cbDefinition.yaml}"
            .groups="${this.groupList}"
            .extensions="${this.extensionList}"
            @fetchDragEnd="${this.fetchDragEndListener}"
          >
          </content-block-editor-left-pane>
        </div>
        <div class="col-4">
          <content-block-editor-middle-pane  @fieldTypeDropped="${this.fieldTypeDroppedListener}"></content-block-editor-middle-pane>
        </div>
        <div class="col-4">
          <content-block-editor-right-pane .schema="${t}" .values="${this.values}"></content-block-editor-right-pane>
        </div>
      </div>
    `}initData(){this.init||(this.cbDefinition=JSON.parse(this.data),this.fieldTypeList=JSON.parse(this.fieldconfig),this.groupList=JSON.parse(this.groups),this.extensionList=JSON.parse(this.extensions),this.init=!0)}createRenderRoot(){return this}fetchDragEndListener(t){console.log(t.detail)}fieldTypeDroppedListener(t){console.log("Field type dropped"),console.log(t.detail.data)}_initMultiStepWizard(){MultiStepWizard.addSlide("step-1","Step 1","",Severity.notice,"Step 1",(async function(t,e){console.log(e),MultiStepWizard.unlockNextStep(),t.html('<h2>Select vendor</h2><p><select><option value="1">Sample</option></select></p>')})),MultiStepWizard.addSlide("step-2","Step 2","",Severity.notice,"Step 2",(async function(t,e){console.log(e),t.html("Test 2"),MultiStepWizard.unlockPrevStep()})),MultiStepWizard.show()}_dispatchBackEvent(){this.dispatchEvent(new CustomEvent("contentBlockBack",{}))}};__decorate([property()],ContentBlockEditor.prototype,"name",void 0),__decorate([property()],ContentBlockEditor.prototype,"mode",void 0),__decorate([property()],ContentBlockEditor.prototype,"data",void 0),__decorate([property()],ContentBlockEditor.prototype,"extensions",void 0),__decorate([property()],ContentBlockEditor.prototype,"groups",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldconfig",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};