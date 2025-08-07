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
import Severity from '../../renderable/severity';
import Router from '../../router';
import RegularEvent from '@typo3/core/event/regular-event';
var Identifiers;
(function (Identifiers) {
    Identifiers["outputContainer"] = ".t3js-folderStructure-output";
    Identifiers["errorContainer"] = ".t3js-folderStructure-errors";
    Identifiers["errorList"] = ".t3js-folderStructure-errors-list";
    Identifiers["errorFixTrigger"] = ".t3js-folderStructure-errors-fix";
    Identifiers["okContainer"] = ".t3js-folderStructure-ok";
    Identifiers["okList"] = ".t3js-folderStructure-ok-list";
    Identifiers["permissionContainer"] = ".t3js-folderStructure-permissions";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/folder-structure
 */
class FolderStructure extends AbstractInteractableModule {
    static removeLoadingMessage(container) {
        container.querySelector('typo3-backend-progress-bar').remove();
    }
    initialize(currentModal) {
        super.initialize(currentModal);
        this.loadModuleFrameAgnostic('@typo3/install/renderable/info-box.js').then(() => {
            // Get status on initialize to have the badge and content ready
            this.getStatus();
        });
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.fix();
        }).delegateTo(currentModal, Identifiers.errorFixTrigger);
    }
    getStatus() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('folderStructureGetStatus')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            modalContent.innerHTML = data.html;
            Modal.setButtons(data.buttons);
            if (data.success === true && Array.isArray(data.errorStatus)) {
                if (data.errorStatus.length > 0) {
                    modalContent.querySelector(Identifiers.errorContainer).style.display = 'block';
                    modalContent.querySelector(Identifiers.errorList).innerHTML = '';
                    data.errorStatus.forEach(((aElement) => {
                        modalContent.querySelector(Identifiers.errorList).appendChild(InfoBox.create(aElement.severity, aElement.title, aElement.message));
                    }));
                }
                else {
                    modalContent.querySelector(Identifiers.errorContainer).style.display = 'none';
                }
            }
            if (data.success === true && Array.isArray(data.okStatus)) {
                if (data.okStatus.length > 0) {
                    modalContent.querySelector(Identifiers.okContainer).style.display = 'block';
                    modalContent.querySelector(Identifiers.okList).innerHTML = '';
                    data.okStatus.forEach(((aElement) => {
                        modalContent.querySelector(Identifiers.okList).appendChild(InfoBox.create(aElement.severity, aElement.title, aElement.message));
                    }));
                }
                else {
                    modalContent.querySelector(Identifiers.okContainer).style.display = 'none';
                }
            }
            let element = data.folderStructureFilePermissionStatus;
            const selectorPermissionContainer = modalContent.querySelector(Identifiers.permissionContainer);
            selectorPermissionContainer.replaceChildren(InfoBox.create(element.severity, element.title, element.message));
            element = data.folderStructureDirectoryPermissionStatus;
            selectorPermissionContainer.appendChild(InfoBox.create(element.severity, element.title, element.message));
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    fix() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const outputContainer = this.findInModal(Identifiers.outputContainer);
        this.renderProgressBar(outputContainer);
        (new AjaxRequest(Router.getUrl('folderStructureFix')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            FolderStructure.removeLoadingMessage(outputContainer);
            if (data.success === true && Array.isArray(data.fixedStatus)) {
                if (data.fixedStatus.length > 0) {
                    data.fixedStatus.forEach((element) => {
                        outputContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
                else {
                    outputContainer.append(InfoBox.create(Severity.warning, 'Nothing fixed'));
                }
                this.getStatus();
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
export default new FolderStructure();
