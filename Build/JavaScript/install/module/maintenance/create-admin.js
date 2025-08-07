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
    Identifiers["adminCreateButton"] = ".t3js-createAdmin-create";
    Identifiers["adminUserInput"] = ".t3js-createAdmin-user";
    Identifiers["adminRealNameInput"] = ".t3js-createAdmin-realname";
    Identifiers["adminPasswordInput"] = ".t3js-createAdmin-password";
    Identifiers["adminPasswordCheckInput"] = ".t3js-createAdmin-password-check";
    Identifiers["adminEmailInput"] = ".t3js-createAdmin-email";
    Identifiers["adminSysMaintainterInput"] = ".t3js-createAdmin-system-maintainer";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/create-admin
 */
class CreateAdmin extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.getData();
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.create();
        }).delegateTo(currentModal, Identifiers.adminCreateButton);
    }
    getData() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('createAdminGetData')))
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
    create() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().dataset.createAdminToken;
        const payload = {
            install: {
                action: 'createAdmin',
                token: executeToken,
                userName: this.findInModal(Identifiers.adminUserInput).value,
                userPassword: this.findInModal(Identifiers.adminPasswordInput).value,
                userPasswordCheck: this.findInModal(Identifiers.adminPasswordCheckInput).value,
                userEmail: this.findInModal(Identifiers.adminEmailInput).value,
                realName: this.findInModal(Identifiers.adminRealNameInput).value,
                userSystemMaintainer: this.findInModal(Identifiers.adminSysMaintainterInput).checked ? 1 : 0,
            },
        };
        this.getModuleContent().querySelectorAll('input').forEach((input) => {
            input.disabled = true;
        });
        (new AjaxRequest(Router.getUrl())).post(payload).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    Notification.showMessage(element.title, element.message, element.severity);
                });
                if (data.userCreated) {
                    this.findInModal(Identifiers.adminUserInput).value = '';
                    this.findInModal(Identifiers.adminPasswordInput).value = '';
                    this.findInModal(Identifiers.adminPasswordCheckInput).value = '';
                    this.findInModal(Identifiers.adminEmailInput).value = '';
                    this.findInModal(Identifiers.adminSysMaintainterInput).checked = false;
                }
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        }).finally(() => {
            this.setModalButtonsState(true);
            this.getModuleContent().querySelectorAll('input').forEach((input) => {
                input.disabled = false;
            });
        });
    }
}
export default new CreateAdmin();
