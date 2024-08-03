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
var __decorate=function(e,t,i,o){var n,l=arguments.length,r=l<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,o);else for(var d=e.length-1;d>=0;d--)(n=e[d])&&(r=(l<3?n(r):l>3?n(t,i,r):n(t,i))||r);return l>3&&r&&Object.defineProperty(t,i,r),r};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";import MultiStepWizard from"@typo3/backend/multi-step-wizard.js";import Severity from"@typo3/backend/severity.js";let ContentBlockEditor=class extends LitElement{constructor(){super(...arguments),this.fieldSettingsValues={identifier:"",label:"",type:""},this.dragActive=!1,this.init=!1}render(){return this.initData(),"copy"===this.mode&&this._initMultiStepWizard(),html`
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
          <div class="col-4 properties-pane p-4 bg-light">
            <content-block-editor-right-pane
              .schema="${this.rightPaneActiveSchema}"
              .values="${this.fieldSettingsValues}"
              .position="${this.rightPaneActivePosition}"
              .level="${this.rightPaneActiveLevel}"
              .parent="${this.rightPaneActiveParent}"
              @updateCbFieldData="${this.updateFieldDataEventListener}"
            >
            </content-block-editor-right-pane>
          </div>
        </div>
      `}initData(){this.init||(this.cbDefinition=JSON.parse(this.data),this.fieldTypeList=JSON.parse(this.fieldconfig),this.groupList=JSON.parse(this.groups),this.extensionList=JSON.parse(this.extensions),this.init=!0,document.querySelectorAll('[data-action="save-content-block"]').forEach((e=>{e.addEventListener("click",(e=>{e.preventDefault(),console.log(this.cbDefinition.yaml)}))})))}createRenderRoot(){return this}fieldTypeDroppedListener(e){console.log(e.detail),this.rightPaneActiveSchema=this.fieldTypeList.filter((t=>t.type===e.detail.data.type))[0];let t=e.detail.data.type+"_"+this.cbDefinition.yaml.fields.length;e.detail.level>0&&(t=e.detail.data.type+"_"+e.detail.parent.fields.length),this.handleFieldAction(t,e.detail)}handleFieldAction(e,t){let i=this.cbDefinition.yaml.fields;null!==t.parent&&(i=t.parent.fields),i.filter((e=>e.identifier===t.data.identifier)).length>0?this.updateContentBlockField(t.data.identifier,t.position,t.level,t.parent):this.addNewContentBlockField(e,t.data.type,t.position,t.level,t.parent)}addNewContentBlockField(e,t,i,o,n){const l={identifier:e,type:t,label:t+i};"Collection"===t&&(l.fields=[]),o>0?n.fields.splice(i,0,l):this.cbDefinition.yaml.fields.splice(i,0,l),this.fieldSettingsValues=l,this.rightPaneActivePosition=i,this.rightPaneActiveLevel=o,this.rightPaneActiveParent=n}updateContentBlockField(e,t,i,o){let n=this.cbDefinition.yaml.fields;null!==o&&(n=o.fields);const l=n.findIndex((t=>t.identifier===e)),r=n[l],d=[...n.slice(0,l),...n.slice(l+1)];n=[...d.slice(0,t),r,...d.slice(t)],null!==o?o.fields=n:this.cbDefinition.yaml.fields=n,this.fieldSettingsValues=n[l],this.rightPaneActivePosition=t,this.rightPaneActiveLevel=i,this.rightPaneActiveParent=o,this.cbDefinition=structuredClone(this.cbDefinition)}updateFieldDataEventListener(e){console.log(e.detail);this.getSelectedLevel(e.detail.level)[e.detail.position]=e.detail.values,this.fieldSettingsValues=e.detail.values}removeFieldTypeEventListener(e){let t=this.cbDefinition.yaml.fields;e.detail.level>0&&(t=e.detail.parent.fields),t.splice(e.detail.position,1),e.detail.level>0?e.detail.parent.fields=t:this.cbDefinition.yaml.fields=t,this.cbDefinition=structuredClone(this.cbDefinition),this.fieldSettingsValues={identifier:"",label:"",type:""},this.rightPaneActiveSchema=null}activateFieldSettings(e){console.log(e.detail);let t=this.cbDefinition.yaml.fields;null!==e.detail.parent&&(t=e.detail.parent.fields),this.fieldSettingsValues=t.filter((t=>t.identifier===e.detail.identifier))[0],void 0!==this.fieldSettingsValues?(this.rightPaneActiveSchema=this.fieldTypeList.filter((e=>e.type===this.fieldSettingsValues.type))[0],this.rightPaneActivePosition=e.detail.position,this.rightPaneActiveLevel=e.detail.level,this.rightPaneActiveParent=e.detail.parent):(this.rightPaneActiveSchema=null,this.rightPaneActivePosition=0,this.rightPaneActiveLevel=0,this.rightPaneActiveParent=null)}getSelectedLevel(e){let t=1,i=this.cbDefinition.yaml.fields;for(;t<e;)i=i.filter((e=>"Collection"===e.type)),t++;return i}handleDragEnd(){this.dragActive=!1}handleDragStart(){this.dragActive=!0}_initMultiStepWizard(){MultiStepWizard.addSlide("step-1","Step 1","",Severity.notice,"Step 1",(async function(e,t){console.log(t),MultiStepWizard.unlockNextStep(),e.html('<h2>Select vendor</h2><p><select><option value="1">Sample</option></select></p>')})),MultiStepWizard.addSlide("step-2","Step 2","",Severity.notice,"Step 2",(async function(e,t){console.log(t),e.html("Test 2"),MultiStepWizard.unlockPrevStep()})),MultiStepWizard.show()}};__decorate([property()],ContentBlockEditor.prototype,"name",void 0),__decorate([property()],ContentBlockEditor.prototype,"mode",void 0),__decorate([property()],ContentBlockEditor.prototype,"data",void 0),__decorate([property()],ContentBlockEditor.prototype,"extensions",void 0),__decorate([property()],ContentBlockEditor.prototype,"groups",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldconfig",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldSettingsValues",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActiveSchema",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActivePosition",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActiveLevel",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActiveParent",void 0),__decorate([property()],ContentBlockEditor.prototype,"dragActive",void 0),__decorate([property()],ContentBlockEditor.prototype,"cbDefinition",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};