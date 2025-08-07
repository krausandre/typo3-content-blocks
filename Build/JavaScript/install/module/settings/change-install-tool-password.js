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
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Router from '../../router';
import PasswordStrength from '../password-strength';
import { AbstractInteractableModule } from '../abstract-interactable-module';
import RegularEvent from '@typo3/core/event/regular-event';
var Identifiers;
(function (Identifiers) {
    Identifiers["changeButton"] = ".t3js-changeInstallToolPassword-change";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/change-install-tool-password
 */
class ChangeInstallToolPassword extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.getData();
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.change();
        }).delegateTo(currentModal, Identifiers.changeButton);
    }
    getData() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('changeInstallToolPasswordGetData')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                PasswordStrength.initialize(modalContent.querySelector('.t3-install-form-password-strength'));
                Modal.setButtons(data.buttons);
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    change() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().dataset.installToolToken;
        (new AjaxRequest(Router.getUrl())).post({
            install: {
                action: 'changeInstallToolPassword',
                token: executeToken,
                password: this.findInModal('.t3js-changeInstallToolPassword-password').value,
                passwordCheck: this.findInModal('.t3js-changeInstallToolPassword-password-check').value,
            },
        }).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    Notification.showMessage(element.title, element.message, element.severity);
                });
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        }).finally(() => {
            this.findInModal('.t3js-changeInstallToolPassword-password').value = '';
            this.findInModal('.t3js-changeInstallToolPassword-password-check').value = '';
            this.setModalButtonsState(true);
        });
    }
}
export default new ChangeInstallToolPassword();
