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
var __decorate=function(t,e,i,o){var r,n=arguments.length,l=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,i,o);else for(var d=t.length-1;d>=0;d--)(r=t[d])&&(l=(n<3?r(l):n>3?r(e,i,l):r(e,i))||l);return n>3&&l&&Object.defineProperty(e,i,l),l};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";import MultiStepWizard from"@typo3/backend/multi-step-wizard.js";import Severity from"@typo3/backend/severity.js";let ContentBlockEditor=class extends LitElement{constructor(){super(...arguments),this.fieldSettingsValues={identifier:"text1",label:"Demo text 1",type:"Textarea",default:"default text",placeholder:"placeholder text",required:!1,enableRichtext:!0,richtextConfiguration:"full",rows:5},this.dragActive=!1,this.init=!1}render(){return this.initData(),"copy"===this.mode&&this._initMultiStepWizard(),html`
        <div class="row">
          <div class="col-4">
            <content-block-editor-left-pane
              .contentBlockYaml="${this.cbDefinition.yaml}"
              .groups="${this.groupList}"
              .extensions="${this.extensionList}"
              .fieldTypes="${this.fieldTypeList}"
              @dragStart="${this.handleDragStart}"
              @dragEnd="${this.handleDragEnd}"
            >
            </content-block-editor-left-pane>
          </div>
          <div class="col-4">
            <content-block-editor-middle-pane
              .fieldList="${this.cbDefinition.yaml.fields}"
              .fieldTypes="${this.fieldTypeList}"
              .dragActive="${this.dragActive}"
              @fieldTypeDropped="${this.fieldTypeDroppedListener}"
              @activateSettings="${this.activateFieldSettings}"
            >
            </content-block-editor-middle-pane>
          </div>
          <div class="col-4">
            <content-block-editor-right-pane
              .schema="${this.rightPaneActiveSchema}"
              .values="${this.fieldSettingsValues}">
            </content-block-editor-right-pane>
          </div>
        </div>
      `}initData(){this.init||(this.cbDefinition=JSON.parse(this.data),this.fieldTypeList=JSON.parse(this.fieldconfig),this.groupList=JSON.parse(this.groups),this.extensionList=JSON.parse(this.extensions),this.init=!0,document.querySelectorAll('[data-action="save-content-block"]').forEach((t=>{t.addEventListener("click",(t=>{t.preventDefault(),console.log("test"),console.log(this.cbDefinition.yaml)}))})))}createRenderRoot(){return this}fieldTypeDroppedListener(t){console.log("Field type dropped"),console.log(t.detail.type),console.log(t.detail.position)}activateFieldSettings(t){this.fieldSettingsValues=this.cbDefinition.yaml.fields.filter((e=>e.identifier===t.detail.identifier))[0],this.rightPaneActiveSchema=this.fieldTypeList.filter((t=>t.type===this.fieldSettingsValues.type))[0]}handleDragEnd(){this.dragActive=!1}handleDragStart(){this.dragActive=!0}_initMultiStepWizard(){MultiStepWizard.addSlide("step-1","Step 1","",Severity.notice,"Step 1",(async function(t,e){console.log(e),MultiStepWizard.unlockNextStep(),t.html('<h2>Select vendor</h2><p><select><option value="1">Sample</option></select></p>')})),MultiStepWizard.addSlide("step-2","Step 2","",Severity.notice,"Step 2",(async function(t,e){console.log(e),t.html("Test 2"),MultiStepWizard.unlockPrevStep()})),MultiStepWizard.show()}};__decorate([property()],ContentBlockEditor.prototype,"name",void 0),__decorate([property()],ContentBlockEditor.prototype,"mode",void 0),__decorate([property()],ContentBlockEditor.prototype,"data",void 0),__decorate([property()],ContentBlockEditor.prototype,"extensions",void 0),__decorate([property()],ContentBlockEditor.prototype,"groups",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldconfig",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldSettingsValues",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActiveSchema",void 0),__decorate([property()],ContentBlockEditor.prototype,"dragActive",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};