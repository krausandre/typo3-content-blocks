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
import LinkBrowser from '@typo3/backend/link-browser';
import RegularEvent from '@typo3/core/event/regular-event';
import { FileListActionEvent } from '@typo3/filelist/file-list-actions';
import InfoWindow from '@typo3/backend/info-window';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Notification from '@typo3/backend/notification';
class LinkBrowserFolderHandler {
    constructor() {
        new RegularEvent('click', (event, target) => {
            event.preventDefault();
            LinkBrowser.finalizeFunction(target.dataset.linkbrowserLink);
        }).delegateTo(document, '[data-linkbrowser-link]');
        new RegularEvent(FileListActionEvent.primary, (event) => {
            event.preventDefault();
            const detail = event.detail;
            detail.action = FileListActionEvent.select;
            document.dispatchEvent(new CustomEvent(FileListActionEvent.select, { detail: detail }));
        }).bindTo(document);
        new RegularEvent(FileListActionEvent.select, (event) => {
            event.preventDefault();
            const detail = event.detail;
            const resource = detail.resources[0];
            if (resource.type === 'folder') {
                this.insertLink(resource);
            }
        }).bindTo(document);
        new RegularEvent(FileListActionEvent.show, (event) => {
            event.preventDefault();
            const detail = event.detail;
            const resource = detail.resources[0];
            InfoWindow.showItem('_' + resource.type.toUpperCase(), resource.identifier);
        }).bindTo(document);
    }
    insertLink(resource) {
        const request = new AjaxRequest(TYPO3.settings.ajaxUrls.link_resource);
        request.post({
            identifier: resource.identifier,
        }).then(async (success) => {
            const data = await success.resolve();
            data.status.forEach((message) => {
                Notification.showMessage(message.title, message.message, message.severity);
            });
            if (data.success) {
                LinkBrowser.finalizeFunction(data.link);
            }
        });
    }
}
export default new LinkBrowserFolderHandler();
