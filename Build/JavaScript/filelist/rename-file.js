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
import { SeverityEnum } from '@typo3/backend/enum/severity';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Modal from '@typo3/backend/modal';
import DocumentService from '@typo3/core/document-service';
/**
 * Module: @typo3/filelist/rename-file
 * Modal to pick the required conflict strategy for colliding filenames
 * @exports @typo3/filelist/rename-file
 */
class RenameFile {
    constructor() {
        DocumentService.ready().then(() => {
            this.initialize();
        });
    }
    initialize() {
        const submitButton = document.querySelector('.t3js-submit-file-rename');
        if (submitButton !== null) {
            submitButton.addEventListener('click', this.checkForDuplicate);
        }
    }
    checkForDuplicate(e) {
        e.preventDefault();
        const form = e.currentTarget.form;
        const fileNameField = form.querySelector('input[name="data[rename][0][target]"]');
        const destinationField = form.querySelector('input[name="data[rename][0][destination]"]');
        const conflictModeField = form.querySelector('input[name="data[rename][0][conflictMode]"]');
        const data = {
            fileName: fileNameField.value
        };
        // destination is not set if we deal with a folder
        if (destinationField !== null) {
            data.fileTarget = destinationField.value;
        }
        new AjaxRequest(TYPO3.settings.ajaxUrls.file_exists).withQueryArguments(data).get({ cache: 'no-cache' }).then(async (response) => {
            const result = await response.resolve();
            const fileExists = typeof result.uid !== 'undefined';
            const originalFileName = fileNameField.dataset.original;
            const newFileName = fileNameField.value;
            if (fileExists && originalFileName !== newFileName) {
                const description = TYPO3.lang['file_rename.exists.description']
                    .replace('{0}', originalFileName).replace(/\{1\}/g, newFileName);
                const modal = Modal.confirm(TYPO3.lang['file_rename.exists.title'], description, SeverityEnum.warning, [
                    {
                        active: true,
                        btnClass: 'btn-default',
                        name: 'cancel',
                        text: TYPO3.lang['file_rename.actions.cancel'],
                    },
                    {
                        btnClass: 'btn-primary',
                        name: 'rename',
                        text: TYPO3.lang['file_rename.actions.rename'],
                    },
                    {
                        btnClass: 'btn-default',
                        name: 'replace',
                        text: TYPO3.lang['file_rename.actions.override'],
                    },
                ]);
                modal.addEventListener('button.clicked', (event) => {
                    const target = event.target;
                    if (target.name !== 'cancel') {
                        // conflictMode is not set if we deal with a folder
                        if (conflictModeField !== null) {
                            conflictModeField.value = target.name;
                        }
                        form.submit();
                    }
                    modal.hideModal();
                });
            }
            else {
                form.submit();
            }
        });
    }
}
export default new RenameFile();
