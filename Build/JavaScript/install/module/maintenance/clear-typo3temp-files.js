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
import { AbstractInteractableModule } from '../abstract-interactable-module';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Router from '../../router';
import RegularEvent from '@typo3/core/event/regular-event';
var Identifiers;
(function (Identifiers) {
    Identifiers["deleteTrigger"] = ".t3js-clearTypo3temp-delete";
    Identifiers["statContainer"] = ".t3js-clearTypo3temp-stat-container";
    Identifiers["statsTrigger"] = ".t3js-clearTypo3temp-stats";
    Identifiers["statTemplate"] = "#t3js-clearTypo3temp-stat-template";
    Identifiers["statNumberOfFiles"] = ".t3js-clearTypo3temp-stat-numberOfFiles";
    Identifiers["statDirectory"] = ".t3js-clearTypo3temp-stat-directory";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/clear-typo3temp-files
 */
class ClearTypo3tempFiles extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.getStats();
        new RegularEvent('click', (event) => {
            event.preventDefault();
            currentModal.querySelector(Identifiers.statContainer).innerHTML = '';
            this.getStats();
        }).delegateTo(currentModal, Identifiers.statsTrigger);
        new RegularEvent('click', (event, trigger) => {
            event.preventDefault();
            const folder = trigger.dataset.folder;
            const storageUid = trigger.dataset.storageUid !== undefined ? parseInt(trigger.dataset.storageUid, 10) : undefined;
            this.delete(folder, storageUid);
        }).delegateTo(currentModal, Identifiers.deleteTrigger);
    }
    getStats() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('clearTypo3tempFilesStats')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                Modal.setButtons(data.buttons);
                if (Array.isArray(data.stats) && data.stats.length > 0) {
                    data.stats.forEach((element) => {
                        if (element.numberOfFiles > 0) {
                            const aStat = modalContent.querySelector(Identifiers.statTemplate).content.cloneNode(true);
                            aStat.querySelector(Identifiers.statNumberOfFiles).innerText = (element.numberOfFiles);
                            aStat.querySelector(Identifiers.statDirectory).innerText = (element.directory);
                            aStat.querySelector(Identifiers.deleteTrigger).setAttribute('data-folder', element.directory);
                            if (element.storageUid !== undefined) {
                                aStat.querySelector(Identifiers.deleteTrigger).setAttribute('data-storage-uid', element.storageUid);
                            }
                            modalContent.querySelector(Identifiers.statContainer).append(aStat);
                        }
                    });
                }
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        }).finally(() => {
            this.setModalButtonsState(true);
        });
    }
    delete(folder, storageUid) {
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().dataset.clearTypo3tempDeleteToken;
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                action: 'clearTypo3tempFiles',
                token: executeToken,
                folder: folder,
                storageUid: storageUid,
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    Notification.success(element.title, element.message);
                });
                this.getStats();
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
}
export default new ClearTypo3tempFiles();
