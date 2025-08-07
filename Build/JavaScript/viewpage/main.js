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
import interact from 'interactjs';
import DocumentService from '@typo3/core/document-service';
import PersistentStorage, {} from '@typo3/backend/storage/persistent';
import RegularEvent from '@typo3/core/event/regular-event';
import DebounceEvent from '@typo3/core/event/debounce-event';
var Selectors;
(function (Selectors) {
    Selectors["resizableContainerIdentifier"] = ".t3js-viewpage-resizeable";
    Selectors["moduleDocheaderSelector"] = ".t3js-module-docheader";
    Selectors["moduleBodySelector"] = ".t3js-module-body";
    Selectors["customSelector"] = ".t3js-preset-custom";
    Selectors["customWidthSelector"] = ".t3js-preset-custom-width";
    Selectors["customHeightSelector"] = ".t3js-preset-custom-height";
    Selectors["changeOrientationSelector"] = ".t3js-change-orientation";
    Selectors["changePresetSelector"] = ".t3js-change-preset";
    Selectors["inputWidthSelector"] = ".t3js-viewpage-input-width";
    Selectors["inputHeightSelector"] = ".t3js-viewpage-input-height";
    Selectors["currentLabelSelector"] = ".t3js-viewpage-current-label";
    Selectors["topbarContainerSelector"] = ".t3js-viewpage-topbar";
    Selectors["refreshSelector"] = ".t3js-viewpage-refresh";
})(Selectors || (Selectors = {}));
/**
 * Module: @typo3/viewpage/main
 * Main logic for resizing the view of the frame
 */
class ViewPage {
    constructor() {
        this.defaultLabel = '';
        this.minimalHeight = 300;
        this.minimalWidth = 300;
        this.storagePrefix = 'moduleData.page_preview.States.';
        DocumentService.ready().then(() => {
            const presetCustomLabel = document.querySelector('.t3js-preset-custom-label');
            this.defaultLabel = presetCustomLabel?.textContent.trim() ?? '';
            this.iframe = document.getElementById('tx_this_iframe');
            this.inputCustomWidth = document.querySelector(Selectors.inputWidthSelector);
            this.inputCustomHeight = document.querySelector(Selectors.inputHeightSelector);
            this.customPresetItem = document.querySelector(Selectors.customSelector);
            this.customPresetItemWidth = document.querySelector(Selectors.customWidthSelector);
            this.customPresetItemHeight = document.querySelector(Selectors.customHeightSelector);
            this.currentLabelElement = document.querySelector(Selectors.currentLabelSelector);
            this.resizableContainer = document.querySelector(Selectors.resizableContainerIdentifier);
            this.initialize();
        });
    }
    getCurrentWidth() {
        return this.inputCustomWidth.valueAsNumber;
    }
    getCurrentHeight() {
        return this.inputCustomHeight.valueAsNumber;
    }
    setLabel(label) {
        this.currentLabelElement.textContent = label;
    }
    getCurrentLabel() {
        return this.currentLabelElement.textContent;
    }
    persistChanges(storageIdentifier, data) {
        PersistentStorage.set(storageIdentifier, data);
    }
    setSize(width, height) {
        if (isNaN(height)) {
            height = this.calculateContainerMaxHeight();
        }
        if (height < this.minimalHeight) {
            height = this.minimalHeight;
        }
        height = Math.round(height);
        if (isNaN(width)) {
            width = this.calculateContainerMaxWidth();
        }
        if (width < this.minimalWidth) {
            width = this.minimalWidth;
        }
        width = Math.round(width);
        this.inputCustomWidth.valueAsNumber = width;
        this.inputCustomHeight.valueAsNumber = height;
        this.resizableContainer.style.width = `${width}px`;
        this.resizableContainer.style.height = `${height}px`;
        this.resizableContainer.style.left = '0';
    }
    persistCurrentPreset() {
        const data = {
            width: this.getCurrentWidth(),
            height: this.getCurrentHeight(),
            label: this.getCurrentLabel(),
        };
        this.persistChanges(this.storagePrefix + 'current', data);
    }
    persistCustomPreset() {
        const data = {
            width: this.getCurrentWidth(),
            height: this.getCurrentHeight(),
        };
        this.customPresetItem.dataset.width = data.width.toString(10);
        this.customPresetItem.dataset.height = data.height.toString(10);
        this.customPresetItemWidth.textContent = data.width.toString(10);
        this.customPresetItemHeight.textContent = data.height.toString(10);
        this.persistChanges(this.storagePrefix + 'current', data);
        this.persistChanges(this.storagePrefix + 'custom', data);
    }
    persistCustomPresetAfterChange() {
        clearTimeout(this.queueDelayTimer);
        this.queueDelayTimer = window.setTimeout(() => { this.persistCustomPreset(); }, 1000);
    }
    /**
     * Initialize
     */
    initialize() {
        // Change orientation
        new RegularEvent('click', () => {
            this.setSize(this.getCurrentHeight(), this.getCurrentWidth());
            this.persistCurrentPreset();
        }).bindTo(document.querySelector(Selectors.changeOrientationSelector));
        [this.inputCustomWidth, this.inputCustomHeight].forEach((customDimensionControl) => {
            new RegularEvent('input', (e) => {
                const input = e.target;
                input.valueAsNumber = Math.round(parseInt(input.value, 10));
            }).bindTo(customDimensionControl);
            new DebounceEvent('change', () => {
                this.setSize(this.getCurrentWidth(), this.getCurrentHeight());
                this.setLabel(this.defaultLabel);
                this.persistCustomPresetAfterChange();
            }, 50).bindTo(customDimensionControl);
        });
        // Add event to width selector so the container is resized
        new RegularEvent('click', (e, selectedElement) => {
            this.setSize(parseInt(selectedElement.dataset.width, 10), parseInt(selectedElement.dataset.height, 10));
            this.setLabel(selectedElement.dataset.label);
            this.persistCurrentPreset();
        }).delegateTo(document, Selectors.changePresetSelector);
        // Add event for refresh button click
        new RegularEvent('click', () => {
            this.iframe.contentWindow.location.reload();
        }).bindTo(document.querySelector(Selectors.refreshSelector));
        interact(this.resizableContainer).on('resizestart', (e) => {
            // Add iframe overlay to prevent losing the mouse focus to the iframe while resizing fast
            const iframeCover = document.createElement('div');
            iframeCover.id = 'viewpage-iframe-cover';
            iframeCover.setAttribute('style', 'z-index:99;position:absolute;width:100%;top:0;left:0;height:100%;');
            e.target.appendChild(iframeCover);
        }).on('resizeend', () => {
            document.getElementById('viewpage-iframe-cover').remove();
            this.persistCustomPreset();
        }).resizable({
            origin: 'self',
            edges: {
                top: false,
                left: true,
                bottom: true,
                right: true,
            },
            listeners: {
                move: (event) => {
                    const roundedWidth = Math.round(event.rect.width);
                    const roundedHeight = Math.round(event.rect.height);
                    Object.assign(event.target.style, {
                        width: `${roundedWidth}px`,
                        height: `${roundedHeight}px`,
                    });
                    this.inputCustomWidth.valueAsNumber = roundedWidth;
                    this.inputCustomHeight.valueAsNumber = roundedHeight;
                    this.setLabel(this.defaultLabel);
                }
            },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: {
                        width: this.minimalWidth,
                        height: this.minimalHeight
                    }
                })
            ]
        });
    }
    calculateContainerMaxHeight() {
        this.resizableContainer.hidden = true;
        const docheaderHeight = document.querySelector(Selectors.moduleDocheaderSelector).getBoundingClientRect().height;
        const computedStyleOfModuleBody = getComputedStyle(document.querySelector(Selectors.moduleBodySelector));
        const padding = parseFloat(computedStyleOfModuleBody.getPropertyValue('padding-top')) + parseFloat(computedStyleOfModuleBody.getPropertyValue('padding-bottom'));
        const documentHeight = document.body.getBoundingClientRect().height;
        const topbarHeight = document.querySelector(Selectors.topbarContainerSelector).getBoundingClientRect().height;
        this.resizableContainer.hidden = false;
        return documentHeight - docheaderHeight - padding - topbarHeight - 8;
    }
    calculateContainerMaxWidth() {
        this.resizableContainer.hidden = true;
        const computedStyleOfModuleBody = getComputedStyle(document.querySelector(Selectors.moduleBodySelector));
        const padding = parseFloat(computedStyleOfModuleBody.getPropertyValue('padding-left')) + parseFloat(computedStyleOfModuleBody.getPropertyValue('padding-right'));
        const documentWidth = document.body.getBoundingClientRect().width;
        this.resizableContainer.hidden = false;
        return documentWidth - padding;
    }
}
export default new ViewPage();
