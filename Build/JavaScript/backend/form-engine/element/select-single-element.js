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
import RegularEvent from '@typo3/core/event/regular-event';
import DocumentService from '@typo3/core/document-service';
import FormEngine, {} from '@typo3/backend/form-engine';
import { selector } from '@typo3/core/literals';
/**
 * Module: @typo3/backend/form-engine/element/select-single-element
 * Logic for SelectSingleElement
 */
class SelectSingleElement {
    constructor() {
        this.initialize = (elementSelector, options) => {
            const selectElement = document.querySelector(elementSelector);
            if (selectElement === null) {
                return;
            }
            options = options || {};
            new RegularEvent('change', (e) => {
                const target = e.target;
                const groupIconContainer = target.parentElement.querySelector('.input-group-icon');
                // Update prepended select icon
                if (groupIconContainer !== null) {
                    groupIconContainer.innerHTML = (target.options[target.selectedIndex].dataset.icon);
                }
                const selectIcons = target.closest('.t3js-formengine-field-item').querySelector('.t3js-forms-select-single-icons');
                if (selectIcons !== null) {
                    const activeItem = selectIcons.querySelector('.form-wizard-icon-list-item button.active, .form-wizard-icon-list-item a.active');
                    if (activeItem !== null) {
                        activeItem.classList.remove('active');
                    }
                    const selectionIcon = selectIcons.querySelector(selector `[data-select-index="${target.selectedIndex.toString(10)}"]`);
                    if (selectionIcon !== null) {
                        selectionIcon.closest('.form-wizard-icon-list-item button, .form-wizard-icon-list-item a').classList.add('active');
                    }
                }
            }).bindTo(selectElement);
            if (options.onChange instanceof Array) {
                // hand `OnFieldChange` processing over to `FormEngine`
                new RegularEvent('change', () => FormEngine.processOnFieldChange(options.onChange)).bindTo(selectElement);
            }
            new RegularEvent('click', (e, target) => {
                const currentActive = target.closest('.t3js-forms-select-single-icons').querySelector('.form-wizard-icon-list-item button.active, .form-wizard-icon-list-item a.active');
                if (currentActive !== null) {
                    currentActive.classList.remove('active');
                }
                selectElement.selectedIndex = parseInt(target.dataset.selectIndex, 10);
                selectElement.dispatchEvent(new Event('change'));
                target.closest('.form-wizard-icon-list-item button, .form-wizard-icon-list-item a').classList.add('active');
            }).delegateTo(selectElement.closest('.form-control-wrap'), '.t3js-forms-select-single-icons .form-wizard-icon-list-item button:not(.active), .t3js-forms-select-single-icons .form-wizard-icon-list-item a:not(.active)');
        };
    }
    initializeOnReady(selector, options) {
        DocumentService.ready().then(() => {
            this.initialize(selector, options);
        });
    }
}
export default new SelectSingleElement();
