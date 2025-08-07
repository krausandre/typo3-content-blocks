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
import { InfoBox } from '../../renderable/info-box';
import Severity from '../../renderable/severity';
import Router from '../../router';
import RegularEvent from '@typo3/core/event/regular-event';
var Identifiers;
(function (Identifiers) {
    Identifiers["checkTrigger"] = ".t3js-tcaExtTablesCheck-check";
    Identifiers["outputContainer"] = ".t3js-tcaExtTablesCheck-output";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/tca-ext-tables-check
 */
class TcaExtTablesCheck extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.loadModuleFrameAgnostic('@typo3/install/renderable/info-box.js').then(() => {
            this.check();
        });
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.check();
        }).delegateTo(currentModal, Identifiers.checkTrigger);
    }
    check() {
        this.setModalButtonsState(false);
        const outputContainer = document.querySelector(Identifiers.outputContainer);
        if (outputContainer !== null) {
            this.renderProgressBar(outputContainer, {}, 'append');
        }
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('tcaExtTablesCheck')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            modalContent.innerHTML = data.html;
            Modal.setButtons(data.buttons);
            if (data.success === true && Array.isArray(data.status)) {
                if (data.status.length > 0) {
                    modalContent.querySelector(Identifiers.outputContainer).append(InfoBox.create(Severity.warning, 'Following extensions change TCA in ext_tables.php', 'Check ext_tables.php files, look for ExtensionManagementUtility calls and $GLOBALS[\'TCA\'] modifications'));
                    data.status.forEach((element) => {
                        modalContent.querySelector(Identifiers.outputContainer).append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
                else {
                    modalContent.querySelector(Identifiers.outputContainer).append(InfoBox.create(Severity.ok, 'No TCA changes in ext_tables.php files. Good job!'));
                }
            }
            else {
                Notification.error('Something went wrong', 'Please use the module "Check for broken extensions" to find a possible extension causing this issue.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        }).finally(() => {
            this.setModalButtonsState(true);
        });
    }
}
export default new TcaExtTablesCheck();
