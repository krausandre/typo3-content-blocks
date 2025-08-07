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
    Identifiers["activateTrigger"] = ".t3js-presets-activate";
    Identifiers["imageExecutable"] = ".t3js-presets-image-executable";
    Identifiers["imageExecutableTrigger"] = ".t3js-presets-image-executable-trigger";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/presets
 */
class Presets extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.getContent();
        // Load content with post data on click 'custom image executable path'
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.getCustomImagePathContent();
        }).delegateTo(currentModal, Identifiers.imageExecutableTrigger);
        // Write out selected preset
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.activate();
        }).delegateTo(currentModal, Identifiers.activateTrigger);
        // Automatically select the custom preset if a value in one of its input fields is changed
        currentModal.querySelectorAll('.t3js-custom-preset').forEach((element) => {
            new RegularEvent('input', (event, target) => {
                currentModal.querySelector(`#${target.dataset.radio}`).checked = true;
            }).delegateTo(element, '.t3js-custom-preset');
        });
    }
    getContent() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('presetsGetContent')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
                modalContent.innerHTML = data.html;
                Modal.setButtons(data.buttons);
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    getCustomImagePathContent() {
        const modalContent = this.getModalBody();
        const presetsContentToken = this.getModuleContent().dataset.presetsContentToken;
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                token: presetsContentToken,
                action: 'presetsGetContent',
                values: {
                    Image: {
                        additionalSearchPath: this.findInModal(Identifiers.imageExecutable).value,
                    },
                },
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
                modalContent.innerHTML = data.html;
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    activate() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().dataset.presetsActivateToken;
        const postData = {};
        const formData = new FormData(this.findInModal('form'));
        for (const [name, value] of formData) {
            postData[name] = value.toString();
        }
        postData['install[action]'] = 'presetsActivate';
        postData['install[token]'] = executeToken;
        (new AjaxRequest(Router.getUrl())).post(postData).then(async (response) => {
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
            this.setModalButtonsState(true);
        });
    }
}
export default new Presets();
