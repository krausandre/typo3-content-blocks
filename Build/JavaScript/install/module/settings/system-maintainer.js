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
import 'bootstrap';
import { AbstractInteractableModule } from '../abstract-interactable-module';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Router from '../../router';
import RegularEvent from '@typo3/core/event/regular-event';
var Identifiers;
(function (Identifiers) {
    Identifiers["writeTrigger"] = ".t3js-systemMaintainer-write";
    Identifiers["selectPureField"] = ".t3js-systemMaintainer-select-pure";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/system-maintainer
 */
class SystemMaintainer extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.loadModuleFrameAgnostic('select-pure').then(() => {
            this.getList();
        });
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.write();
        }).delegateTo(currentModal, Identifiers.writeTrigger);
    }
    getList() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('systemMaintainerGetList')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                Modal.setButtons(data.buttons);
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    write() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().dataset.systemMaintainerWriteToken;
        const selectedUsers = this.findInModal(Identifiers.selectPureField).values;
        (new AjaxRequest(Router.getUrl())).post({
            install: {
                users: selectedUsers,
                token: executeToken,
                action: 'systemMaintainerWrite',
            },
        }).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                if (Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        Notification.success(element.title, element.message);
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
}
export default new SystemMaintainer();
