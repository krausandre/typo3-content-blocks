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
export var FileListActionEvent;
(function (FileListActionEvent) {
    FileListActionEvent["primary"] = "typo3:filelist:resource:action:primary";
    FileListActionEvent["primaryContextmenu"] = "typo3:filelist:resource:action:primaryContextmenu";
    FileListActionEvent["show"] = "typo3:filelist:resource:action:show";
    FileListActionEvent["rename"] = "typo3:filelist:resource:action:rename";
    FileListActionEvent["select"] = "typo3:filelist:resource:action:select";
    FileListActionEvent["download"] = "typo3:filelist:resource:action:download";
    FileListActionEvent["updateOnlineMedia"] = "typo3:filelist:resource:action:updateOnlineMedia";
})(FileListActionEvent || (FileListActionEvent = {}));
export var FileListActionSelector;
(function (FileListActionSelector) {
    FileListActionSelector["elementSelector"] = "[data-filelist-element]";
    FileListActionSelector["actionSelector"] = "[data-filelist-action]";
})(FileListActionSelector || (FileListActionSelector = {}));
export class FileListActionUtility {
    static createResourceFromContextDataset(dataset) {
        const resource = {
            type: dataset.filecontextType,
            identifier: dataset.filecontextIdentifier,
            name: dataset.filecontextName,
            thumbnail: null,
            uid: dataset.filecontextUid ? parseInt(dataset.filecontextUid, 10) : null,
            metaUid: dataset.filecontextMetaUid ? parseInt(dataset.filecontextMetaUid, 10) : null,
            url: dataset.filecontextUid ? dataset.url : null,
        };
        return resource;
    }
    static getResourceForElement(element) {
        const resource = {
            type: element.dataset.filelistType,
            identifier: element.dataset.filelistIdentifier,
            name: element.dataset.filelistName,
            thumbnail: ('filelistThumbnail' in element.dataset && element.dataset.filelistThumbnail.trim() !== '') ? element.dataset.filelistThumbnail : null,
            uid: element.dataset.filelistUid ? parseInt(element.dataset.filelistUid, 10) : null,
            metaUid: element.dataset.filelistMetaUid ? parseInt(element.dataset.filelistMetaUid, 10) : null,
            url: element.dataset.filelistUid ? element.dataset.filelistUrl : null,
        };
        return resource;
    }
}
class FileListActions {
    constructor() {
        new RegularEvent('contextmenu', (event, target) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            const detail = this.getActionDetail(event, target);
            switch (detail.action) {
                case 'primary':
                    document.dispatchEvent(new CustomEvent(FileListActionEvent.primaryContextmenu, { detail: detail }));
                    break;
                default:
                    break;
            }
        }).delegateTo(document, FileListActionSelector.actionSelector);
        new RegularEvent('click', (event, target) => {
            event.preventDefault();
            const detail = this.getActionDetail(event, target);
            switch (detail.action) {
                case 'primary':
                    document.dispatchEvent(new CustomEvent(FileListActionEvent.primary, { detail: detail }));
                    break;
                case 'show':
                    document.dispatchEvent(new CustomEvent(FileListActionEvent.show, { detail: detail }));
                    break;
                case 'select':
                    document.dispatchEvent(new CustomEvent(FileListActionEvent.select, { detail: detail }));
                    break;
                case 'rename':
                    document.dispatchEvent(new CustomEvent(FileListActionEvent.rename, { detail: detail }));
                    break;
                case 'download':
                    document.dispatchEvent(new CustomEvent(FileListActionEvent.download, { detail: detail }));
                    break;
                case 'updateOnlineMedia':
                    document.dispatchEvent(new CustomEvent(FileListActionEvent.updateOnlineMedia, { detail: detail }));
                    break;
                default:
                    break;
            }
        }).delegateTo(document, FileListActionSelector.actionSelector);
    }
    getActionDetail(event, target) {
        const action = target.dataset.filelistAction;
        const element = target.closest(FileListActionSelector.elementSelector);
        const resource = FileListActionUtility.getResourceForElement(element);
        const detail = {
            event: event,
            trigger: target,
            action: action,
            resources: [resource],
            url: target.dataset.filelistActionUrl ?? null,
            originalAction: null
        };
        return detail;
    }
}
export default new FileListActions();
