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
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import InfoWindow from '@typo3/backend/info-window';
import Notification from '@typo3/backend/notification';
class LinkBrowserFileHandler {
    constructor() {
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
            if (resource.type === 'file') {
                this.insertLink(resource);
            }
            if (resource.type === 'folder') {
                this.loadContent(resource);
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
    async loadContent(resource) {
        if (resource.type !== 'folder') {
            return;
        }
        const contentsUrl = document.location.href + '&contentOnly=1&expandFolder=' + resource.identifier;
        const response = await new AjaxRequest(contentsUrl).get();
        const html = await response.resolve();
        const contentContainer = document.querySelector('.element-browser-main-content .element-browser-body');
        contentContainer.innerHTML = html;
        const tree = document.querySelector('typo3-backend-component-filestorage-browser-tree');
        if (tree) {
            const treeNodeIdentifier = encodeURIComponent(resource.identifier);
            // @todo Support loading the node via rootline, in case the node has not be loaded in the tree yet, see @typo3/backend/tree/tree-module-state
            const node = tree.nodes.find((node) => node.identifier === treeNodeIdentifier);
            if (node) {
                await tree.expandNodeParents(node);
                tree.selectNode(node, false);
            }
        }
    }
}
export default new LinkBrowserFileHandler();
