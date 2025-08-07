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
import DocumentService from '@typo3/core/document-service';
import Notification from '@typo3/backend/notification';
import InfoWindow from '@typo3/backend/info-window';
import { FileListActionEvent, FileListActionSelector, FileListActionUtility } from '@typo3/filelist/file-list-actions';
import NProgress from 'nprogress';
import Icons from '@typo3/backend/icons';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import RegularEvent from '@typo3/core/event/regular-event';
import { ModuleStateStorage } from '@typo3/backend/storage/module-state-storage';
import { default as Modal } from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import Severity from '@typo3/backend/severity';
import { MultiRecordSelectionSelectors } from '@typo3/backend/multi-record-selection';
import ContextMenu from '@typo3/backend/context-menu';
var Selectors;
(function (Selectors) {
    Selectors["fileListFormSelector"] = "form[name=\"fileListForm\"]";
    Selectors["commandSelector"] = "input[name=\"cmd\"]";
    Selectors["searchFieldSelector"] = "input[name=\"searchTerm\"]";
    Selectors["pointerFieldSelector"] = "input[name=\"pointer\"]";
})(Selectors || (Selectors = {}));
/**
 * @internal
 */
export const fileListOpenElementBrowser = 'typo3:filelist:openElementBrowser';
/**
 * Module: @typo3/filelist/filelist
 * @exports @typo3/filelist/filelist
 */
export default class Filelist {
    constructor() {
        this.downloadFilesAndFolders = (event) => {
            event.preventDefault();
            const target = event.target;
            const eventDetails = event.detail;
            const configuration = eventDetails.configuration;
            const filesAndFolders = [];
            eventDetails.checkboxes.forEach((checkbox) => {
                if (checkbox.checked) {
                    const element = checkbox.closest(FileListActionSelector.elementSelector);
                    const resource = FileListActionUtility.getResourceForElement(element);
                    filesAndFolders.unshift(resource);
                }
            });
            if (filesAndFolders.length) {
                this.triggerDownload(filesAndFolders, configuration.downloadUrl, target);
            }
            else {
                Notification.warning(lll('file_download.invalidSelection'));
            }
        };
        new RegularEvent(fileListOpenElementBrowser, (event) => {
            const url = new URL(event.detail.actionUrl, window.location.origin);
            url.searchParams.set('expandFolder', event.detail.identifier);
            url.searchParams.set('mode', event.detail.mode);
            const modal = Modal.advanced({
                type: Modal.types.iframe,
                content: url.toString(),
                size: Modal.sizes.large
            });
            modal.addEventListener('typo3-modal-hidden', () => {
                // @todo: this needs to be done when a folder was created. Apparently, backend user signals are not parsed in
                //        the modal's context. The best solution is probably to reload the "document space" via AJAX.
                top.list_frame.document.location.reload();
            });
        }).bindTo(document);
        // Filelist resource events
        new RegularEvent(FileListActionEvent.primary, (event) => {
            const detail = event.detail;
            const resource = detail.resources[0];
            const resourceElement = detail.trigger.closest('[data-default-language-access]');
            if (resource.type === 'file' && resourceElement !== null) {
                const formEngineUrl = new URL(top.TYPO3.settings.FormEngine.moduleUrl, window.location.origin);
                if (resource.metaUid > 0) {
                    formEngineUrl.searchParams.set('edit[sys_file_metadata][' + resource.metaUid + ']', 'edit');
                }
                else {
                    formEngineUrl.searchParams.set('edit[sys_file_metadata][0]', 'new');
                    formEngineUrl.searchParams.set('defVals[sys_file_metadata][file]', resource.uid.toString(10));
                }
                formEngineUrl.searchParams.set('returnUrl', Filelist.getReturnUrl(''));
                window.location.href = formEngineUrl.toString();
            }
            if (resource.type === 'folder') {
                const parameters = Filelist.parseQueryParameters(document.location);
                parameters.id = resource.identifier;
                const url = new URL(window.location.pathname, window.location.origin);
                for (const [key, value] of Object.entries(parameters)) {
                    url.searchParams.set(key, value);
                }
                window.location.href = url.toString();
            }
        }).bindTo(document);
        new RegularEvent(FileListActionEvent.primaryContextmenu, (event) => {
            const detail = event.detail;
            const resource = detail.resources[0];
            ContextMenu.show('sys_file', resource.identifier, '', '', '', detail.trigger, detail.event);
        }).bindTo(document);
        new RegularEvent(FileListActionEvent.show, (event) => {
            const detail = event.detail;
            const resource = detail.resources[0];
            Filelist.openInfoPopup('_' + resource.type.toUpperCase(), resource.identifier);
        }).bindTo(document);
        new RegularEvent(FileListActionEvent.download, (event) => {
            const detail = event.detail;
            const resource = detail.resources[0];
            this.triggerDownload([resource], detail.url, detail.trigger);
        }).bindTo(document);
        new RegularEvent(FileListActionEvent.updateOnlineMedia, (event) => {
            const detail = event.detail;
            const resource = detail.resources[0];
            this.updateOnlineMedia(resource, detail.url);
        }).bindTo(document);
        DocumentService.ready().then(() => {
            Filelist.processTriggers();
            new RegularEvent('click', (e, trigger) => {
                e.preventDefault();
                document.dispatchEvent(new CustomEvent(fileListOpenElementBrowser, {
                    detail: {
                        actionUrl: trigger.href,
                        identifier: trigger.dataset.identifier,
                        mode: trigger.dataset.mode,
                    }
                }));
            }).delegateTo(document, '.t3js-element-browser');
        });
        // Respond to multi record selection action events
        new RegularEvent('multiRecordSelection:action:edit', this.editFileMetadata).bindTo(document);
        new RegularEvent('multiRecordSelection:action:delete', this.deleteMultiple).bindTo(document);
        new RegularEvent('multiRecordSelection:action:download', this.downloadFilesAndFolders).bindTo(document);
        new RegularEvent('multiRecordSelection:action:copyMarked', (event) => {
            Filelist.submitClipboardFormWithCommand('copyMarked', event.target);
        }).bindTo(document);
        new RegularEvent('multiRecordSelection:action:removeMarked', (event) => {
            Filelist.submitClipboardFormWithCommand('removeMarked', event.target);
        }).bindTo(document);
        // Respond to browser related clearable event
        const activeSearch = document.querySelector([Selectors.fileListFormSelector, Selectors.searchFieldSelector].join(' '))?.value !== '';
        new RegularEvent('search', (event) => {
            const searchField = event.target;
            if (searchField.value === '' && activeSearch) {
                searchField.closest(Selectors.fileListFormSelector)?.submit();
            }
        }).delegateTo(document, Selectors.searchFieldSelector);
    }
    static submitClipboardFormWithCommand(cmd, target) {
        const fileListForm = target.closest(Selectors.fileListFormSelector);
        if (!fileListForm) {
            return;
        }
        const commandField = fileListForm.querySelector(Selectors.commandSelector);
        if (!commandField) {
            return;
        }
        commandField.value = cmd;
        // In case we just change elements on the clipboard, we try to fetch a possible pointer from the query
        // parameters, so after the form submit, we get to the same view as before. This is not done for delete
        // commands, since this may lead to empty sites, in case all elements from the current site are deleted.
        if (cmd === 'copyMarked' || cmd === 'removeMarked') {
            const pointerField = fileListForm.querySelector(Selectors.pointerFieldSelector);
            const pointerValue = Filelist.parseQueryParameters(document.location).pointer;
            if (pointerField && pointerValue) {
                pointerField.value = pointerValue;
            }
        }
        fileListForm.submit();
    }
    static openInfoPopup(type, identifier) {
        InfoWindow.showItem(type, identifier);
    }
    static processTriggers() {
        const mainElement = document.querySelector('.filelist-main');
        if (mainElement === null) {
            return;
        }
        // update ModuleStateStorage to the current folder identifier
        ModuleStateStorage.update('media', mainElement.dataset.filelistCurrentIdentifier);
    }
    static parseQueryParameters(location) {
        const searchParams = new URLSearchParams(location.search);
        return Object.fromEntries(searchParams.entries());
    }
    static getReturnUrl(returnUrl) {
        if (returnUrl === '') {
            const form = top.list_frame.document.forms.namedItem('fileListForm');
            if (form !== null) {
                returnUrl = form.action;
            }
            else {
                returnUrl = top.list_frame.document.location.pathname + top.list_frame.document.location.search;
            }
        }
        return returnUrl;
    }
    deleteMultiple(e) {
        e.preventDefault();
        const eventDetails = e.detail;
        const configuration = eventDetails.configuration;
        Modal.advanced({
            title: configuration.title || 'Delete',
            content: configuration.content || 'Are you sure you want to delete those files and folders?',
            severity: SeverityEnum.warning,
            buttons: [
                {
                    text: TYPO3.lang['button.close'] || 'Close',
                    active: true,
                    btnClass: 'btn-default',
                    trigger: (modalEvent, modal) => modal.hideModal(),
                },
                {
                    text: configuration.ok || TYPO3.lang['button.ok'] || 'OK',
                    btnClass: 'btn-' + Severity.getCssClass(SeverityEnum.warning),
                    trigger: (modalEvent, modal) => {
                        Filelist.submitClipboardFormWithCommand('delete', e.target);
                        modal.hideModal();
                    }
                }
            ]
        });
    }
    editFileMetadata(e) {
        e.preventDefault();
        const eventDetails = e.detail;
        const configuration = eventDetails.configuration;
        if (!configuration || !configuration.idField || !configuration.table) {
            return;
        }
        const list = [];
        eventDetails.checkboxes.forEach((checkbox) => {
            const checkboxContainer = checkbox.closest(MultiRecordSelectionSelectors.elementSelector);
            if (checkboxContainer !== null && checkboxContainer.dataset[configuration.idField]) {
                list.push(checkboxContainer.dataset[configuration.idField]);
            }
        });
        if (list.length) {
            const url = new URL(top.TYPO3.settings.FormEngine.moduleUrl, window.location.origin);
            url.searchParams.set('edit[' + configuration.table + '][' + list.join(',') + ']', 'edit');
            url.searchParams.set('returnUrl', Filelist.getReturnUrl(configuration.returnUrl || ''));
            const columnsOnly = configuration.columnsOnly || [];
            columnsOnly.forEach((column, i) => {
                url.searchParams.set('columnsOnly[' + configuration.table + '][' + i + ']', column);
            });
            window.location.href = url.toString();
        }
        else {
            Notification.warning('The selected elements can not be edited.');
        }
    }
    triggerDownload(items, downloadUrl, button) {
        if (items.length === 1) {
            const item = items.at(0);
            if (item.type === 'file') {
                // We deal with a single file in the selection, download directly
                this.invokeDownload(item.url, item.name);
                return;
            }
        }
        // Add notification about the download being prepared
        Notification.info(lll('file_download.prepare'), '', 2);
        // Store the targets' (button) content and replace with a spinner
        // icon, while the download is being prepared. Also disable the
        // button for this time to prevent the user from triggering it again.
        const targetContent = button?.innerHTML;
        if (button) {
            button.setAttribute('disabled', 'disabled');
            Icons.getIcon('spinner-circle', Icons.sizes.small).then((spinner) => {
                button.innerHTML = spinner;
            });
        }
        // Configure and start the progress bar, while preparing
        NProgress
            .configure({ parent: '#typo3-filelist', showSpinner: false })
            .start();
        const itemIdentifiers = items.map((resource) => resource.identifier);
        (new AjaxRequest(downloadUrl)).post({ items: itemIdentifiers })
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
            const downloadUrl = URL.createObjectURL(blob);
            this.invokeDownload(downloadUrl, fileName);
            // Add notification about successful preparation
            Notification.success(lll('file_download.success'), '', 2);
        })
            .catch(() => {
            Notification.error(lll('file_download.error'));
        })
            .finally(() => {
            // Remove progress bar and restore target (button)
            NProgress.done();
            if (button) {
                button.removeAttribute('disabled');
                button.innerHTML = targetContent;
            }
        });
    }
    updateOnlineMedia(resource, url) {
        if (!url || !resource.uid || resource.type !== 'file') {
            return;
        }
        NProgress.configure({ parent: '#typo3-filelist', showSpinner: false }).start();
        (new AjaxRequest(url)).post({ resource: resource })
            .then(() => {
            Notification.success(lll('online_media.update.success'));
        })
            .catch(() => {
            Notification.error(lll('online_media.update.error'));
        })
            .finally(() => {
            NProgress.done();
            window.location.reload();
        });
    }
    invokeDownload(downloadUrl, fileName) {
        const anchorTag = document.createElement('a');
        anchorTag.href = downloadUrl;
        anchorTag.download = fileName;
        document.body.appendChild(anchorTag);
        anchorTag.click();
        URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(anchorTag);
    }
}
