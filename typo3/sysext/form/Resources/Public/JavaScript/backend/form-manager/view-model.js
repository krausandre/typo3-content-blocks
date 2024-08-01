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
import $ from"jquery";import Modal from"@typo3/backend/modal.js";import Severity from"@typo3/backend/severity.js";import MultiStepWizard from"@typo3/backend/multi-step-wizard.js";import Icons from"@typo3/backend/icons.js";import Notification from"@typo3/backend/notification.js";import SecurityUtility from"@typo3/core/security-utility.js";import{selector}from"@typo3/core/literals.js";import SortableTable from"@typo3/backend/sortable-table.js";const securityUtility=new SecurityUtility;var Identifiers;function newFormSetup(e){$(Identifiers.newFormModalTrigger).on("click",(function(t){t.preventDefault(),MultiStepWizard.addSlide("new-form-step-1",TYPO3.lang["formManager.newFormWizard.step1.title"],"",Severity.notice,TYPO3.lang["formManager.newFormWizard.step1.progressLabel"],(async function(t){const a=await Icons.getIcon("actions-plus",Icons.sizes.small),r=await Icons.getIcon("form-page",Icons.sizes.large),i=await Icons.getIcon("apps-pagetree-page-default",Icons.sizes.large);let o;const n=MultiStepWizard.setup.$carousel.closest(".modal"),l=n.find(".modal-footer").find('button[name="next"]');MultiStepWizard.blurCancelStep(),MultiStepWizard.lockNextStep(),MultiStepWizard.lockPrevStep();0===e.getAccessibleFormStorageFolders().length&&(o='<div class="new-form-modal"><div class="row"><label class="col col-form-label">'+TYPO3.lang["formManager.newFormWizard.step1.noStorages"]+"</label></div></div>",t.html(o),e.assert(!1,"No accessible form storage folders",1477506500)),o='<div class="new-form-modal">',o+='<div class="card-container"><div class="card card-size-medium"><div class="card-header"><div class="card-icon">'+i+'</div><div class="card-header-body"><h2 class="card-title">'+TYPO3.lang["formManager.blankForm.label"]+'</h2><span class="card-subtitle">'+TYPO3.lang["formManager.blankForm.subtitle"]+'</span></div></div><div class="card-body"><p class="card-text">'+TYPO3.lang["formManager.blankForm.description"]+'</p></div><div class="card-footer"><button type="button" class="btn btn-default" data-inline="1" value="blank" data-identifier="newFormModeButton">'+a+" "+TYPO3.lang["formManager.blankForm.label"]+'</button></div></div><div class="card card-size-medium"><div class="card-header"><div class="card-icon">'+r+'</div><div class="card-header-body"><h2 class="card-title">'+TYPO3.lang["formManager.predefinedForm.label"]+'</h2><span class="card-subtitle">'+TYPO3.lang["formManager.predefinedForm.subtitle"]+'</span></div></div><div class="card-body"><p class="card-text">'+TYPO3.lang["formManager.predefinedForm.description"]+'</p></div><div class="card-footer"><button type="button" class="btn btn-default" data-inline="1" value="predefined" data-identifier="newFormModeButton">'+a+" "+TYPO3.lang["formManager.predefinedForm.label"]+"</button></div></div>",o+="</div>",t.html(o),$(Identifiers.newFormModeButton,n).on("click",(function(e){MultiStepWizard.set("newFormMode",$(e.currentTarget).val()),MultiStepWizard.next()})),l.on("click",(async function(){t.html($("<div />",{class:"text-center"}).append(await Icons.getIcon("spinner-circle",Icons.sizes.default,null,null)).prop("outerHTML"))}))})),MultiStepWizard.addSlide("new-form-step-2",TYPO3.lang["formManager.newFormWizard.step2.title"],"",Severity.notice,top.TYPO3.lang["wizard.progressStep.configure"],(function(t,a){let r,i;MultiStepWizard.lockNextStep(),MultiStepWizard.unlockPrevStep();const o=MultiStepWizard.setup.$carousel.closest(".modal"),n=o.find(".modal-footer").find('button[name="next"]'),l=e.getAccessibleFormStorageFolders();if(a.savePath||(MultiStepWizard.set("savePath",l[0].value),MultiStepWizard.set("savePathName",l[0].label)),l.length>1){i=$('<select class="new-form-save-path form-select" id="new-form-save-path" data-identifier="newFormSavePath" />');for(let e=0,t=l.length;e<t;++e){const t=new Option(l[e].label,l[e].value);$(i).append(t)}}const s=e.getPrototypes();e.assert(s.length>0,"No prototypes available",1477506501),a.prototypeName||(MultiStepWizard.set("prototypeName",s[0].value),MultiStepWizard.set("prototypeNameName",s[0].label));const d=$('<select class="new-form-prototype-name form-select" id="new-form-prototype-name" data-identifier="newFormPrototypeName" />');for(let e=0,t=s.length;e<t;++e){const t=new Option(s[e].label,s[e].value);$(d).append(t)}let c=e.getTemplatesForPrototype(s[0].value);e.assert(c.length>0,"No templates available",1477506502),a.templatePath||(MultiStepWizard.set("templatePath",c[0].value),MultiStepWizard.set("templatePathName",c[0].label));const m=$('<select class="new-form-template form-select" id="new-form-template" data-identifier="newFormTemplate" />');for(let e=0,t=c.length;e<t;++e){const t=new Option(c[e].label,c[e].value);$(m).append(t)}r='<div class="new-form-modal">',"blank"===a.newFormMode?(r+='<h5 class="form-section-headline">'+TYPO3.lang["formManager.blankForm.label"]+"</h5>",MultiStepWizard.set("templatePath","EXT:form/Resources/Private/Backend/Templates/FormEditor/Yaml/NewForms/BlankForm.yaml"),MultiStepWizard.set("templatePathName",TYPO3.lang["formManager.blankForm.label"])):(r+='<h5 class="form-section-headline">'+TYPO3.lang["formManager.predefinedForm.label"]+"</h5>",s.length>1&&(r+='<div class="mb-3"><label for="new-form-prototype-name"><strong>'+TYPO3.lang["formManager.form_prototype"]+'</strong></label><div class="formengine-field-item t3js-formengine-field-item"><div class="form-control-wrap">'+$(d)[0].outerHTML+"</div></div></div>"),c.length>1&&(r+='<div class="mb-3"><label for="new-form-template"><strong>'+TYPO3.lang["formManager.form_template"]+'</strong></label><div class="formengine-field-item t3js-formengine-field-item"><div class="form-description">'+TYPO3.lang["formManager.form_template_description"]+'</div><div class="form-control-wrap">'+$(m)[0].outerHTML+"</div></div></div>")),r+='<div class="mb-3"><label for="new-form-name"><strong>'+TYPO3.lang["formManager.form_name"]+'</strong></label><div class="formengine-field-item t3js-formengine-field-item"><div class="form-description">'+TYPO3.lang["formManager.form_name_description"]+'</div><div class="form-control-wrap">',a.formName?(r+='<input class="form-control" id="new-form-name" data-identifier="newFormName" value="'+securityUtility.encodeHtml(a.formName)+'" />',setTimeout((function(){MultiStepWizard.unlockNextStep()}),200)):r+='<input class="form-control has-error" id="new-form-name" data-identifier="newFormName" />',r+="</div></div></div>",i&&(r+='<div class="mb-3"><label for="new-form-save-path"><strong>'+TYPO3.lang["formManager.form_save_path"]+'</strong></label><div class="formengine-field-item t3js-formengine-field-item"><div class="form-description">'+TYPO3.lang["formManager.form_save_path_description"]+'</div><div class="form-control-wrap">'+$(i)[0].outerHTML+"</div></div></div>"),r+="</div>",t.html(r),a.savePath&&$(Identifiers.newFormSavePath,o).val(a.savePath),a.templatePath&&$(Identifiers.newFormTemplate,o).val(a.templatePath),s.length>1?$(Identifiers.newFormPrototypeName,o).focus():c.length>1&&$(Identifiers.newFormTemplate,o).focus();const p=function(){$(Identifiers.newFormTemplate,o).on("change",(function(){MultiStepWizard.set("templatePath",$(Identifiers.newFormTemplate+" option:selected",o).val()),MultiStepWizard.set("templatePathName",$(Identifiers.newFormTemplate+" option:selected",o).text()),MultiStepWizard.set("templatePathOnPrev",$(Identifiers.newFormTemplate+" option:selected",o).val())}))};$(Identifiers.newFormPrototypeName,o).on("change",(function(t){MultiStepWizard.set("prototypeName",$(Identifiers.newFormPrototypeName+" option:selected",o).val()),MultiStepWizard.set("prototypeNameName",$(Identifiers.newFormPrototypeName+" option:selected",o).text()),c=e.getTemplatesForPrototype($(t.currentTarget).val()),$(Identifiers.newFormTemplate,o).off().empty();for(let e=0,t=c.length;e<t;++e){const t=new Option(c[e].label,c[e].value);$(Identifiers.newFormTemplate,o).append(t),MultiStepWizard.set("templatePath",c[0].value),MultiStepWizard.set("templatePathName",c[0].label)}p()})),p(),a.prototypeName&&($(Identifiers.newFormPrototypeName,o).val(a.prototypeName),$(Identifiers.newFormPrototypeName,o).trigger("change"),a.templatePathOnPrev&&($(Identifiers.newFormTemplate,o).find(selector`option[value="${a.templatePathOnPrev}"]`).prop("selected",!0),$(Identifiers.newFormTemplate,o).trigger("change"))),$(Identifiers.newFormName,o).focus(),$(Identifiers.newFormName,o).on("keyup paste",(function(e){$(e.currentTarget).val().length>0?($(e.currentTarget).removeClass("has-error"),MultiStepWizard.unlockNextStep(),MultiStepWizard.set("formName",$(e.currentTarget).val()),"code"in e&&"Enter"===e.code&&MultiStepWizard.triggerStepButton("next")):($(e.currentTarget).addClass("has-error"),MultiStepWizard.lockNextStep())})),$(Identifiers.newFormSavePath,o).on("change",(function(){MultiStepWizard.set("savePath",$(Identifiers.newFormSavePath+" option:selected",o).val()),MultiStepWizard.set("savePathName",$(Identifiers.newFormSavePath+" option:selected",o).text())})),"blank"===a.newFormMode||a.templatePathName||MultiStepWizard.set("templatePathName",$(Identifiers.newFormTemplate+" option:selected",o).text()),n.on("click",(async function(){MultiStepWizard.setup.forceSelection=!1,t.html($("<div />",{class:"text-center"}).append(await Icons.getIcon("spinner-circle",Icons.sizes.default,null,null)).prop("outerHTML"))}))})),MultiStepWizard.addSlide("new-form-step-3",TYPO3.lang["formManager.newFormWizard.step3.title"],"",Severity.notice,TYPO3.lang["formManager.newFormWizard.step3.progressLabel"],(async function(e,t){const a=await Icons.getIcon("actions-cog",Icons.sizes.small),r=await Icons.getIcon("actions-file-t3d",Icons.sizes.small),i=await Icons.getIcon("actions-tag",Icons.sizes.small),o=await Icons.getIcon("actions-database",Icons.sizes.small),n=MultiStepWizard.setup.$carousel.closest(".modal").find(".modal-footer").find('button[name="next"]');let l='<div class="new-form-modal">';l+='<div class="mb-3"><h5 class="form-section-headline">'+TYPO3.lang["formManager.newFormWizard.step3.check"]+"</h5><p>"+TYPO3.lang["formManager.newFormWizard.step3.message"]+'</p></div><div class="alert alert-notice">',t.prototypeNameName&&(l+='<div class="row my-1"><div class="col col-sm-6">'+a+" "+TYPO3.lang["formManager.form_prototype"]+'</div><div class="col">'+securityUtility.encodeHtml(t.prototypeNameName)+"</div></div>"),t.templatePathName&&(l+='<div class="row my-1"><div class="col col-sm-6">'+r+" "+TYPO3.lang["formManager.form_template"]+'</div><div class="col">'+securityUtility.encodeHtml(t.templatePathName)+"</div></div>"),l+='<div class="row my-1"><div class="col col-sm-6">'+i+" "+TYPO3.lang["formManager.form_name"]+'</div><div class="col">'+securityUtility.encodeHtml(t.formName)+'</div></div><div class="row my-1"><div class="col col-sm-6">'+o+" "+TYPO3.lang["formManager.form_save_path"]+'</div><div class="col">'+securityUtility.encodeHtml(t.savePathName)+"</div></div>",l+="</div></div>",e.html(l),n.focus(),n.on("click",(async function(){MultiStepWizard.setup.forceSelection=!1,e.html($("<div />",{class:"text-center"}).append(await Icons.getIcon("spinner-circle",Icons.sizes.default,null,null)).prop("outerHTML"))}))})),MultiStepWizard.addFinalProcessingSlide((function(){$.post(e.getAjaxEndpoint("create"),{formName:MultiStepWizard.setup.settings.formName,templatePath:MultiStepWizard.setup.settings.templatePath,prototypeName:MultiStepWizard.setup.settings.prototypeName,savePath:MultiStepWizard.setup.settings.savePath},(function(e){"success"===e.status?document.location=e.url:Notification.error(TYPO3.lang["formManager.newFormWizard.step4.errorTitle"],TYPO3.lang["formManager.newFormWizard.step4.errorMessage"]+" "+e.message),MultiStepWizard.dismiss()})).fail((function(e,t,a){const r=(new DOMParser).parseFromString(e.responseText,"text/html"),i=$(r.body);Notification.error(t,a,2),MultiStepWizard.dismiss(),$(Identifiers.t3Logo,i).remove(),$(Identifiers.t3Footer,i).remove(),$(Identifiers.moduleBody).html(i.html())}))})).then((function(){MultiStepWizard.show()}))}))}function removeFormSetup(e){$(Identifiers.removeFormModalTrigger).on("click",(function(t){const a=[];t.preventDefault();const r=$(t.currentTarget);a.push({text:TYPO3.lang["formManager.cancel"],active:!0,btnClass:"btn-default",name:"cancel",trigger:function(e,t){t.hideModal()}}),a.push({text:TYPO3.lang["formManager.remove_form"],active:!0,btnClass:"btn-danger",name:"createform",trigger:function(t,a){document.location=e.getAjaxEndpoint("delete")+"&formPersistenceIdentifier="+r.data("formPersistenceIdentifier"),a.hideModal()}}),Modal.show(TYPO3.lang["formManager.remove_form_title"],TYPO3.lang["formManager.remove_form_message"].replace("{0}",r.data("formName")),Severity.error,a)}))}function duplicateFormSetup(e){$(Identifiers.duplicateFormModalTrigger).on("click",(function(t){t.preventDefault();const a=$(t.currentTarget);MultiStepWizard.addSlide("duplicate-form-step-1",TYPO3.lang["formManager.duplicateFormWizard.step1.title"].replace("{0}",a.data("formName")),"",Severity.notice,top.TYPO3.lang["wizard.progressStep.configure"],(function(t){let r,i;MultiStepWizard.lockPrevStep(),MultiStepWizard.lockNextStep();const o=MultiStepWizard.setup.$carousel.closest(".modal"),n=o.find(".modal-footer").find('button[name="next"]'),l=e.getAccessibleFormStorageFolders();if(e.assert(l.length>0,"No accessible form storage folders",1477649539),MultiStepWizard.set("formPersistenceIdentifier",a.data("formPersistenceIdentifier")),MultiStepWizard.set("savePath",l[0].value),l.length>1){i=$('<select id="duplicate-form-save-path" class="form-select" data-identifier="duplicateFormSavePath" />');for(let e=0,t=l.length;e<t;++e){const t=new Option(l[e].label,l[e].value);$(i).append(t)}}r='<div class="duplicate-form-modal"><h5 class="form-section-headline">'+TYPO3.lang["formManager.new_form_name"]+'</h5><div class="mb-3"><label for="duplicate-form-name"><strong>'+TYPO3.lang["formManager.form_name"]+'</strong></label><div class="formengine-field-item t3js-formengine-field-item"><div class="form-description">'+TYPO3.lang["formManager.form_name_description"]+'</div><div class="form-control-wrap"><input id="duplicate-form-name" class="form-control has-error" data-identifier="duplicateFormName" /></div></div></div>',i&&(r+='<div class="mb-3"><label for="duplicate-form-save-path"><strong>'+TYPO3.lang["formManager.form_save_path"]+'</strong></label><div class="formengine-field-item t3js-formengine-field-item"><div class="form-description">'+TYPO3.lang["formManager.form_save_path_description"]+'</div><div class="form-control-wrap">'+$(i)[0].outerHTML+"</div></div></div>"),r+="</div>",t.html(r),$(Identifiers.duplicateFormName,o).focus(),$(Identifiers.duplicateFormName,o).on("keyup paste",(function(e){const t=$(event.currentTarget);t.val().length>0?(t.removeClass("has-error"),MultiStepWizard.unlockNextStep(),MultiStepWizard.set("formName",t.val()),"code"in e&&"Enter"===e.code&&MultiStepWizard.triggerStepButton("next")):(t.addClass("has-error"),MultiStepWizard.lockNextStep())})),n.on("click",(async function(){MultiStepWizard.setup.forceSelection=!1,MultiStepWizard.set("confirmationDuplicateFormName",a.data("formName")),l.length>1?(MultiStepWizard.set("savePath",$(Identifiers.duplicateFormSavePath+" option:selected",o).val()),MultiStepWizard.set("confirmationDuplicateFormSavePath",$(Identifiers.duplicateFormSavePath+" option:selected",o).text())):(MultiStepWizard.set("savePath",l[0].value),MultiStepWizard.set("confirmationDuplicateFormSavePath",l[0].label)),t.html($("<div />",{class:"text-center"}).append(await Icons.getIcon("spinner-circle",Icons.sizes.default,null,null)).prop("outerHTML"))}))})),MultiStepWizard.addSlide("duplicate-form-step-2",TYPO3.lang["formManager.duplicateFormWizard.step2.title"],"",Severity.notice,TYPO3.lang["formManager.duplicateFormWizard.step2.progressLabel"],(async function(e,t){const a=await Icons.getIcon("actions-file-t3d",Icons.sizes.small),r=await Icons.getIcon("actions-tag",Icons.sizes.small),i=await Icons.getIcon("actions-database",Icons.sizes.small);MultiStepWizard.unlockPrevStep(),MultiStepWizard.unlockNextStep();const o=MultiStepWizard.setup.$carousel.closest(".modal").find(".modal-footer").find('button[name="next"]');let n='<div class="new-form-modal"><div class="row"><div class="col">';n+='<div class="mb-3"><h5 class="form-section-headline">'+TYPO3.lang["formManager.duplicateFormWizard.step2.check"]+"</h5><p>"+TYPO3.lang["formManager.newFormWizard.step3.message"]+'</p></div><div class="alert alert-notice"><div class="dropdown-table-row"><div class="dropdown-table-column dropdown-table-icon">'+a+'</div><div class="dropdown-table-column dropdown-table-title">'+TYPO3.lang["formManager.form_copied"]+'</div><div class="dropdown-table-column dropdown-table-value">'+securityUtility.encodeHtml(t.confirmationDuplicateFormName)+'</div></div><div class="dropdown-table-row"><div class="dropdown-table-column dropdown-table-icon">'+r+'</div><div class="dropdown-table-column dropdown-table-title">'+TYPO3.lang["formManager.form_name"]+'</div><div class="dropdown-table-column dropdown-table-value">'+securityUtility.encodeHtml(t.formName)+'</div></div><div class="dropdown-table-row"><div class="dropdown-table-column dropdown-table-icon">'+i+'</div><div class="dropdown-table-column dropdown-table-title">'+TYPO3.lang["formManager.form_save_path"]+'</div><div class="dropdown-table-column dropdown-table-value">'+securityUtility.encodeHtml(t.confirmationDuplicateFormSavePath)+"</div></div></div>",n+="</div></div></div>",e.html(n),o.focus(),o.on("click",(async function(){MultiStepWizard.setup.forceSelection=!1,e.html($("<div />",{class:"text-center"}).append(await Icons.getIcon("spinner-circle",Icons.sizes.default,null,null)).prop("outerHTML"))}))})),MultiStepWizard.addFinalProcessingSlide((function(){$.post(e.getAjaxEndpoint("duplicate"),{formName:MultiStepWizard.setup.settings.formName,formPersistenceIdentifier:MultiStepWizard.setup.settings.formPersistenceIdentifier,savePath:MultiStepWizard.setup.settings.savePath},(function(e){"success"===e.status?document.location=e.url:Notification.error(TYPO3.lang["formManager.duplicateFormWizard.step3.errorTitle"],TYPO3.lang["formManager.duplicateFormWizard.step3.errorMessage"]+" "+e.message),MultiStepWizard.dismiss()})).fail((function(e,t,a){const r=(new DOMParser).parseFromString(e.responseText,"text/html"),i=$(r.body);Notification.error(t,a,2),MultiStepWizard.dismiss(),$(Identifiers.t3Logo,i).remove(),$(Identifiers.t3Footer,i).remove(),$(Identifiers.moduleBody).html(i.html())}))})).then((function(){MultiStepWizard.show()}))}))}function showReferencesSetup(e){$(Identifiers.showReferences).on("click",(t=>{t.preventDefault();const a=$(t.currentTarget),r=e.getAjaxEndpoint("references")+"&formPersistenceIdentifier="+a.data("formPersistenceIdentifier");$.get(r,(async function(e){let t;const r=[];r.push({text:TYPO3.lang["formManager.cancel"],active:!0,btnClass:"btn-default",name:"cancel",trigger:function(e,t){t.hideModal()}});const i=e.references.length,o=await Icons.getIcon("actions-open",Icons.sizes.small);if(i>0){t="<div><h3>"+TYPO3.lang["formManager.references.headline"].replace("{0}",securityUtility.encodeHtml(a.data("formName")))+'</h3></div><div class="table-fit"><table id="forms" class="table table-striped table-hover"><thead><tr><th class="col-icon"></th><th class="col-recordtitle">'+TYPO3.lang["formManager.table.field.title"]+"</th><th>"+TYPO3.lang["formManager.table.field.uid"]+'</th><th class="col-control nowrap"><span class="visually-hidden">'+TYPO3.lang["formManager.table.field._CONTROL_"]+"</span></th></tr></thead><tbody>";for(let a=0,r=e.references.length;a<r;++a)t+='<tr><td class="col-icon">'+e.references[a].recordIcon+'</td><td class="col-recordtitle"><a href="'+securityUtility.encodeHtml(e.references[a].recordEditUrl)+'" data-identifier="referenceLink">'+securityUtility.encodeHtml(e.references[a].recordTitle)+"</a></td><td>"+securityUtility.encodeHtml(e.references[a].recordUid)+'</td><td class="col-control"><div class="btn-group" role="group"><a href="'+securityUtility.encodeHtml(e.references[a].recordEditUrl)+'" data-identifier="referenceLink" class="btn btn-default" title="'+TYPO3.lang["formManager.btn.edit.title"]+'">'+o+"</a></div></td></tr>";t+="</tbody></table></div>"}else t="<div><h1>"+TYPO3.lang["formManager.references.title"].replace("{0}",securityUtility.encodeHtml(e.formPersistenceIdentifier))+"</h1></div><div>"+TYPO3.lang["formManager.no_references"]+"</div>";t=$(t),$(Identifiers.referenceLink,t).on("click",(function(e){e.preventDefault(),Modal.currentModal.hideModal(),document.location=$(e.currentTarget).prop("href")})),Modal.show(TYPO3.lang["formManager.references.title"].replace("{0}",a.data("formName")),t,Severity.notice,r)})).fail((function(e,t,a){0!==e.status&&Notification.error(t,a,2)}))}))}function initializeSortable(){const e=document.querySelector(Identifiers.formsTable);null!==e&&new SortableTable(e)}!function(e){e.newFormModalTrigger='[data-identifier="newForm"]',e.duplicateFormModalTrigger='[data-identifier="duplicateForm"]',e.removeFormModalTrigger='[data-identifier="removeForm"]',e.newFormModeButton='[data-identifier="newFormModeButton"]',e.newFormName='[data-identifier="newFormName"]',e.newFormSavePath='[data-identifier="newFormSavePath"]',e.newFormPrototypeName='[data-identifier="newFormPrototypeName"]',e.newFormTemplate='[data-identifier="newFormTemplate"]',e.duplicateFormName='[data-identifier="duplicateFormName"]',e.duplicateFormSavePath='[data-identifier="duplicateFormSavePath"]',e.showReferences='[data-identifier="showReferences"]',e.referenceLink='[data-identifier="referenceLink"]',e.moduleBody=".module-body.t3js-module-body",e.t3Logo=".t3-message-page-logo",e.t3Footer="#t3-footer",e.formsTable="#forms"}(Identifiers||(Identifiers={}));export function bootstrap(e){removeFormSetup(e),newFormSetup(e),duplicateFormSetup(e),showReferencesSetup(e),initializeSortable()}