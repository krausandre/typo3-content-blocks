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
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
var Identifiers;
(function (Identifiers) {
    Identifiers["containerSelector"] = ".t3js-newmultiplepages-container";
    Identifiers["addMoreFieldsButtonSelector"] = ".t3js-newmultiplepages-createnewfields";
    Identifiers["pageTitleSelector"] = ".t3js-newmultiplepages-page-title";
    Identifiers["doktypeSelector"] = ".t3js-newmultiplepages-select-doktype";
    Identifiers["resetFieldsSelector"] = ".t3js-newmultiplepages-reset-fields";
    Identifiers["templateRow"] = ".t3js-newmultiplepages-newlinetemplate";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/backend/new-multiple-pages
 * JavaScript functions for creating multiple pages
 */
class NewMultiplePages {
    constructor() {
        this.lineCounter = 5;
        DocumentService.ready().then(() => {
            this.initializeEvents();
        });
    }
    /**
     * Register listeners
     */
    initializeEvents() {
        new RegularEvent('click', this.createNewFormFields.bind(this))
            .delegateTo(document, Identifiers.addMoreFieldsButtonSelector);
        new RegularEvent('change', this.actOnPageTitleChange)
            .delegateTo(document, Identifiers.pageTitleSelector);
        new RegularEvent('change', this.actOnTypeSelectChange)
            .delegateTo(document, Identifiers.doktypeSelector);
        new RegularEvent('click', this.resetFieldAttributes)
            .delegateTo(document, Identifiers.resetFieldsSelector);
    }
    /**
     * Add further input rows
     */
    createNewFormFields() {
        const multiplePagesContainer = document.querySelector(Identifiers.containerSelector);
        const lineMarkup = document.querySelector(Identifiers.templateRow)?.innerHTML || '';
        if (multiplePagesContainer === null || lineMarkup === '') {
            return;
        }
        for (let i = 0; i < 5; i++) {
            const label = this.lineCounter + i + 1;
            multiplePagesContainer.innerHTML += lineMarkup
                .replace(/\[0\]/g, (this.lineCounter + i).toString())
                .replace(/\[1\]/g, label.toString());
        }
        this.lineCounter += 5;
    }
    actOnPageTitleChange() {
        this.setAttribute('value', this.value);
    }
    actOnTypeSelectChange() {
        for (const option of this.options) {
            option.removeAttribute('selected');
        }
        const optionElement = this.options[this.selectedIndex];
        const targetElement = document.querySelector(this.dataset.target);
        if (optionElement !== null && targetElement !== null) {
            optionElement.setAttribute('selected', 'selected');
            targetElement.innerHTML = optionElement.dataset.icon;
        }
    }
    /**
     * Manually reset the attributes on input and select fields
     * @private
     */
    resetFieldAttributes() {
        document.querySelectorAll(Identifiers.containerSelector + ' ' + Identifiers.pageTitleSelector).forEach((inputElement) => {
            inputElement.removeAttribute('value');
        });
        document.querySelectorAll(Identifiers.containerSelector + ' ' + Identifiers.doktypeSelector).forEach((selectElement) => {
            for (const option of selectElement) {
                option.removeAttribute('selected');
            }
            const defaultIcon = selectElement.options[0]?.dataset.icon;
            const targetElement = document.querySelector(selectElement.dataset.target);
            if (defaultIcon && targetElement !== null) {
                targetElement.innerHTML = defaultIcon;
            }
        });
    }
}
export default new NewMultiplePages();
