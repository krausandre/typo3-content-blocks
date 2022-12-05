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
import{SeverityEnum}from"@typo3/backend/enum/severity.js";import $ from"jquery";import Modal from"@typo3/backend/modal.js";import Severity from"@typo3/backend/severity.js";import Icons from"@typo3/backend/icons.js";class MultiStepWizard{constructor(){this.setup={slides:[],settings:{},forceSelection:!0,$carousel:null},this.originalSetup=$.extend(!0,{},this.setup)}set(e,t){return this.setup.settings[e]=t,this}addSlide(e,t,s="",i=SeverityEnum.info,r,a){const l={identifier:e,title:t,content:s,severity:i,progressBarTitle:r,callback:a};return this.setup.slides.push(l),this}addFinalProcessingSlide(e){return e||(e=()=>{this.dismiss()}),Icons.getIcon("spinner-circle",Icons.sizes.default,null,null).then((t=>{let s=$("<div />",{class:"text-center"}).append(t);this.addSlide("final-processing-slide",top.TYPO3.lang["wizard.processing.title"],s[0].outerHTML,Severity.info,null,e)}))}show(){let e=this.generateSlides(),t=this.setup.slides[0];Modal.advanced({title:t.title,content:e,severity:t.severity,buttons:[{text:top.TYPO3.lang["wizard.button.cancel"],active:!0,btnClass:"btn-default float-start",name:"cancel",trigger:()=>{this.getComponent().trigger("wizard-dismiss")}},{text:top.TYPO3.lang["wizard.button.prev"],btnClass:"btn-"+Severity.getCssClass(t.severity),name:"prev"},{text:top.TYPO3.lang["wizard.button.next"],btnClass:"btn-"+Severity.getCssClass(t.severity),name:"next"}],additionalCssClasses:["modal-multi-step-wizard"],callback:()=>{this.addButtonContainer(),this.addProgressBar(),this.initializeEvents()}});this.getComponent().on("wizard-visible",(()=>{this.runSlideCallback(t,this.setup.$carousel.find(".carousel-item").first())})).on("wizard-dismissed",(()=>{this.setup=$.extend(!0,{},this.originalSetup)}))}getComponent(){return null===this.setup.$carousel&&this.generateSlides(),this.setup.$carousel}dismiss(){Modal.dismiss()}lockNextStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="next"]');return e.prop("disabled",!0),e}unlockNextStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="next"]');return e.prop("disabled",!1),e}lockPrevStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="prev"]');return e.prop("disabled",!0),e}unlockPrevStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="prev"]');return e.prop("disabled",!1),e}triggerStepButton(e){let t=this.setup.$carousel.closest(".modal").find('button[name="'+e+'"]');return t.length>0&&!0!==t.prop("disabled")&&t.trigger("click"),t}blurCancelStep(){let e=this.setup.$carousel.closest(".modal").find('button[name="cancel"]');return e.trigger("blur"),e}initializeEvents(){let e=this.setup.$carousel.closest(".modal");this.initializeSlideNextEvent(e),this.initializeSlidePrevEvent(e),this.setup.$carousel.on("slide.bs.carousel",(t=>{"left"===t.direction?this.nextSlideChanges(e):this.prevSlideChanges(e)})).on("slid.bs.carousel",(e=>{let t=this.setup.$carousel.data("currentIndex"),s=this.setup.slides[t];this.runSlideCallback(s,$(e.relatedTarget)),this.setup.forceSelection&&this.lockNextStep()}));let t=this.getComponent();t.on("wizard-dismiss",this.dismiss),Modal.currentModal.addEventListener("typo3-modal-hidden",(()=>{t.trigger("wizard-dismissed")})),Modal.currentModal.addEventListener("typo3-modal-shown",(()=>{t.trigger("wizard-visible")}))}initializeSlideNextEvent(e){e.find(".modal-footer").find('button[name="next"]').off().on("click",(()=>{this.setup.$carousel.carousel("next")}))}initializeSlidePrevEvent(e){e.find(".modal-footer").find('button[name="prev"]').off().on("click",(()=>{this.setup.$carousel.carousel("prev")}))}nextSlideChanges(e){this.initializeSlideNextEvent(e);const t=e.find(".modal-title"),s=e.find(".modal-footer"),i=this.setup.$carousel.data("currentSlide")+1,r=this.setup.$carousel.data("currentIndex"),a=r+1;t.text(this.setup.slides[a].title),this.setup.$carousel.data("currentSlide",i),this.setup.$carousel.data("currentIndex",a);const l=s.find(".progress-bar");l.eq(r).width("0%"),l.eq(a).width(this.setup.$carousel.data("initialStep")*i+"%").removeClass("inactive"),this.updateCurrentSeverity(e,r,a)}prevSlideChanges(e){this.initializeSlidePrevEvent(e);const t=e.find(".modal-title"),s=e.find(".modal-footer"),i=s.find('button[name="next"]'),r=this.setup.$carousel.data("currentSlide")-1,a=this.setup.$carousel.data("currentIndex"),l=a-1;this.setup.$carousel.data("currentSlide",r),this.setup.$carousel.data("currentIndex",l),t.text(this.setup.slides[l].title),s.find(".progress-bar.last-step").width(this.setup.$carousel.data("initialStep")+"%").text(this.getProgressBarTitle(this.setup.$carousel.data("slideCount")-1)),i.text(top.TYPO3.lang["wizard.button.next"]);const n=s.find(".progress-bar");n.eq(a).width(this.setup.$carousel.data("initialStep")+"%").addClass("inactive"),n.eq(l).width(this.setup.$carousel.data("initialStep")*r+"%").removeClass("inactive"),this.updateCurrentSeverity(e,a,l)}updateCurrentSeverity(e,t,s){e.find(".modal-footer").find('button[name="next"]').removeClass("btn-"+Severity.getCssClass(this.setup.slides[t].severity)).addClass("btn-"+Severity.getCssClass(this.setup.slides[s].severity)),e.removeClass("modal-severity-"+Severity.getCssClass(this.setup.slides[t].severity)).addClass("modal-severity-"+Severity.getCssClass(this.setup.slides[s].severity))}getProgressBarTitle(e){let t;return t=null===this.setup.slides[e].progressBarTitle?0===e?top.TYPO3.lang["wizard.progressStep.start"]:e>=this.setup.$carousel.data("slideCount")-1?top.TYPO3.lang["wizard.progressStep.finish"]:top.TYPO3.lang["wizard.progressStep"]+String(e+1):this.setup.slides[e].progressBarTitle,t}runSlideCallback(e,t){"function"==typeof e.callback&&e.callback(t,this.setup.settings,e.identifier)}addProgressBar(){let e,t=this.setup.$carousel.find(".carousel-item").length,s=Math.max(1,t),i=this.setup.$carousel.closest(".modal").find(".modal-footer");if(e=Math.round(100/s),this.setup.$carousel.data("initialStep",e).data("slideCount",s).data("realSlideCount",t).data("currentIndex",0).data("currentSlide",1),s>1){i.prepend($("<div />",{class:"progress"}));for(let t=0;t<this.setup.slides.length;++t){let s;s=0===t?"progress-bar first-step":t===this.setup.$carousel.data("slideCount")-1?"progress-bar last-step inactive":"progress-bar step inactive",i.find(".progress").append($("<div />",{role:"progressbar",class:s,"aria-valuemin":0,"aria-valuenow":e,"aria-valuemax":100}).width(e+"%").text(this.getProgressBarTitle(t)))}}}addButtonContainer(){this.setup.$carousel.closest(".modal").find(".modal-footer .btn").wrapAll('<div class="modal-btn-group" />')}generateSlides(){if(null!==this.setup.$carousel)return this.setup.$carousel;let e='<div class="carousel slide" data-bs-ride="false"><div class="carousel-inner" role="listbox">';for(let t=0;t<this.setup.slides.length;++t){let s=this.setup.slides[t],i=s.content;"object"==typeof i&&(i=i.html()),e+='<div class="carousel-item" data-bs-slide="'+s.identifier+'" data-step="'+t+'">'+i+"</div>"}return e+="</div></div>",this.setup.$carousel=$(e),this.setup.$carousel.find(".carousel-item").first().addClass("active"),this.setup.$carousel}}let multistepWizardObject=null;try{window.opener&&window.opener.TYPO3&&window.opener.TYPO3.MultiStepWizard&&(multistepWizardObject=window.opener.TYPO3.MultiStepWizard),parent&&parent.window.TYPO3&&parent.window.TYPO3.MultiStepWizard&&(multistepWizardObject=parent.window.TYPO3.MultiStepWizard),top&&top.TYPO3&&top.TYPO3.MultiStepWizard&&(multistepWizardObject=top.TYPO3.MultiStepWizard)}catch(e){}multistepWizardObject||(multistepWizardObject=new MultiStepWizard,"undefined"!=typeof TYPO3&&(TYPO3.MultiStepWizard=multistepWizardObject));export default multistepWizardObject;