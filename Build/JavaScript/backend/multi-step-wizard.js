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
import { SeverityEnum } from './enum/severity';
import $ from 'jquery';
import { Carousel } from 'bootstrap';
import Modal, {} from './modal';
import Severity from './severity';
import Icons from './icons';
import { topLevelModuleImport } from './utility/top-level-module-import';
/**
 * Module: @typo3/backend/multi-step-wizard
 * Multi step wizard within a modal
 * @exports @typo3/backend/multi-step-wizard
 */
class MultiStepWizard {
    constructor() {
        this.setup = {
            slides: [],
            settings: {},
            forceSelection: true,
            $carousel: null,
            carousel: null,
        };
        this.originalSetup = $.extend(true, {}, this.setup);
    }
    /**
     * @param {string} key
     * @param {any} value
     * @returns {MultiStepWizard}
     */
    set(key, value) {
        this.setup.settings[key] = value;
        return this;
    }
    /**
     * Add a slide item to carousel as an additional step
     *
     * @param {string} identifier
     * @param {string} title
     * @param {string} progressBarTitle
     * @param {string} content
     * @param {SeverityEnum} severity
     * @param {Function} callback
     * @returns {MultiStepWizard}
     */
    addSlide(identifier, title, content = '', severity = SeverityEnum.info, progressBarTitle, callback) {
        const slide = {
            identifier: identifier,
            title: title,
            content: content,
            severity: severity,
            progressBarTitle: progressBarTitle,
            callback: callback,
        };
        this.setup.slides.push(slide);
        return this;
    }
    /**
     * Add the final processing slide as the last step
     *
     * @param {Function} callback
     * @returns {Promise<string>}
     */
    async addFinalProcessingSlide(callback) {
        if (!callback) {
            callback = () => {
                this.dismiss();
            };
        }
        const spinnerIcon = await Icons.getIcon('spinner-circle', Icons.sizes.large, null, null);
        const processingSlide = document.createElement('div');
        processingSlide.classList.add('text-center');
        processingSlide.append(document.createRange().createContextualFragment(spinnerIcon));
        this.addSlide('final-processing-slide', top.TYPO3.lang['wizard.processing.title'], processingSlide, Severity.notice, top.TYPO3.lang['wizard.progressStep.finish'], callback);
    }
    /**
     * Create wizard with modal, buttons, progress bar and carousel
     */
    show() {
        const $slides = this.generateSlides();
        const firstSlide = this.setup.slides[0];
        Modal.advanced({
            title: firstSlide.title,
            content: $slides,
            severity: firstSlide.severity,
            staticBackdrop: true,
            buttons: [{
                    text: top.TYPO3.lang['wizard.button.cancel'],
                    active: true,
                    btnClass: 'btn-default float-start',
                    name: 'cancel',
                    trigger: () => {
                        this.getComponent().trigger('wizard-dismiss');
                    },
                }, {
                    text: top.TYPO3.lang['wizard.button.prev'],
                    btnClass: 'btn-' + Severity.getCssClass(firstSlide.severity),
                    name: 'prev',
                }, {
                    text: top.TYPO3.lang['wizard.button.next'],
                    btnClass: 'btn-' + Severity.getCssClass(firstSlide.severity),
                    name: 'next',
                }],
            additionalCssClasses: ['modal-multi-step-wizard'],
            callback: (modal) => {
                topLevelModuleImport('@typo3/backend/element/progress-tracker-element.js').then(() => {
                    this.setup.carousel = new Carousel(modal.querySelector('.carousel'));
                    this.addButtonContainer();
                    this.addProgressBar();
                    this.initializeEvents();
                });
            }
        });
        this.getComponent().on('wizard-visible', () => {
            if (this.setup.forceSelection) {
                // @todo: This is a hack as modal buttons cannot be initially disabled.
                this.lockPrevStep();
                this.lockNextStep();
            }
            this.runSlideCallback(firstSlide, this.setup.$carousel.find('.carousel-item').first());
        }).on('wizard-dismissed', () => {
            this.setup = $.extend(true, {}, this.originalSetup);
        });
    }
    /**
     * @returns {JQuery}
     */
    getComponent() {
        if (this.setup.$carousel === null) {
            this.generateSlides();
        }
        return this.setup.$carousel;
    }
    /**
     * Close the modal / wizard
     */
    dismiss() {
        Modal.dismiss();
    }
    /**
     * Lock the button for the next step
     *
     * @returns {JQuery}
     */
    lockNextStep() {
        const $button = this.setup.$carousel.closest('.modal').find('button[name="next"]');
        $button.prop('disabled', true);
        return $button;
    }
    next() {
        this.setup.carousel.next();
    }
    previous() {
        this.setup.carousel.prev();
    }
    /**
     * Unlock the button for the next step
     *
     * @returns {JQuery}
     */
    unlockNextStep() {
        const $button = this.setup.$carousel.closest('.modal').find('button[name="next"]');
        $button.prop('disabled', false);
        return $button;
    }
    /**
     * Lock the button for the prev step
     *
     * @returns {JQuery}
     */
    lockPrevStep() {
        const $button = this.setup.$carousel.closest('.modal').find('button[name="prev"]');
        $button.prop('disabled', true);
        return $button;
    }
    /**
     * Unlock the button for the prev step
     *
     * @returns {JQuery}
     */
    unlockPrevStep() {
        const $button = this.setup.$carousel.closest('.modal').find('button[name="prev"]');
        $button.prop('disabled', false);
        return $button;
    }
    /**
     * Trigger a step button (prev or next)
     *
     * @param {string} direction
     * @returns {JQuery}
     */
    triggerStepButton(direction) {
        const $button = this.setup.$carousel.closest('.modal').find('button[name="' + direction + '"]');
        if ($button.length > 0 && $button.prop('disabled') !== true) {
            $button.get(0).click();
        }
        return $button;
    }
    /**
     * Blur the button for the cancel step
     *
     * @returns {JQuery}
     */
    blurCancelStep() {
        const $button = this.setup.$carousel.closest('.modal').find('button[name="cancel"]');
        $button.trigger('blur');
        return $button;
    }
    /**
     * Register all events
     *
     * @private
     */
    initializeEvents() {
        const $modal = this.setup.$carousel.closest('.modal');
        this.initializeSlideNextEvent($modal);
        this.initializeSlidePrevEvent($modal);
        // Event fires when the slide transition is invoked
        this.setup.$carousel.get(0).addEventListener('slide.bs.carousel', (evt) => {
            if (evt.direction === 'left') {
                this.nextSlideChanges($modal);
            }
            else {
                this.prevSlideChanges($modal);
            }
        });
        // Event is fired when the carousel has completed its slide transition
        this.setup.$carousel.get(0).addEventListener('slid.bs.carousel', (evt) => {
            const currentIndex = this.setup.$carousel.data('currentIndex');
            const slide = this.setup.slides[currentIndex];
            if (this.setup.forceSelection) {
                this.lockNextStep();
            }
            this.runSlideCallback(slide, $(evt.relatedTarget));
        });
        // Custom event, closes the wizard
        const cmp = this.getComponent();
        cmp.on('wizard-dismiss', this.dismiss);
        Modal.currentModal.addEventListener('typo3-modal-hidden', () => {
            cmp.trigger('wizard-dismissed');
        });
        Modal.currentModal.addEventListener('typo3-modal-shown', () => {
            cmp.trigger('wizard-visible');
        });
    }
    initializeSlideNextEvent($modal) {
        const $modalFooter = $modal.find('.modal-footer');
        const $nextButton = $modalFooter.find('button[name="next"]');
        $nextButton.off().on('click', () => {
            this.setup.carousel.next();
        });
    }
    initializeSlidePrevEvent($modal) {
        const $modalFooter = $modal.find('.modal-footer');
        const $prevButton = $modalFooter.find('button[name="prev"]');
        $prevButton.off().on('click', () => {
            this.setup.carousel.prev();
        });
    }
    /**
     * All changes after applying the next-button
     *
     * @param {JQuery} $modal
     * @private
     */
    nextSlideChanges($modal) {
        this.initializeSlideNextEvent($modal);
        const $modalTitle = $modal.find('.modal-title');
        const nextSlideNumber = this.setup.$carousel.data('currentSlide') + 1;
        const currentIndex = this.setup.$carousel.data('currentIndex');
        const nextIndex = currentIndex + 1;
        const $slideContent = $modal.find('.carousel-item:eq(' + nextIndex + ')');
        // Flush content when sliding
        $slideContent.empty().append(this.setup.slides[nextIndex].content);
        $modalTitle.text(this.setup.slides[nextIndex].title);
        // Always unlock previous step
        this.unlockPrevStep();
        this.setup.$carousel.data('currentSlide', nextSlideNumber);
        this.setup.$carousel.data('currentIndex', nextIndex);
        const progressTracker = $modal.find('typo3-backend-progress-tracker');
        progressTracker.attr('active', nextIndex + 1);
        this.updateCurrentSeverity($modal, currentIndex, nextIndex);
    }
    /**
     * All changes after applying the prev-button
     *
     * @param {JQuery} $modal
     * @private
     */
    prevSlideChanges($modal) {
        this.initializeSlidePrevEvent($modal);
        const $modalTitle = $modal.find('.modal-title');
        const $modalFooter = $modal.find('.modal-footer');
        const $nextButton = $modalFooter.find('button[name="next"]');
        const nextSlideNumber = this.setup.$carousel.data('currentSlide') - 1;
        const currentIndex = this.setup.$carousel.data('currentIndex');
        const nextIndex = currentIndex - 1;
        const $slideContent = $modal.find('.carousel-item:eq(' + nextIndex + ')');
        // Flush content when sliding
        $slideContent.empty().append(this.setup.slides[nextIndex].content);
        $modalTitle.text(this.setup.slides[nextIndex].title);
        // Always unlock previous step if there is any
        if (nextIndex > 0) {
            this.unlockPrevStep();
        }
        else {
            this.lockPrevStep();
        }
        this.setup.$carousel.data('currentSlide', nextSlideNumber);
        this.setup.$carousel.data('currentIndex', nextIndex);
        $nextButton.text(top.TYPO3.lang['wizard.button.next']);
        const progressTracker = $modal.find('typo3-backend-progress-tracker');
        progressTracker.attr('active', nextIndex + 1);
        this.updateCurrentSeverity($modal, currentIndex, nextIndex);
    }
    /**
     * Update severity of modal and buttons when changing slides.
     *
     * @param $modal
     * @param currentIndex
     * @param nextIndex
     * @private
     */
    updateCurrentSeverity($modal, currentIndex, nextIndex) {
        const $modalFooter = $modal.find('.modal-footer');
        const $nextButton = $modalFooter.find('button[name="next"]');
        $nextButton
            .removeClass('btn-' + Severity.getCssClass(this.setup.slides[currentIndex].severity))
            .addClass('btn-' + Severity.getCssClass(this.setup.slides[nextIndex].severity));
        $modal
            .removeClass('modal-severity-' + Severity.getCssClass(this.setup.slides[currentIndex].severity))
            .addClass('modal-severity-' + Severity.getCssClass(this.setup.slides[nextIndex].severity));
    }
    /**
     * @param {Slide} slide
     * @param {JQuery} $slide
     * @private
     */
    runSlideCallback(slide, $slide) {
        if (typeof slide.callback === 'function') {
            slide.callback($slide, this.setup.settings, slide.identifier);
        }
    }
    /**
     * Create the progress bar within the modal footer
     *
     * @private
     */
    addProgressBar() {
        const realSlideCount = this.setup.$carousel.find('.carousel-item').length;
        const slideCount = Math.max(1, realSlideCount);
        const initialStep = Math.round(100 / slideCount);
        this.setup.$carousel
            .data('initialStep', initialStep)
            .data('slideCount', slideCount)
            .data('realSlideCount', realSlideCount)
            .data('currentIndex', 0)
            .data('currentSlide', 1);
        // Append progress bar to modal footer
        if (slideCount > 1) {
            const progressTracker = document.createElement('typo3-backend-progress-tracker');
            progressTracker.stages = this.setup.slides
                .map((slide) => {
                return slide.progressBarTitle;
            });
            const modalContent = this.setup.$carousel.get(0).closest('.modal-content');
            const modalBody = modalContent.querySelector('.modal-body');
            const modalProgress = document.createElement('div');
            modalProgress.classList.add('modal-progress');
            modalProgress.appendChild(progressTracker);
            modalContent.insertBefore(modalProgress, modalBody);
        }
    }
    /**
     * Wrap all the buttons of modal footer
     *
     * @private
     */
    addButtonContainer() {
        const $modal = this.setup.$carousel.closest('.modal');
        const $modalFooterButtons = $modal.find('.modal-footer .btn');
        $modalFooterButtons.wrapAll('<div class="modal-btn-group" />');
    }
    /**
     * Generate slides of carousel
     *
     * @returns {JQuery}
     * @private
     */
    generateSlides() {
        // Check whether the slides were already generated
        if (this.setup.$carousel !== null) {
            return this.setup.$carousel;
        }
        const carouselOuter = document.createElement('div');
        carouselOuter.classList.add('carousel', 'slide');
        carouselOuter.dataset.bsRide = 'false';
        const carouselInner = document.createElement('div');
        carouselInner.classList.add('carousel-inner');
        carouselInner.role = 'listbox';
        carouselOuter.append(carouselInner);
        for (let i = 0; i < this.setup.slides.length; ++i) {
            const currentSlide = this.setup.slides[i];
            const slideInner = document.createElement('div');
            if (typeof currentSlide.content === 'string') {
                slideInner.textContent = currentSlide.content;
            }
            else {
                if (currentSlide.content instanceof $) {
                    slideInner.replaceChildren(currentSlide.content.get(0));
                }
                else {
                    slideInner.replaceChildren(currentSlide.content);
                }
            }
            const slide = document.createElement('div');
            slide.classList.add('carousel-item');
            slide.dataset.bsSlide = currentSlide.identifier;
            slide.dataset.step = i.toString(10);
            slide.append(slideInner);
            carouselInner.append(slide);
        }
        this.setup.$carousel = $(carouselOuter);
        this.setup.$carousel.find('.carousel-item').first().addClass('active');
        return this.setup.$carousel;
    }
}
let multistepWizardObject;
try {
    // fetch from opening window
    if (window.opener && window.opener.TYPO3 && window.opener.TYPO3.MultiStepWizard) {
        multistepWizardObject = window.opener.TYPO3.MultiStepWizard;
    }
    // fetch from parent
    if (parent && parent.window.TYPO3 && parent.window.TYPO3.MultiStepWizard) {
        multistepWizardObject = parent.window.TYPO3.MultiStepWizard;
    }
    // fetch object from outer frame
    if (top && top.TYPO3 && top.TYPO3.MultiStepWizard) {
        multistepWizardObject = top.TYPO3.MultiStepWizard;
    }
}
catch {
    // This only happens if the opener, parent or top is some other url (eg a local file)
    // which loaded the current window. Then the browser's cross domain policy jumps in
    // and raises an exception.
    // For this case we are safe and we can create our global object below.
}
if (!multistepWizardObject) {
    multistepWizardObject = new MultiStepWizard();
    // attach to global frame
    if (typeof TYPO3 !== 'undefined') {
        TYPO3.MultiStepWizard = multistepWizardObject;
    }
}
export default multistepWizardObject;
