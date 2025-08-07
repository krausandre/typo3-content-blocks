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
import { InfoBox } from '../../renderable/info-box';
import Router from '../../router';
import RegularEvent from '@typo3/core/event/regular-event';
var Identifiers;
(function (Identifiers) {
    Identifiers["outputContainer"] = ".t3js-mailTest-output";
    Identifiers["mailTestButton"] = ".t3js-mailTest-execute";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/create-admin
 */
class MailTest extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.loadModuleFrameAgnostic('@typo3/install/renderable/info-box.js').then(() => {
            this.getData();
        });
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.send();
        }).delegateTo(currentModal, Identifiers.mailTestButton);
        new RegularEvent('submit', (event) => {
            event.preventDefault();
            this.send();
        }).delegateTo(currentModal, 'form');
    }
    getData() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('mailTestGetData')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                const outputContainer = this.findInModal(Identifiers.outputContainer);
                if (data.messages && Array.isArray(data.messages)) {
                    data.messages.forEach((element) => {
                        outputContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
                if (data.sendPossible) {
                    Modal.setButtons(data.buttons);
                }
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    send() {
        this.setModalButtonsState(false);
        const executeToken = this.getModuleContent().dataset.mailTestToken;
        const outputContainer = this.findInModal(Identifiers.outputContainer);
        this.renderProgressBar(outputContainer);
        (new AjaxRequest(Router.getUrl())).post({
            install: {
                action: 'mailTest',
                token: executeToken,
                email: this.findInModal('.t3js-mailTest-email').value,
            },
        }).then(async (response) => {
            const data = await response.resolve();
            outputContainer.innerHTML = '';
            if (Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    outputContainer.innerHTML = '';
                    outputContainer.append(InfoBox.create(element.severity, element.title, element.message));
                });
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, () => {
            // 500 can happen here if the mail configuration is broken
            Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
        }).finally(() => {
            this.setModalButtonsState(true);
        });
    }
}
export default new MailTest();
