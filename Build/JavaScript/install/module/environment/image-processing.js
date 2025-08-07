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
    Identifiers["executeTrigger"] = ".t3js-imageProcessing-execute";
    Identifiers["testContainer"] = ".t3js-imageProcessing-twinContainer";
    Identifiers["twinImageTemplate"] = "#t3js-imageProcessing-twinImage-template";
    Identifiers["commandContainer"] = ".t3js-imageProcessing-command";
    Identifiers["commandText"] = ".t3js-imageProcessing-command-text";
    Identifiers["twinImages"] = ".t3js-imageProcessing-images";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/image-processing
 */
class ImageProcessing extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.loadModuleFrameAgnostic('@typo3/install/renderable/info-box.js').then(() => {
            this.getData();
        });
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.runTests();
        }).delegateTo(currentModal, Identifiers.executeTrigger);
    }
    getData() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('imageProcessingGetData')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                Modal.setButtons(data.buttons);
                this.runTests();
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    runTests() {
        const modalContent = this.getModalBody();
        this.setModalButtonsState(false);
        const twinImageTemplate = this.findInModal(Identifiers.twinImageTemplate);
        const promises = [];
        modalContent.querySelectorAll(Identifiers.testContainer).forEach((container) => {
            container.replaceChildren(InfoBox.create(Severity.loading, 'Loading...'));
            const request = (new AjaxRequest(Router.getUrl(container.dataset.test)))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    container.innerHTML = '';
                    if (Array.isArray(data.status)) {
                        data.status.forEach((element) => {
                            container.append(InfoBox.create(element.severity, element.title, element.message));
                        });
                    }
                    const aTwin = twinImageTemplate.content.cloneNode(true);
                    if (data.fileExists === true) {
                        aTwin.querySelector('img.reference')?.setAttribute('src', data.referenceFile);
                        aTwin.querySelector('img.result')?.setAttribute('src', data.outputFile);
                        aTwin.querySelectorAll(Identifiers.twinImages).forEach((image) => image.hidden = false);
                    }
                    if (Array.isArray(data.command) && data.command.length > 0) {
                        const commandContainer = aTwin.querySelector(Identifiers.commandContainer);
                        if (commandContainer !== null) {
                            commandContainer.hidden = false;
                        }
                        const commandText = [];
                        data.command.forEach((aElement) => {
                            commandText.push('<strong>Command:</strong>\n' + aElement[1]);
                            if (aElement.length === 3) {
                                commandText.push('<strong>Result:</strong>\n' + aElement[2]);
                            }
                        });
                        const commandTextElement = aTwin.querySelector(Identifiers.commandText);
                        if (commandTextElement !== null) {
                            commandTextElement.innerHTML = commandText.join('\n');
                        }
                    }
                    container.append(aTwin);
                }
            }, (error) => {
                Router.handleAjaxError(error, modalContent);
            });
            promises.push(request);
        });
        Promise.all(promises).then(() => {
            this.setModalButtonsState(true);
        });
    }
}
export default new ImageProcessing();
