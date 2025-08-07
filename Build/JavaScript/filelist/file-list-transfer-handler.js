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
import Modal from '@typo3/backend/modal';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import RegularEvent from '@typo3/core/event/regular-event';
import Notification from '@typo3/backend/notification';
import Viewport from '@typo3/backend/viewport';
import { FileListDragDropEvent } from '@typo3/filelist/file-list-dragdrop';
var FileListTransferType;
(function (FileListTransferType) {
    FileListTransferType["move"] = "move";
    FileListTransferType["copy"] = "copy";
})(FileListTransferType || (FileListTransferType = {}));
class FileListTransferHandler {
    constructor() {
        new RegularEvent(FileListDragDropEvent.transfer, (event) => {
            const detail = event.detail;
            const target = detail.target;
            const resources = detail.resources;
            let modalTitle;
            let modalText;
            if (detail.resources.length === 1) {
                const resource = detail.resources[0];
                modalTitle = TYPO3.lang['message.transfer_resource.title'];
                modalText = TYPO3.lang['message.transfer_resource.text']
                    .replace('%s', resource.name)
                    .replace('%s', target.name);
            }
            else {
                modalTitle = TYPO3.lang['message.transfer_resources.title'];
                modalText = TYPO3.lang['message.transfer_resources.text']
                    .replace('%d', resources.length.toString(10))
                    .replace('%s', target.name);
            }
            const modal = Modal.confirm(modalTitle, modalText, SeverityEnum.notice, [
                {
                    text: TYPO3.lang['message.button.cancel'],
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                    trigger: () => {
                        modal.hideModal();
                    }
                },
                {
                    text: TYPO3.lang['message.button.copy'],
                    btnClass: 'btn-primary',
                    name: 'copy',
                    trigger: () => {
                        this.transfer(FileListTransferType.copy, resources, target);
                        modal.hideModal();
                    }
                },
                {
                    text: TYPO3.lang['message.button.move'],
                    btnClass: 'btn-primary',
                    name: 'move',
                    trigger: () => {
                        this.transfer(FileListTransferType.move, resources, target);
                        modal.hideModal();
                    }
                }
            ]);
        }).bindTo(top.document);
    }
    transfer(type, resources, target) {
        const payload = [];
        resources.forEach((resource) => {
            const operation = {
                data: resource.identifier,
                target: target.identifier,
            };
            payload.push(operation);
        });
        const params = { data: { [type]: payload } };
        (new AjaxRequest(top.TYPO3.settings.ajaxUrls.file_process))
            .post(params)
            .then(async (response) => {
            const data = await response.resolve();
            this.handleMessages(data.messages ?? []);
            Viewport.ContentContainer.refresh();
            top.document.dispatchEvent(new CustomEvent('typo3:filestoragetree:refresh'));
        })
            .catch(async (response) => {
            const data = await response.resolve();
            this.handleMessages(data.messages ?? []);
            Viewport.ContentContainer.refresh();
            top.document.dispatchEvent(new CustomEvent('typo3:filestoragetree:refresh'));
        });
    }
    handleMessages(messages) {
        messages.forEach((message) => {
            Notification.showMessage(message.title || '', message.message || '', message.severity);
        });
    }
}
export default new FileListTransferHandler();
