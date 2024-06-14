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
var __decorate=function(t,e,i,o){var n,l=arguments.length,d=l<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(d=(l<3?n(d):l>3?n(e,i,d):n(e,i))||d);return l>3&&d&&Object.defineProperty(e,i,d),d};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";import MultiStepWizard from"@typo3/backend/multi-step-wizard.js";import Severity from"@typo3/backend/severity.js";let ContentBlockEditor=class extends LitElement{constructor(){super(...arguments),this.fieldSettingsValues={identifier:"",label:"",type:""},this.dragActive=!1,this.init=!1}render(){return this.initData(),"copy"===this.mode&&this._initMultiStepWizard(),html`
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
              @removeFieldType="${this.removeFieldTypeEventListener}"
            >
            </content-block-editor-middle-pane>
          </div>
          <div class="col-4">
            <content-block-editor-right-pane
              .schema="${this.rightPaneActiveSchema}"
              .values="${this.fieldSettingsValues}"
              .position="${this.rightPaneActivePosition}"
              @updateCbFieldData="${this.updateFieldDataEventListener}"
            >
            </content-block-editor-right-pane>
          </div>
        </div>
      `}initData(){this.init||(this.cbDefinition=JSON.parse(this.data),this.fieldTypeList=JSON.parse(this.fieldconfig),this.groupList=JSON.parse(this.groups),this.extensionList=JSON.parse(this.extensions),this.init=!0,document.querySelectorAll('[data-action="save-content-block"]').forEach((t=>{t.addEventListener("click",(t=>{t.preventDefault(),console.log(this.cbDefinition.yaml)}))})))}createRenderRoot(){return this}fieldTypeDroppedListener(t){this.rightPaneActiveSchema=this.fieldTypeList.filter((e=>e.type===t.detail.data.type))[0];const e=t.detail.data.type+"_"+this.cbDefinition.yaml.fields.length;if(this.cbDefinition.yaml.fields.filter((e=>e.identifier===t.detail.data.identifier)).length>0){const e=this.cbDefinition.yaml.fields.findIndex((e=>e.identifier===t.detail.data.identifier)),i=this.cbDefinition.yaml.fields[e],o=[...this.cbDefinition.yaml.fields.slice(0,e),...this.cbDefinition.yaml.fields.slice(e+1)];this.cbDefinition.yaml.fields=[...o.slice(0,t.detail.position),i,...o.slice(t.detail.position)],this.fieldSettingsValues=this.cbDefinition.yaml.fields[e],this.rightPaneActivePosition=this.cbDefinition.yaml.fields.findIndex((e=>e.identifier===t.detail.data.identifier))}else{const i={identifier:e,type:t.detail.data.type,label:t.detail.data.type+this.cbDefinition.yaml.fields.length};this.fieldSettingsValues=i,this.cbDefinition.yaml.fields.splice(t.detail.position,0,i),this.rightPaneActivePosition=t.detail.position}}updateFieldDataEventListener(t){const e=structuredClone(this.cbDefinition);e.yaml.fields[t.detail.position]=t.detail.values,this.cbDefinition=e,this.fieldSettingsValues=t.detail.values}removeFieldTypeEventListener(t){const e=structuredClone(this.cbDefinition);e.yaml.fields.splice(t.detail.position,1),this.cbDefinition=e,this.fieldSettingsValues={identifier:"",label:"",type:""},this.rightPaneActiveSchema=null}activateFieldSettings(t){this.fieldSettingsValues=this.cbDefinition.yaml.fields.filter((e=>e.identifier===t.detail.identifier))[0],this.rightPaneActiveSchema=this.fieldTypeList.filter((t=>t.type===this.fieldSettingsValues.type))[0],this.rightPaneActivePosition=t.detail.position}handleDragEnd(){this.dragActive=!1}handleDragStart(){this.dragActive=!0}_initMultiStepWizard(){MultiStepWizard.addSlide("step-1","Step 1","",Severity.notice,"Step 1",(async function(t,e){console.log(e),MultiStepWizard.unlockNextStep(),t.html('<h2>Select vendor</h2><p><select><option value="1">Sample</option></select></p>')})),MultiStepWizard.addSlide("step-2","Step 2","",Severity.notice,"Step 2",(async function(t,e){console.log(e),t.html("Test 2"),MultiStepWizard.unlockPrevStep()})),MultiStepWizard.show()}};__decorate([property()],ContentBlockEditor.prototype,"name",void 0),__decorate([property()],ContentBlockEditor.prototype,"mode",void 0),__decorate([property()],ContentBlockEditor.prototype,"data",void 0),__decorate([property()],ContentBlockEditor.prototype,"extensions",void 0),__decorate([property()],ContentBlockEditor.prototype,"groups",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldconfig",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldSettingsValues",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActiveSchema",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActivePosition",void 0),__decorate([property()],ContentBlockEditor.prototype,"dragActive",void 0),__decorate([property()],ContentBlockEditor.prototype,"cbDefinition",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};