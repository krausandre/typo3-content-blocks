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
    Identifiers["clearTrigger"] = ".t3js-clearTables-clear";
    Identifiers["statsTrigger"] = ".t3js-clearTables-stats";
    Identifiers["statContainer"] = ".t3js-clearTables-stat-container";
    Identifiers["statTemplate"] = "#t3js-clearTables-stat-template";
    Identifiers["statDescription"] = ".t3js-clearTables-stat-description";
    Identifiers["statRows"] = ".t3js-clearTables-stat-rows";
    Identifiers["statName"] = ".t3js-clearTables-stat-name";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/clear-tables
 */
class ClearTables extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.getStats();
        new RegularEvent('click', (event) => {
            event.preventDefault();
            currentModal.querySelector(Identifiers.statContainer).innerHTML = '';
            this.getStats();
        }).delegateTo(currentModal, Identifiers.statsTrigger);
        new RegularEvent('click', (event, trigger) => {
            const table = trigger.closest(Identifiers.clearTrigger).dataset.table;
            event.preventDefault();
            this.clear(table);
        }).delegateTo(currentModal, Identifiers.clearTrigger);
    }
    getStats() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('clearTablesStats')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                Modal.setButtons(data.buttons);
                if (Array.isArray(data.stats) && data.stats.length > 0) {
                    data.stats.forEach((element) => {
                        if (element.rowCount > 0) {
                            const aStat = modalContent.querySelector(Identifiers.statTemplate).content.cloneNode(true);
                            aStat.querySelector(Identifiers.statDescription).innerText = element.description;
                            aStat.querySelector(Identifiers.statName).innerText = element.name;
                            aStat.querySelector(Identifiers.statRows).innerText = element.rowCount;
                            aStat.querySelector(Identifiers.clearTrigger).setAttribute('data-table', element.name);
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
    clear(table) {
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().dataset.clearTablesClearToken;
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                action: 'clearTablesClear',
                token: executeToken,
                table: table,
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    Notification.success(element.title, element.message);
                });
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
            this.getStats();
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
}
export default new ClearTables();
