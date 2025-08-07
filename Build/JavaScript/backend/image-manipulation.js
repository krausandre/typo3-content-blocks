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
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html';
import { styleMap } from 'lit/directives/style-map';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import RegularEvent from '@typo3/core/event/regular-event';
import FormEngineValidation from '@typo3/backend/form-engine-validation';
import Cropper from 'cropperjs';
import { default as Modal } from './modal';
import '@typo3/backend/element/spinner-element';
import { renderNodes } from '@typo3/core/lit-helper';
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';
import { Offset } from '@typo3/backend/offset';
/**
 * Module: @typo3/backend/image-manipulation
 * Contains all logic for the image crop GUI including setting focusAreas
 * @exports @typo3/backend/image-manipulation
 */
class ImageManipulation {
    constructor() {
        this.initialized = false;
        this.triggerListener = null;
        this.cropImageSelector = '#t3js-crop-image';
        this.coverAreaSelector = '.t3js-cropper-cover-area';
        this.cropInfoSelector = '.t3js-cropper-info-crop';
        this.focusAreaSelector = 'typo3-backend-draggable-resizable';
        this.focusAreaVisualElementSelector = 'typo3-backend-draggable-resizable .cropper-focus-area';
        this.defaultFocusArea = {
            height: 1 / 3,
            width: 1 / 3,
            x: 0,
            y: 0,
        };
        this.defaultOpts = {
            autoCrop: true,
            autoCropArea: 0.7,
            dragMode: 'crop',
            guides: true,
            responsive: true,
            viewMode: 1,
            zoomable: false,
            checkCrossOrigin: false,
        };
        /**
         * @desc Internal cropper handler. Called when the cropper has been instantiated
         */
        this.cropBuiltHandler = () => {
            this.initialized = true;
            const imageData = this.cropper.getImageData();
            const image = this.currentModal.querySelector(this.cropImageSelector);
            // Make the image in the backdrop visible again.
            // TODO: Check why this doesn't happen automatically.
            this.currentModal.querySelector('.cropper-canvas img')?.classList.remove('cropper-hide');
            this.imageOriginalSizeFactor = parseInt(image.dataset.originalWidth, 10) / imageData.naturalWidth;
            // iterate over the crop variants and set up their respective preview
            this.cropVariantTriggers.forEach((elem) => {
                const cropVariantId = elem.dataset.cropVariantId;
                const cropArea = this.convertRelativeToAbsoluteCropArea(this.data[cropVariantId].cropArea, imageData);
                const variant = Object.assign({}, this.data[cropVariantId], { cropArea });
                this.updatePreviewThumbnail(variant, elem);
                this.currentModal.querySelector(`[data-crop-variant-container="${variant.id}"]`)?.querySelector(`[data-bs-option="${variant.selectedRatio}"]`)?.classList.add('active');
            });
            this.currentCropVariant.cropArea = this.convertRelativeToAbsoluteCropArea(this.currentCropVariant.cropArea, imageData);
            // can't use .t3js-* as selector because it is an extraneous selector
            this.cropBox = this.currentModal.querySelector('.cropper-crop-box');
            if (this.currentCropVariant.selectedRatio) {
                // set data explicitly or setAspectRatio up-scales the crop
                this.currentModal.querySelector(`[data-bs-option='${this.currentCropVariant.selectedRatio}']`)
                    ?.classList.add('active');
            }
        };
        /**
         * @desc Internal cropper handler. Called when the cropping area is moving
         */
        this.cropMoveHandler = (e) => {
            if (!this.initialized) {
                return;
            }
            const minCroppedWidth = 15;
            const minCroppedHeight = 15;
            let width = Math.floor(e.detail.width);
            let height = Math.floor(e.detail.height);
            if (width < minCroppedWidth || height < minCroppedHeight) {
                width = Math.max(minCroppedHeight, height);
                height = Math.max(minCroppedWidth, width);
                this.cropper.setData({
                    width: width,
                    height: height,
                });
            }
            this.currentCropVariant.cropArea = Object.assign({}, this.currentCropVariant.cropArea, {
                width: Math.floor(width),
                height: Math.floor(height),
                x: Math.floor(e.detail.x),
                y: Math.floor(e.detail.y),
            });
            if (this.focusAreaEl && this.currentCropVariant?.focusArea) {
                this.focusAreaEl.offset = this.convertAreaToOffset(this.currentCropVariant.focusArea, this.cropBox);
            }
            this.updatePreviewThumbnail(this.currentCropVariant, this.activeCropVariantTrigger);
            this.updateCropVariantData(this.currentCropVariant);
            const naturalWidth = Math.round(this.currentCropVariant.cropArea.width * this.imageOriginalSizeFactor);
            const naturalHeight = Math.round(this.currentCropVariant.cropArea.height * this.imageOriginalSizeFactor);
            this.cropInfo.innerText = `${naturalWidth}×${naturalHeight} px`;
        };
    }
    /**
     * @desc window.setTimeout shim
     * @param {Function} fn - The function to execute
     * @param {number} ms - The time in [ms] to wait until execution
     */
    static wait(fn, ms) {
        window.setTimeout(fn, ms);
    }
    /**
     * @desc Takes a number, and converts it to CSS percentage length
     * @param {number} num - The number to convert
     */
    static toCssPercent(num) {
        return `${num * 100}%`;
    }
    /**
     * @desc Serializes crop variants for persistence or preview
     * @param {Object} cropVariants
     */
    static serializeCropVariants(cropVariants) {
        const omitUnused = (key, value) => {
            return (key === 'id'
                || key === 'title'
                || key === 'allowedAspectRatios'
                || key === 'coverAreas') ? undefined : value;
        };
        return JSON.stringify(cropVariants, omitUnused);
    }
    static isEmptyObject(subject) {
        return !subject
            || typeof subject !== 'object'
            || Object.keys(subject).length === 0
            || JSON.stringify(subject) === '{}';
    }
    static resolvePointerEventNames() {
        /**
         * To make the focusarea draggable, cropper must be disabled by register the same events as cropper does.
         *  Copied from https://github.com/fengyuanchen/cropperjs/blob/main/src/js/constants.js
         */
        const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
        const IS_TOUCH_DEVICE = IS_BROWSER && window.document.documentElement ? 'ontouchstart' in window.document.documentElement : false;
        const HAS_POINTER_EVENT = IS_BROWSER ? 'PointerEvent' in window : false;
        const EVENT_TOUCH_MOVE = IS_TOUCH_DEVICE ? ['touchmove'] : ['mousemove'];
        const EVENT_TOUCH_START = IS_TOUCH_DEVICE ? ['touchstart'] : ['mousedown'];
        const EVENT_TOUCH_END = IS_TOUCH_DEVICE ? ['touchend', 'touchcancel'] : ['mouseup'];
        const EVENT_POINTER_DOWN = HAS_POINTER_EVENT ? ['pointerdown'] : EVENT_TOUCH_START;
        const EVENT_POINTER_MOVE = HAS_POINTER_EVENT ? ['pointermove'] : EVENT_TOUCH_MOVE;
        const EVENT_POINTER_UP = HAS_POINTER_EVENT ? ['pointerup', 'pointercancel'] : EVENT_TOUCH_END;
        return {
            touchStart: EVENT_TOUCH_START,
            touchMove: EVENT_TOUCH_MOVE,
            touchEnd: EVENT_TOUCH_END,
            pointerDown: EVENT_POINTER_DOWN,
            pointerMove: EVENT_POINTER_MOVE,
            pointerUp: EVENT_POINTER_UP,
        };
    }
    /**
     * @desc Assign a handler to .t3js-image-manipulation-trigger.
     *       Show the modal and kick-off image manipulation
     */
    initializeTrigger() {
        if (this.triggerListener) {
            return;
        }
        this.triggerListener = new RegularEvent('click', (evt, target) => {
            evt.preventDefault();
            this.trigger = target;
            this.show();
        });
        this.triggerListener.delegateTo(document, '.t3js-image-manipulation-trigger');
    }
    /**
     * @desc Initialize the cropper modal and dispatch the cropper init
     */
    async initializeCropperModal() {
        const image = this.currentModal.querySelector(this.cropImageSelector);
        await new Promise((resolve) => {
            if (image.complete) {
                resolve();
            }
            else {
                image.addEventListener('load', () => resolve());
            }
        });
        this.init();
    }
    /**
     * @desc Load the image and setup the modal UI
     */
    show() {
        const triggerData = this.trigger.dataset;
        const modalTitle = triggerData.modalTitle;
        const buttonPreviewText = triggerData.buttonPreviewText;
        const buttonDismissText = triggerData.buttonDismissText;
        const buttonSaveText = triggerData.buttonSaveText;
        const imageUri = triggerData.url;
        const payload = JSON.parse(triggerData.payload);
        /**
         * Open modal with image to crop
         */
        this.currentModal = Modal.advanced({
            additionalCssClasses: ['modal-image-manipulation', 'cropper'],
            buttons: [
                {
                    btnClass: 'btn-default float-start',
                    name: 'preview',
                    icon: 'actions-view',
                    text: buttonPreviewText,
                },
                {
                    btnClass: 'btn-default',
                    name: 'dismiss',
                    icon: 'actions-close',
                    text: buttonDismissText,
                },
                {
                    btnClass: 'btn-primary',
                    name: 'save',
                    icon: 'actions-document-save',
                    text: buttonSaveText,
                },
            ],
            content: html `<div class="modal-loading"><typo3-backend-spinner size="large"></typo3-backend-spinner></div>`,
            size: Modal.sizes.full,
            style: Modal.styles.dark,
            title: modalTitle,
            staticBackdrop: true
        });
        this.currentModal.addEventListener('typo3-modal-shown', () => {
            new AjaxRequest(imageUri).post(payload).then(async (response) => {
                const htmlResponse = await response.resolve();
                this.currentModal.templateResultContent = html `${unsafeHTML(htmlResponse)}`;
                this.currentModal.updateComplete.then(() => this.initializeCropperModal());
            });
        });
        this.currentModal.addEventListener('typo3-modal-hide', () => {
            this.destroy();
        });
    }
    /**
     * @desc Initializes the cropper UI and sets up all the event bindings for the UI
     */
    init() {
        const image = this.currentModal.querySelector(this.cropImageSelector);
        const data = this.trigger.dataset.cropVariants;
        if (!data) {
            throw new TypeError('ImageManipulation: No cropVariants data found for image');
        }
        // if we have data already set we assume an internal reinit eg. after resizing
        this.data = ImageManipulation.isEmptyObject(this.data) ? JSON.parse(data) : this.data;
        this.cropVariantTriggers = this.currentModal.querySelectorAll('.t3js-crop-variant-trigger');
        this.activeCropVariantTrigger = this.currentModal.querySelector('.t3js-crop-variant-trigger.is-active');
        this.cropInfo = this.currentModal.querySelector(this.cropInfoSelector);
        this.currentCropVariant = this.data[this.activeCropVariantTrigger.dataset.cropVariantId];
        /**
         * Assign EventListener to cropVariantTriggers
         */
        this.cropVariantTriggers.forEach((el) => el.addEventListener('click', (e) => {
            /**
             * Is the current cropVariantTrigger is active, bail out.
             * Bootstrap doesn't provide this functionality when collapsing the Collapse panels
             */
            if (e.currentTarget.classList.contains('is-active')) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }
            this.activeCropVariantTrigger.classList.remove('is-active');
            e.currentTarget.classList.add('is-active');
            this.activeCropVariantTrigger = e.currentTarget;
            const cropVariant = this.data[this.activeCropVariantTrigger.dataset.cropVariantId];
            const imageData = this.cropper.getImageData();
            cropVariant.cropArea = this.convertRelativeToAbsoluteCropArea(cropVariant.cropArea, imageData);
            this.currentCropVariant = Object.assign({}, cropVariant);
            this.update(cropVariant);
        }));
        /**
         * Assign EventListener to aspectRatioTrigger
         */
        new RegularEvent('click', (evt, target) => {
            const ratioId = target.dataset.bsOption;
            this.handleAspectRatioChange(ratioId);
        }).delegateTo(this.currentModal, 'label[data-method=setAspectRatio]');
        new RegularEvent('keydown', (evt, target) => {
            if (!['Enter', 'Space'].includes(evt.code)) {
                return;
            }
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const setAspectRatioLabel = target.closest('label[data-method="setAspectRatio"]');
            const ratioId = setAspectRatioLabel.dataset.bsOption;
            setAspectRatioLabel.querySelector('input').checked = true;
            this.handleAspectRatioChange(ratioId);
        }).delegateTo(this.currentModal, 'label[data-method="setAspectRatio"] input[type="radio"]');
        /**
         * Assign EventListener to saveButton
         */
        new RegularEvent('click', () => this.save(this.data))
            .delegateTo(this.currentModal, 'button[name=save]');
        /**
         * Assign EventListener to previewButton if preview url exists
         */
        if (this.trigger.dataset.previewUrl) {
            new RegularEvent('click', () => this.openPreview(this.data))
                .delegateTo(this.currentModal, 'button[name=preview]');
        }
        else {
            this.currentModal.querySelectorAll('button[name=preview]')
                .forEach((previewButton) => previewButton.style.display = 'none');
        }
        /**
         * Assign EventListener to dismissButton
         */
        new RegularEvent('click', () => this.currentModal.hideModal())
            .delegateTo(this.currentModal, 'button[name=dismiss]');
        /**
         * Assign EventListener to resetButton
         */
        new RegularEvent('click', (evt, target) => {
            const imageData = this.cropper.getImageData();
            const resetCropVariantString = target.dataset.cropVariant;
            evt.preventDefault();
            evt.stopPropagation();
            if (!resetCropVariantString) {
                throw new TypeError('TYPO3 Cropper: No cropVariant data attribute found on reset element.');
            }
            const resetCropVariant = JSON.parse(resetCropVariantString);
            const absoluteCropArea = this.convertRelativeToAbsoluteCropArea(resetCropVariant.cropArea, imageData);
            this.currentCropVariant = Object.assign({}, resetCropVariant, { cropArea: absoluteCropArea });
            this.update(this.currentCropVariant);
        }).delegateTo(this.currentModal, 'button[name=reset]');
        // if we start without an cropArea, maximize the cropper
        if (ImageManipulation.isEmptyObject(this.currentCropVariant.cropArea)) {
            this.defaultOpts = Object.assign({ autoCropArea: 1 }, this.defaultOpts);
        }
        /**
         * Initialise the cropper
         */
        this.cropper = new Cropper(image, Object.assign({}, this.defaultOpts, {
            ready: () => {
                this.cropBuiltHandler();
                // Initialize current crop variant
                this.update(this.currentCropVariant);
            },
            crop: this.cropMoveHandler.bind(this),
            data: this.currentCropVariant.cropArea,
        }));
    }
    handleAspectRatioChange(ratioId) {
        const temp = Object.assign({}, this.currentCropVariant);
        const ratio = temp.allowedAspectRatios[ratioId];
        this.setAspectRatio(ratio);
        // set data explicitly or setAspectRatio upscales the crop
        this.setCropArea(temp.cropArea);
        this.currentCropVariant = Object.assign({}, temp, { selectedRatio: ratioId });
        this.update(this.currentCropVariant);
    }
    /**
     * @desc Update current cropArea position and size when changing cropVariants
     * @param {CropVariant} cropVariant - The new cropVariant to update the UI with
     */
    async update(cropVariant) {
        const temp = Object.assign({}, cropVariant);
        const selectedRatio = cropVariant.allowedAspectRatios[cropVariant.selectedRatio];
        // Set cropInfo to current container context
        this.cropInfo = this.currentModal.querySelector(`[data-crop-variant-container="${cropVariant.id}"]`)?.querySelector(this.cropInfoSelector);
        // highlight the currently selected ratio of the active cropping variant
        this.currentModal.querySelector(`[data-crop-variant-container="${cropVariant.id}"]`)?.querySelector('[data-bs-option].active')?.classList.remove('active');
        this.currentModal.querySelector(`[data-crop-variant-container="${cropVariant.id}"]`)?.querySelector(`[data-bs-option="${cropVariant.selectedRatio}"]`)?.classList.add('active');
        /**
         * Setting the aspect ratio cause a redraw of the crop area so we need to manually reset it to last data
         */
        this.setAspectRatio(selectedRatio);
        this.setCropArea(temp.cropArea);
        this.currentCropVariant = Object.assign({}, temp, cropVariant);
        this.cropBox?.querySelectorAll(this.coverAreaSelector)?.forEach((el) => el.remove());
        this.cropBox?.querySelectorAll(this.focusAreaSelector)?.forEach((el) => el.remove());
        // check if new cropVariant has focusArea
        if (cropVariant.focusArea) {
            // init or reinit focusArea
            if (ImageManipulation.isEmptyObject(cropVariant.focusArea)) {
                this.currentCropVariant.focusArea = Object.assign({}, this.defaultFocusArea);
            }
            this.focusAreaEl = this.initFocusArea(this.cropBox);
        }
        else {
            this.focusAreaEl = null;
        }
        // check if new cropVariant has coverAreas
        if (cropVariant.coverAreas) {
            // init or reinit focusArea
            this.initCoverAreas(this.cropBox, this.currentCropVariant.coverAreas);
        }
        this.updatePreviewThumbnail(this.currentCropVariant, this.activeCropVariantTrigger);
    }
    /**
     * @desc Initializes the focus area inside a container and registers the resizable and draggable interfaces to it
     * @param {HTMLElement} container
     */
    initFocusArea(container) {
        topLevelModuleImport('@typo3/backend/element/draggable-resizable-element.js');
        const focusAreaEl = top.document.createElement('typo3-backend-draggable-resizable');
        // assign area declaration (as persisted in the database)
        focusAreaEl.setAttribute('offset', JSON.stringify(this.convertAreaToOffset(this.currentCropVariant.focusArea, container)));
        // use the same events as cropper.js does
        focusAreaEl.setAttribute('pointereventnames', JSON.stringify(ImageManipulation.resolvePointerEventNames()));
        focusAreaEl.addEventListener('draggable-resizable-started', () => {
            // disable outer cropper, when interacting with inner draggable-resizable-element
            this.cropper.disable();
        });
        focusAreaEl.addEventListener('draggable-resizable-updated', () => {
            const coverAreas = this.currentCropVariant.coverAreas;
            const focusArea = this.convertOffsetToArea(focusAreaEl.offset, container);
            // retrieve the inner visual element of the lit-element
            const visualElement = focusAreaEl.querySelector(this.focusAreaVisualElementSelector);
            if (this.checkFocusAndCoverAreasCollision(focusArea, coverAreas)) {
                visualElement.classList.add('has-nodrop');
            }
            else {
                visualElement.classList.remove('has-nodrop');
            }
        });
        focusAreaEl.addEventListener('draggable-resizable-finished', (evt) => {
            const coverAreas = this.currentCropVariant.coverAreas;
            const focusArea = this.convertOffsetToArea(focusAreaEl.offset, container);
            if (this.checkFocusAndCoverAreasCollision(focusArea, coverAreas)) {
                focusAreaEl.revert(evt.detail.originOffset);
            }
            else {
                this.scaleAndMoveFocusArea(focusArea);
            }
            const visualElement = focusAreaEl.querySelector(this.focusAreaVisualElementSelector);
            visualElement.classList.remove('has-nodrop');
            // re-enable outer cropper again
            this.cropper.enable();
        });
        container.appendChild(focusAreaEl);
        this.scaleAndMoveFocusArea(this.currentCropVariant.focusArea);
        return focusAreaEl;
    }
    /**
     * @desc Initialise cover areas inside the cropper container
     * @param {HTMLElement} container - The container element to append the cover areas
     * @param {Array<Area>} coverAreas - An array of areas to construct the cover area elements from
     */
    initCoverAreas(container, coverAreas) {
        coverAreas.forEach((coverArea) => {
            const styles = {
                height: ImageManipulation.toCssPercent(coverArea.height),
                left: ImageManipulation.toCssPercent(coverArea.x),
                top: ImageManipulation.toCssPercent(coverArea.y),
                width: ImageManipulation.toCssPercent(coverArea.width),
            };
            const coverAreaCanvas = html `
        <div class="cropper-cover-area t3js-cropper-cover-area" style=${styleMap(styles)}></div>
      `;
            this.renderElements(coverAreaCanvas, container);
        });
    }
    /**
     * @desc Sync the cropping (and focus area) to the preview thumbnail
     * @param {CropVariant} cropVariant - The crop variant to preview in the thumbnail
     * @param {HTMLElement} cropVariantTrigger - The crop variant element containing the thumbnail
     */
    updatePreviewThumbnail(cropVariant, cropVariantTrigger) {
        const cropperPreviewThumbnailCrop = cropVariantTrigger.querySelector('.t3js-cropper-preview-thumbnail-crop-area');
        const cropperPreviewThumbnailImage = cropVariantTrigger.querySelector('.t3js-cropper-preview-thumbnail-crop-image');
        const cropperPreviewThumbnailFocus = cropVariantTrigger.querySelector('.t3js-cropper-preview-thumbnail-focus-area');
        const imageData = this.cropper.getImageData();
        // update the position/dimension of the crop area in the preview
        Object.assign(cropperPreviewThumbnailCrop.style, {
            height: ImageManipulation.toCssPercent(cropVariant.cropArea.height / imageData.naturalHeight),
            left: ImageManipulation.toCssPercent(cropVariant.cropArea.x / imageData.naturalWidth),
            top: ImageManipulation.toCssPercent(cropVariant.cropArea.y / imageData.naturalHeight),
            width: ImageManipulation.toCssPercent(cropVariant.cropArea.width / imageData.naturalWidth),
        });
        // show and update focusArea in the preview only if we really have one configured
        if (cropVariant.focusArea) {
            Object.assign(cropperPreviewThumbnailFocus.style, {
                height: ImageManipulation.toCssPercent(cropVariant.focusArea.height),
                left: ImageManipulation.toCssPercent(cropVariant.focusArea.x),
                top: ImageManipulation.toCssPercent(cropVariant.focusArea.y),
                width: ImageManipulation.toCssPercent(cropVariant.focusArea.width),
            });
        }
        // destruct the preview container's CSS properties
        const cropperPreviewThumbnailCropStyles = getComputedStyle(cropperPreviewThumbnailCrop);
        const styles = {
            width: cropperPreviewThumbnailCropStyles.getPropertyValue('width'),
            height: cropperPreviewThumbnailCropStyles.getPropertyValue('height'),
            left: cropperPreviewThumbnailCropStyles.getPropertyValue('left'),
            top: cropperPreviewThumbnailCropStyles.getPropertyValue('top'),
        };
        /**
         * Apply negative margins on the previewThumbnailImage to make the illusion of an offset
         */
        Object.assign(cropperPreviewThumbnailImage.style, {
            height: `${parseFloat(styles.height) * (1 / (cropVariant.cropArea.height / imageData.naturalHeight))}px`,
            margin: `${-1 * parseFloat(styles.left)}px`,
            marginTop: `${-1 * parseFloat(styles.top)}px`,
            width: `${parseFloat(styles.width) * (1 / (cropVariant.cropArea.width / imageData.naturalWidth))}px`,
        });
    }
    /**
     * @desc Calculation logic for moving the focus area given the
     *       specified constrains of a crop and an optional cover area
     * @param {Area} focusArea - The translation data
     */
    scaleAndMoveFocusArea(focusArea) {
        this.currentCropVariant.focusArea = focusArea;
        this.updatePreviewThumbnail(this.currentCropVariant, this.activeCropVariantTrigger);
        this.updateCropVariantData(this.currentCropVariant);
    }
    /**
     * @desc Immutably updates the currently selected cropVariant data
     * @param {CropVariant} currentCropVariant - The cropVariant to immutably save
     */
    updateCropVariantData(currentCropVariant) {
        const imageData = this.cropper.getImageData();
        const absoluteCropArea = this.convertAbsoluteToRelativeCropArea(currentCropVariant.cropArea, imageData);
        this.data[currentCropVariant.id] = Object.assign({}, currentCropVariant, { cropArea: absoluteCropArea });
    }
    /**
     * @desc Sets the cropper to a specific ratio
     * @param {ratio} ratio - The ratio value to apply
     */
    setAspectRatio(ratio) {
        this.cropper.setAspectRatio(ratio.value);
    }
    /**
     * @desc Sets the cropper to a specific crop area
     * @param {cropArea} cropArea - The crop area to apply
     */
    setCropArea(cropArea) {
        const currentRatio = this.currentCropVariant.allowedAspectRatios[this.currentCropVariant.selectedRatio];
        if (currentRatio.value === 0) {
            this.cropper.setData({
                height: cropArea.height,
                width: cropArea.width,
                x: cropArea.x,
                y: cropArea.y,
            });
        }
        else {
            this.cropper.setData({
                height: cropArea.height,
                width: cropArea.height * currentRatio.value,
                x: cropArea.x,
                y: cropArea.y,
            });
        }
    }
    /**
     * @desc Checks is one focus area and one or more cover areas overlap
     * @param focusArea
     * @param coverAreas
     */
    checkFocusAndCoverAreasCollision(focusArea, coverAreas) {
        if (!coverAreas) {
            return false;
        }
        return coverAreas
            .some((coverArea) => {
            return focusArea.x < coverArea.x + coverArea.width
                && coverArea.x < focusArea.x + focusArea.width
                && focusArea.y < coverArea.y + coverArea.height
                && coverArea.y < focusArea.height + focusArea.y;
        });
    }
    /**
     * @desc Converts a crop area from absolute pixel-based into relative length values
     * @param {Area} cropArea - The crop area to convert from
     * @param {Cropper.ImageData} imageData - The image data
     */
    convertAbsoluteToRelativeCropArea(cropArea, imageData) {
        const { height, width, x, y } = cropArea;
        return {
            height: height / imageData.naturalHeight,
            width: width / imageData.naturalWidth,
            x: x / imageData.naturalWidth,
            y: y / imageData.naturalHeight,
        };
    }
    /**
     * @desc Converts a crop area from relative into absolute pixel-based length values
     * @param {Area} cropArea - The crop area to convert from
     * @param {Cropper.ImageData} imageData - The image data
     */
    convertRelativeToAbsoluteCropArea(cropArea, imageData) {
        const { height, width, x, y } = cropArea;
        return {
            height: height * imageData.naturalHeight,
            width: width * imageData.naturalWidth,
            x: x * imageData.naturalWidth,
            y: y * imageData.naturalHeight,
        };
    }
    /**
     * @desc Updates the preview images in the editing section with the respective crop variants
     * @param {Object} data - The internal crop variants state
     */
    setPreviewImages(data) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const image = this.cropper.image;
        const imageData = this.cropper.getImageData();
        // iterate over the crop variants and set up their respective preview
        Object.keys(data).forEach((cropVariantId) => {
            const cropVariant = data[cropVariantId];
            const cropData = this.convertRelativeToAbsoluteCropArea(cropVariant.cropArea, imageData);
            const preview = this.trigger
                .closest('.form-group')
                .querySelector(`.t3js-image-manipulation-preview[data-crop-variant-id="${cropVariantId}"]`);
            const previewSelectedRatio = this.trigger
                .closest('.form-group')
                .querySelector(`.t3js-image-manipulation-selected-ratio[data-crop-variant-id="${cropVariantId}"]`); // tslint:disable-line:max-line-length
            if (!(preview instanceof HTMLElement)) {
                return;
            }
            let previewWidth = preview.getBoundingClientRect().width;
            let previewHeight = parseInt(preview.dataset.previewHeight, 10);
            // adjust aspect ratio of preview width/height
            const aspectRatio = cropData.width / cropData.height;
            const tmpHeight = previewWidth / aspectRatio;
            if (tmpHeight > previewHeight) {
                previewWidth = previewHeight * aspectRatio;
            }
            else {
                previewHeight = tmpHeight;
            }
            // preview should never be up-scaled
            if (previewWidth > cropData.width) {
                previewWidth = cropData.width;
                previewHeight = cropData.height;
            }
            const ratio = previewWidth / cropData.width;
            const imageStyles = {
                height: `${imageData.naturalHeight * ratio}px`,
                left: `${-cropData.x * ratio}px`,
                top: `${-cropData.y * ratio}px`,
                width: `${imageData.naturalWidth * ratio}px`,
            };
            const containerStyles = {
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
            };
            const viewBox = html `
        <span class="thumbnail thumbnail-status">
          <div class="cropper-preview-container" style="${styleMap(containerStyles)}">
            <img src="${image.src}" style="${styleMap(imageStyles)}">
          </div>
        </span>
      `;
            while (preview.firstChild) {
                preview.removeChild(preview.firstChild);
            }
            this.renderElements(viewBox, preview);
            const ratioTitleWindow = this.currentModal.ownerDocument.defaultView;
            const ratioTitleText = this.currentModal.querySelector(`.t3-js-ratio-title[data-ratio-id="${cropVariant.id}${cropVariant.selectedRatio}"]`); // tslint:disable-line:max-line-length
            if (previewSelectedRatio instanceof HTMLElement && ratioTitleText instanceof ratioTitleWindow.HTMLElement) {
                previewSelectedRatio.innerText = ratioTitleText.innerText;
            }
        });
    }
    /**
     * @desc Opens a preview view with the crop variants
     * @param {object} data - The whole data object containing all the cropVariants
     */
    openPreview(data) {
        const cropVariants = ImageManipulation.serializeCropVariants(data);
        let previewUrl = this.trigger.dataset.previewUrl;
        previewUrl = previewUrl + (previewUrl.includes('?') ? '&' : '?') + 'cropVariants=' + encodeURIComponent(cropVariants);
        window.open(previewUrl, 'TYPO3ImageManipulationPreview');
    }
    /**
     * @desc Saves the edited cropVariants to a hidden field
     * @param {Record<string, CropVariant>} data - The whole data object containing all the cropVariants
     */
    save(data) {
        const cropVariants = ImageManipulation.serializeCropVariants(data);
        const hiddenField = document.querySelector(`#${this.trigger.dataset.field}`);
        this.trigger.dataset.cropVariants = JSON.stringify(data);
        this.setPreviewImages(data);
        hiddenField.value = cropVariants;
        FormEngineValidation.markFieldAsChanged(hiddenField);
        this.currentModal.hideModal();
    }
    /**
     * @desc Destroy the ImageManipulation including cropper and alike
     */
    destroy() {
        if (this.currentModal) {
            if (this.cropper instanceof Cropper) {
                this.cropper.destroy();
            }
            this.initialized = false;
            this.cropper = null;
            this.currentModal = null;
            this.data = null;
        }
    }
    convertAreaToOffset(area, container) {
        const containerBounds = container.getBoundingClientRect();
        return new Offset(area.x * containerBounds.width, area.y * containerBounds.height, area.width * containerBounds.width, area.height * containerBounds.height);
    }
    convertOffsetToArea(offset, container) {
        const containerBounds = container.getBoundingClientRect();
        return {
            x: offset.left / containerBounds.width,
            y: offset.top / containerBounds.height,
            width: offset.width / containerBounds.width,
            height: offset.height / containerBounds.height,
        };
    }
    renderElements(template, target, selector) {
        const nodes = renderNodes(template);
        const elements = Array.from(nodes).filter((node) => node instanceof HTMLElement);
        elements.forEach((element) => target.appendChild(element));
        return selector ? target.querySelector(selector) : null;
    }
}
export default new ImageManipulation();
