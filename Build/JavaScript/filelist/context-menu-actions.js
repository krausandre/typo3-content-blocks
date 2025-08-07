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
import { lll } from '@typo3/core/lit-helper';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Notification from '@typo3/backend/notification';
import Modal from '@typo3/backend/modal';
import Md5 from '@typo3/backend/hashing/md5';
import { fileListOpenElementBrowser } from '@typo3/filelist/file-list';
import { FileListActionEvent, FileListActionUtility } from './file-list-actions';
/**
 * Module: @typo3/filelist/context-menu-actions
 *
 * JavaScript to handle filelist actions from context menu
 * @exports @typo3/filelist/context-menu-actions
 */
class ContextMenuActions {
    static getReturnUrl() {
        return encodeURIComponent(top.list_frame.document.location.pathname + top.list_frame.document.location.search);
    }
    static triggerFileDownload(downloadUrl, fileName, revokeObjectURL = false) {
        const anchorTag = document.createElement('a');
        anchorTag.href = downloadUrl;
        anchorTag.download = fileName;
        document.body.appendChild(anchorTag);
        anchorTag.click();
        if (revokeObjectURL) {
            URL.revokeObjectURL(downloadUrl);
        }
        document.body.removeChild(anchorTag);
        // Add notification about successful preparation
        Notification.success(lll('file_download.success'), '', 2);
    }
    static renameFile(table, uid, dataset) {
        (async () => {
            await import('@typo3/filelist/file-list-rename-handler');
            const resource = FileListActionUtility.createResourceFromContextDataset(dataset);
            const detail = {
                event: null,
                trigger: null,
                action: FileListActionEvent.rename,
                resources: [resource],
                url: null,
                originalAction: null
            };
            document.dispatchEvent(new CustomEvent(FileListActionEvent.rename, { detail: detail }));
        })();
    }
    static replaceFile(table, uid, dataset) {
        const resource = FileListActionUtility.createResourceFromContextDataset(dataset);
        const actionUrl = dataset.actionUrl;
        top.TYPO3.Backend.ContentContainer.setUrl(actionUrl + '&target=' + encodeURIComponent(resource.identifier) + '&uid=' + encodeURIComponent(resource.uid) + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static editFile(table, uid, dataset) {
        const actionUrl = dataset.actionUrl;
        top.TYPO3.Backend.ContentContainer.setUrl(actionUrl + '&target=' + encodeURIComponent(uid) + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static editMetadata(table, uid, dataset) {
        const resource = FileListActionUtility.createResourceFromContextDataset(dataset);
        if (!resource.metaUid) {
            return;
        }
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl
            + '&edit[sys_file_metadata][' + resource.metaUid + ']=edit'
            + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static openInfoPopUp(table, uid) {
        if (table === 'sys_file_storage') {
            top.TYPO3.InfoWindow.showItem(table, uid);
        }
        else {
            // Files and folders
            top.TYPO3.InfoWindow.showItem('_FILE', uid);
        }
    }
    static uploadFile(table, uid, dataset) {
        const actionUrl = dataset.actionUrl;
        top.TYPO3.Backend.ContentContainer.setUrl(actionUrl + '&target=' + encodeURIComponent(uid) + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static createFolder(table, uid, dataset) {
        top.TYPO3.Backend.ContentContainer.get().document.dispatchEvent(new CustomEvent(fileListOpenElementBrowser, {
            detail: {
                actionUrl: dataset.actionUrl,
                identifier: dataset.identifier,
                mode: dataset.mode,
            }
        }));
    }
    static createFile(table, uid, dataset) {
        const actionUrl = dataset.actionUrl;
        top.TYPO3.Backend.ContentContainer.setUrl(actionUrl + '&target=' + encodeURIComponent(uid) + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static downloadFile(table, uid, dataset) {
        ContextMenuActions.triggerFileDownload(dataset.url, dataset.name);
    }
    static downloadFolder(table, uid, dataset) {
        // Add notification about the download being prepared
        Notification.info(lll('file_download.prepare'), '', 2);
        const actionUrl = dataset.actionUrl;
        (new AjaxRequest(actionUrl)).post({ items: [uid] })
            .then(async (response) => {
            let fileName = response.response.headers.get('Content-Disposition');
            if (!fileName) {
                const data = await response.resolve();
                if (data.success === false && data.status) {
                    Notification.warning(lll('file_download.' + data.status), lll('file_download.' + data.status + '.message'), 10);
                }
                else {
                    Notification.error(lll('file_download.error'));
                }
                return;
            }
            fileName = fileName.substring(fileName.indexOf(' filename=') + 10);
            const data = await response.raw().arrayBuffer();
            const blob = new Blob([data], { type: response.raw().headers.get('Content-Type') });
            ContextMenuActions.triggerFileDownload(URL.createObjectURL(blob), fileName, true);
        })
            .catch(() => {
            Notification.error(lll('file_download.error'));
        });
    }
    static createFilemount(table, uid) {
        if (uid.split(':').length !== 2) {
            return;
        }
        top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl
            + '&edit[sys_filemounts][0]=new'
            + '&defVals[sys_filemounts][identifier]=' + encodeURIComponent(uid)
            + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static deleteFile(table, uid, dataset) {
        const performDelete = () => {
            top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileCommit.moduleUrl
                + '&data[delete][0][data]=' + encodeURIComponent(uid)
                + '&data[delete][0][redirect]=' + ContextMenuActions.getReturnUrl());
        };
        if (!dataset.title) {
            performDelete();
            return;
        }
        const modal = Modal.confirm(dataset.title, dataset.message, SeverityEnum.warning, [
            {
                text: dataset.buttonCloseText || TYPO3.lang['button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
            },
            {
                text: dataset.buttonOkText || TYPO3.lang['button.delete'] || 'Delete',
                btnClass: 'btn-warning',
                name: 'delete',
            },
        ]);
        modal.addEventListener('button.clicked', (e) => {
            const element = e.target;
            if (element.name === 'delete') {
                performDelete();
            }
            modal.hideModal();
        });
    }
    static copyFile(table, uid) {
        const md5 = Md5.hash(uid);
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard;
        const queryArguments = {
            CB: {
                el: {
                    ['_FILE%7C' + md5]: uid
                },
                setCopyMode: '1'
            }
        };
        (new AjaxRequest(url)).withQueryArguments(queryArguments).get().finally(() => {
            top.TYPO3.Backend.ContentContainer.refresh();
        });
    }
    static copyReleaseFile(table, uid) {
        const md5 = Md5.hash(uid);
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard;
        const queryArguments = {
            CB: {
                el: {
                    ['_FILE%7C' + md5]: '0'
                },
                setCopyMode: '1'
            }
        };
        (new AjaxRequest(url)).withQueryArguments(queryArguments).get().finally(() => {
            top.TYPO3.Backend.ContentContainer.refresh();
        });
    }
    static cutFile(table, uid) {
        const md5 = Md5.hash(uid);
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard;
        const queryArguments = {
            CB: {
                el: {
                    ['_FILE%7C' + md5]: uid
                }
            }
        };
        (new AjaxRequest(url)).withQueryArguments(queryArguments).get().finally(() => {
            top.TYPO3.Backend.ContentContainer.refresh();
        });
    }
    static cutReleaseFile(table, uid) {
        const md5 = Md5.hash(uid);
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard;
        const queryArguments = {
            CB: {
                el: {
                    ['_FILE%7C' + md5]: '0'
                }
            }
        };
        (new AjaxRequest(url)).withQueryArguments(queryArguments).get().finally(() => {
            top.TYPO3.Backend.ContentContainer.refresh();
        });
    }
    static pasteFileInto(table, uid, dataset) {
        const performPaste = () => {
            top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.FileCommit.moduleUrl
                + '&CB[paste]=FILE|' + encodeURIComponent(uid)
                + '&CB[pad]=normal&redirect=' + ContextMenuActions.getReturnUrl());
        };
        if (!dataset.title) {
            performPaste();
            return;
        }
        const modal = Modal.confirm(dataset.title, dataset.message, SeverityEnum.warning, [
            {
                text: dataset.buttonCloseText || TYPO3.lang['button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
            },
            {
                text: dataset.buttonOkText || TYPO3.lang['button.ok'] || 'OK',
                btnClass: 'btn-warning',
                name: 'ok',
            },
        ]);
        modal.addEventListener('button.clicked', (e) => {
            const element = e.target;
            if (element.name === 'ok') {
                performPaste();
            }
            modal.hideModal();
        });
    }
    static updateOnlineMedia(table, uid, dataset) {
        if (!dataset.actionUrl || !dataset.filecontextUid || dataset.filecontextType !== 'file') {
            return;
        }
        const payload = {
            resource: {
                'type': dataset.filecontextType,
                'uid': dataset.filecontextUid
            }
        };
        (new AjaxRequest(dataset.actionUrl)).post(payload)
            .then(() => {
            Notification.success(lll('online_media.update.success'));
        })
            .catch(() => {
            Notification.error(lll('online_media.update.error'));
        })
            .finally(() => {
            window.location.reload();
        });
    }
}
export default ContextMenuActions;
