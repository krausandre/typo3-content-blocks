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
import { SeverityEnum } from './enum/severity';
import AjaxDataHandler from './ajax-data-handler';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import InfoWindow from './info-window';
import Modal from './modal';
import ModuleMenu from './module-menu';
import Notification from '@typo3/backend/notification';
import Viewport from './viewport';
import '@typo3/backend/new-record-wizard';
import Utility from '@typo3/backend/utility';
/**
 * @exports @typo3/backend/context-menu-actions
 */
class ContextMenuActions {
    /**
     * @returns {string}
     */
    static getReturnUrl() {
        return encodeURIComponent(top.list_frame.document.location.pathname + top.list_frame.document.location.search);
    }
    static editRecord(table, uid, dataset) {
        const pageLanguageId = dataset.pagesLanguageUid;
        let overrideVals = '';
        if (pageLanguageId) {
            // Disallow manual adjustment of the language field for pages
            overrideVals = '&overrideVals[pages][sys_language_uid]=' + pageLanguageId;
        }
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl
            + '&edit[' + table + '][' + uid + ']=edit'
            + overrideVals
            + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static viewRecord(table, uid, dataset) {
        const viewUrl = dataset.previewUrl;
        if (viewUrl) {
            const previewWin = window.open(viewUrl, 'newTYPO3frontendWindow');
            previewWin.focus();
            if (Utility.urlsPointToSameServerSideResource(previewWin.location.href, viewUrl)) {
                previewWin.location.reload();
            }
        }
    }
    static openInfoPopUp(table, uid) {
        InfoWindow.showItem(table, uid);
    }
    static mountAsTreeRoot(table, uid) {
        if (table === 'pages') {
            const event = new CustomEvent('typo3:pagetree:mountPoint', {
                detail: {
                    pageId: uid
                },
            });
            top.document.dispatchEvent(event);
        }
    }
    static newPageWizard(table, uid, dataset) {
        const moduleUrl = dataset.pagesNewWizardUrl;
        Viewport.ContentContainer.setUrl(moduleUrl + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static newContentWizard(table, uid, dataset) {
        let wizardUrl = dataset.newWizardUrl;
        if (wizardUrl) {
            wizardUrl += '&returnUrl=' + ContextMenuActions.getReturnUrl();
            Modal.advanced({
                title: dataset.title,
                type: Modal.types.ajax,
                size: Modal.sizes.large,
                content: wizardUrl,
                severity: SeverityEnum.notice,
            });
        }
    }
    /**
     * Create new records on the same level. Pages are being inserted "inside".
     */
    static newRecord(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.FormEngine.moduleUrl + '&edit[' + table + '][' + (table !== 'pages' ? '-' : '') + uid + ']=new&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static openHistoryPopUp(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordHistory.moduleUrl + '&element=' + table + ':' + uid + '&returnUrl=' + ContextMenuActions.getReturnUrl());
    }
    static openListModule(table, uid, dataset) {
        const pageId = table === 'pages' ? uid : dataset.pageUid;
        ModuleMenu.App.showModule('web_list', 'id=' + pageId);
    }
    static pagesSort(table, uid, dataset) {
        const pagesSortUrl = dataset.pagesSortUrl;
        if (pagesSortUrl) {
            Viewport.ContentContainer.setUrl(pagesSortUrl);
        }
    }
    static pagesNewMultiple(table, uid, dataset) {
        const pagesSortUrl = dataset.pagesNewMultipleUrl;
        if (pagesSortUrl) {
            Viewport.ContentContainer.setUrl(pagesSortUrl);
        }
    }
    static disableRecord(table, uid, dataset) {
        const disableFieldName = dataset.disableField || 'hidden';
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl
            + '&data[' + table + '][' + uid + '][' + disableFieldName + ']=1'
            + '&redirect=' + ContextMenuActions.getReturnUrl());
    }
    static enableRecord(table, uid, dataset) {
        const disableFieldName = dataset.disableField || 'hidden';
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl
            + '&data[' + table + '][' + uid + '][' + disableFieldName + ']=0'
            + '&redirect=' + ContextMenuActions.getReturnUrl());
    }
    static showInMenus(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl
            + '&data[' + table + '][' + uid + '][nav_hide]=0'
            + '&redirect=' + ContextMenuActions.getReturnUrl());
    }
    static hideInMenus(table, uid) {
        Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl
            + '&data[' + table + '][' + uid + '][nav_hide]=1'
            + '&redirect=' + ContextMenuActions.getReturnUrl());
    }
    static deleteRecord(table, uid, dataset) {
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
            if (e.target.getAttribute('name') === 'delete') {
                const eventData = { component: 'contextmenu', action: 'delete', table, uid };
                AjaxDataHandler.process('cmd[' + table + '][' + uid + '][delete]=1', eventData).then(() => {
                    if (table === 'pages') {
                        ContextMenuActions.refreshPageTree();
                    }
                    ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href);
                });
            }
            modal.hideModal();
        });
    }
    static copy(table, uid) {
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard
            + '&CB[el][' + table + '%7C' + uid + ']=1'
            + '&CB[setCopyMode]=1';
        (new AjaxRequest(url)).get().finally(() => {
            ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href);
        });
    }
    static clipboardRelease(table, uid) {
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard
            + '&CB[el][' + table + '%7C' + uid + ']=0';
        (new AjaxRequest(url)).get().finally(() => {
            ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href);
        });
    }
    static cut(table, uid) {
        const url = TYPO3.settings.ajaxUrls.contextmenu_clipboard
            + '&CB[el][' + table + '%7C' + uid + ']=1'
            + '&CB[setCopyMode]=0';
        (new AjaxRequest(url)).get().finally(() => {
            ContextMenuActions.triggerRefresh(Viewport.ContentContainer.get().location.href);
        });
    }
    static triggerRefresh(iframeUrl) {
        if (!iframeUrl.includes('record%2Fedit')) {
            Viewport.ContentContainer.refresh();
        }
    }
    /**
     * Clear cache for given page uid
     */
    static clearCache(table, uid) {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.web_list_clearpagecache)).withQueryArguments({ id: uid }).get({ cache: 'no-cache' }).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                Notification.success(data.title, data.message, 1);
            }
            else {
                Notification.error(data.title, data.message, 1);
            }
        }, () => {
            Notification.error('Clearing page caches went wrong on the server side.');
        });
    }
    /**
     * Paste db record after another
     *
     * @param {string} table any db table except sys_file
     * @param {number} uid uid of the record after which record from the clipboard will be pasted
     * @param {DOMStringMap} dataset The data attributes of the invoked menu item
     */
    static pasteAfter(table, uid, dataset) {
        ContextMenuActions.pasteInto(table, -uid, dataset);
    }
    /**
     * Paste page into another page
     *
     * @param {string} table any db table except sys_file
     * @param {number} uid uid of the record after which record from the clipboard will be pasted
     * @param {DOMStringMap} dataset The data attributes of the invoked menu item
     */
    static pasteInto(table, uid, dataset) {
        const performPaste = () => {
            const url = '&CB[paste]=' + table + '%7C' + uid
                + '&CB[pad]=normal'
                + '&redirect=' + ContextMenuActions.getReturnUrl();
            Viewport.ContentContainer.setUrl(top.TYPO3.settings.RecordCommit.moduleUrl + url);
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
            if (e.target.getAttribute('name') === 'ok') {
                performPaste();
            }
            modal.hideModal();
        });
    }
    static refreshPageTree() {
        top.document.dispatchEvent(new CustomEvent('typo3:pagetree:refresh'));
    }
}
export default ContextMenuActions;
