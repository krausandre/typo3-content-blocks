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
import { html } from 'lit';
import { FileListActionEvent } from '@typo3/filelist/file-list-actions';
import { default as Modal } from '@typo3/backend/modal';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Notification from '@typo3/backend/notification';
import Viewport from '@typo3/backend/viewport';
class FileListRenameHandler {
    constructor() {
        new RegularEvent(FileListActionEvent.rename, (event) => {
            const detail = event.detail;
            const resource = detail.resources[0];
            const modal = Modal.advanced({
                title: TYPO3.lang['file_rename.title'] || 'Rename',
                type: Modal.types.default,
                size: Modal.sizes.small,
                content: this.composeEditForm(resource),
                buttons: [
                    {
                        text: TYPO3.lang['file_rename.button.cancel'] || 'Cancel',
                        btnClass: 'btn-default',
                        name: 'cancel',
                        trigger: () => {
                            modal.hideModal();
                        }
                    },
                    {
                        text: TYPO3.lang['file_rename.button.rename'] || 'Rename',
                        btnClass: 'btn-primary',
                        name: 'rename',
                        trigger: () => {
                            const form = modal.querySelector('form');
                            form?.requestSubmit();
                        },
                    },
                ],
                callback: function (modal) {
                    const form = modal.querySelector('form');
                    form.addEventListener('submit', (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.target);
                        const submittedData = Object.fromEntries(formData);
                        const resourceName = submittedData.name.toString();
                        if (detail.resources[0].name !== resourceName) {
                            const request = new AjaxRequest(TYPO3.settings.ajaxUrls.resource_rename);
                            request.post({
                                identifier: detail.resources[0].identifier,
                                resourceName: resourceName,
                            }).then(async (success) => {
                                const data = await success.resolve();
                                if (data.status.length > 0) {
                                    data.status.forEach((message) => {
                                        if (data.success) {
                                            Notification.success(message.title, message.message);
                                        }
                                        else {
                                            Notification.error(message.title, message.message);
                                        }
                                    });
                                }
                                if (data.resource?.type === 'folder') {
                                    const currentUrl = Viewport.ContentContainer.getUrl();
                                    const params = (new URL(currentUrl, window.location.origin)).searchParams;
                                    if (params.get('id') === data.origin.identifier) {
                                        Viewport.ContentContainer.setUrl(currentUrl + '&id=' + data.resource.identifier);
                                    }
                                    else {
                                        Viewport.ContentContainer.refresh();
                                    }
                                }
                                else {
                                    Viewport.ContentContainer.refresh();
                                }
                                top.document.dispatchEvent(new CustomEvent('typo3:filestoragetree:refresh'));
                                modal.hideModal();
                            });
                        }
                    });
                    modal.addEventListener('typo3-modal-shown', () => {
                        form.querySelector('input')?.focus();
                    });
                }
            });
        }).bindTo(document);
    }
    composeEditForm(resource) {
        const label = resource?.type === 'folder' ?
            TYPO3.lang['folder_rename.label'] ?? 'New folder name' :
            TYPO3.lang['file_rename.label'] ?? 'New filename';
        return html `
      <form>
        <label class="form-label" for="rename_target">
          ${label}
        </label>
        <input id="rename_target" name="name" class="form-control" value="${resource.name}" required>
      </form>
    `;
    }
}
export default new FileListRenameHandler();
