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
var __decorate=function(e,t,i,o){var n,l=arguments.length,d=l<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(e,t,i,o);else for(var r=e.length-1;r>=0;r--)(n=e[r])&&(d=(l<3?n(d):l>3?n(t,i,d):n(t,i))||d);return l>3&&d&&Object.defineProperty(t,i,d),d};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@typo3/make/content-blocks/editor/left-pane.js";import"@typo3/make/content-blocks/editor/middle-pane.js";import"@typo3/make/content-blocks/editor/right-pane.js";import MultiStepWizard from"@typo3/backend/multi-step-wizard.js";import Severity from"@typo3/backend/severity.js";let ContentBlockEditor=class extends LitElement{constructor(){super(...arguments),this.fieldSettingsValues={identifier:"",label:"",type:""},this.dragActive=!1,this.init=!1}render(){return this.initData(),"copy"===this.mode&&this._initMultiStepWizard(),html`
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
      `}initData(){this.init||(this.cbDefinition=JSON.parse(this.data),this.fieldTypeList=JSON.parse(this.fieldconfig),this.groupList=JSON.parse(this.groups),this.extensionList=JSON.parse(this.extensions),this.init=!0,document.querySelectorAll('[data-action="save-content-block"]').forEach((e=>{e.addEventListener("click",(e=>{e.preventDefault(),console.log(this.cbDefinition.yaml)}))})))}createRenderRoot(){return this}fieldTypeDroppedListener(e){if(this.rightPaneActiveSchema=this.fieldTypeList.filter((t=>t.type===e.detail.data.type))[0],console.log(e.detail),e.detail.level>0){const t=this.getSelectedLevel(e.detail.level),i=e.detail.data.type+"_"+e.detail.parent+"_"+t[e.detail.parent].fields.length;console.log(t),console.log(i),t.filter((t=>t.identifier===e.detail.data.identifier)).length>0?this.updateContentBlockField(i,e.detail.position,t):this.addNewContentBlockField(i,e.detail.data.type,e.detail.position+1,t[e.detail.parent].fields)}else{const t=e.detail.data.type+"_"+this.cbDefinition.yaml.fields.length;this.cbDefinition.yaml.fields.filter((t=>t.identifier===e.detail.data.identifier)).length>0?this.updateContentBlockField(t,e.detail.position,this.cbDefinition.yaml.fields):this.addNewContentBlockField(t,e.detail.data.type,e.detail.position,this.cbDefinition.yaml.fields)}}addNewContentBlockField(e,t,i,o){const n={identifier:e,type:t,label:t+o.length};"Collection"===t&&(n.fields=[]),this.fieldSettingsValues=n,o.splice(i,0,n),this.rightPaneActivePosition=i}updateContentBlockField(e,t,i){const o=i.findIndex((t=>t.identifier===e)),n=i[o],l=[...i.slice(0,o),...i.slice(o+1)];i=[...l.slice(0,t),n,...l.slice(t)],this.fieldSettingsValues=i[o],this.rightPaneActivePosition=t}updateFieldDataEventListener(e){this.getSelectedLevel(e.detail.level)[e.detail.position]=e.detail.values,this.cbDefinition=structuredClone(this.cbDefinition),this.fieldSettingsValues=e.detail.values}removeFieldTypeEventListener(e){const t=this.getSelectedLevel(e.detail.level);t.splice(e.detail.position,1),console.log(t),this.cbDefinition.yaml.fields=structuredClone(this.cbDefinition.yaml.fields),this.fieldSettingsValues={identifier:"",label:"",type:""}}activateFieldSettings(e){const t=this.getSelectedLevel(e.detail.level);this.fieldSettingsValues=t.filter((t=>t.identifier===e.detail.identifier))[0],console.log(this.fieldSettingsValues),void 0!==this.fieldSettingsValues?(this.rightPaneActiveSchema=this.fieldTypeList.filter((e=>e.type===this.fieldSettingsValues.type))[0],this.rightPaneActivePosition=e.detail.position,this.rightPaneActiveLevel=e.detail.level,this.rightPaneActiveParent=e.detail.parent):(this.rightPaneActiveSchema=null,this.rightPaneActivePosition=0,this.rightPaneActiveLevel=0,this.rightPaneActiveParent=0)}getSelectedLevel(e){let t=1,i=this.cbDefinition.yaml.fields;for(;t<e;)i=i.filter((e=>"Collection"===e.type)),t++;return i}handleDragEnd(){this.dragActive=!1}handleDragStart(){this.dragActive=!0}_initMultiStepWizard(){MultiStepWizard.addSlide("step-1","Step 1","",Severity.notice,"Step 1",(async function(e,t){console.log(t),MultiStepWizard.unlockNextStep(),e.html('<h2>Select vendor</h2><p><select><option value="1">Sample</option></select></p>')})),MultiStepWizard.addSlide("step-2","Step 2","",Severity.notice,"Step 2",(async function(e,t){console.log(t),e.html("Test 2"),MultiStepWizard.unlockPrevStep()})),MultiStepWizard.show()}};__decorate([property()],ContentBlockEditor.prototype,"name",void 0),__decorate([property()],ContentBlockEditor.prototype,"mode",void 0),__decorate([property()],ContentBlockEditor.prototype,"data",void 0),__decorate([property()],ContentBlockEditor.prototype,"extensions",void 0),__decorate([property()],ContentBlockEditor.prototype,"groups",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldconfig",void 0),__decorate([property()],ContentBlockEditor.prototype,"fieldSettingsValues",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActiveSchema",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActivePosition",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActiveLevel",void 0),__decorate([property()],ContentBlockEditor.prototype,"rightPaneActiveParent",void 0),__decorate([property()],ContentBlockEditor.prototype,"dragActive",void 0),__decorate([property()],ContentBlockEditor.prototype,"cbDefinition",void 0),ContentBlockEditor=__decorate([customElement("content-block-editor")],ContentBlockEditor);export{ContentBlockEditor};