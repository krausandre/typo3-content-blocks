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
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import RegularEvent from '@typo3/core/event/regular-event';
class UploadForm {
    constructor() {
        this.expandedUploadFormClass = 'transformed';
    }
    initializeEvents() {
        // Show upload form
        new RegularEvent('click', (event, target) => {
            const uploadForm = document.querySelector('.extension-upload-form');
            event.preventDefault();
            if (uploadForm.classList.contains(this.expandedUploadFormClass)) {
                uploadForm.style.display = 'none';
                uploadForm.classList.remove(this.expandedUploadFormClass);
            }
            else {
                uploadForm.style.display = '';
                uploadForm.classList.add(this.expandedUploadFormClass);
                new AjaxRequest(target.href).get().then(async (response) => {
                    uploadForm.querySelector('.t3js-upload-form-target').innerHTML = await response.resolve();
                });
            }
        }).delegateTo(document, '.t3js-upload');
    }
}
export default UploadForm;
