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
import FormEngine from '@typo3/backend/form-engine';
/**
 * Handles the "Insert clipboard" field control that pastes the clipboard into a "group" field
 */
class InsertClipboard {
    constructor(controlElementId) {
        this.controlElement = null;
        /**
         * @param {Event} e
         */
        this.registerClickHandler = (e) => {
            e.preventDefault();
            const assignedElement = this.controlElement.dataset.element;
            const clipboardItems = JSON.parse(this.controlElement.dataset.clipboardItems);
            for (const item of clipboardItems) {
                FormEngine.setSelectOptionFromExternalSource(assignedElement, item.value, item.title, item.title);
            }
        };
        DocumentService.ready().then(() => {
            this.controlElement = document.querySelector(controlElementId);
            this.controlElement.addEventListener('click', this.registerClickHandler);
        });
    }
}
export default InsertClipboard;
