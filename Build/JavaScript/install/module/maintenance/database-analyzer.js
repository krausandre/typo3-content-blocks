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
import SecurityUtility from '@typo3/core/security-utility';
var Identifiers;
(function (Identifiers) {
    Identifiers["analyzeTrigger"] = ".t3js-databaseAnalyzer-analyze";
    Identifiers["executeTrigger"] = ".t3js-databaseAnalyzer-execute";
    Identifiers["outputContainer"] = ".t3js-databaseAnalyzer-output";
    Identifiers["notificationContainer"] = ".t3js-databaseAnalyzer-notification";
    Identifiers["suggestionBlock"] = "#t3js-databaseAnalyzer-suggestion-block";
    Identifiers["suggestionBlockCheckbox"] = ".t3js-databaseAnalyzer-suggestion-block-checkbox";
    Identifiers["suggestionBlockLegend"] = ".t3js-databaseAnalyzer-suggestion-block-legend";
    Identifiers["suggestionBlockLabel"] = ".t3js-databaseAnalyzer-suggestion-block-label";
    Identifiers["suggestionList"] = ".t3js-databaseAnalyzer-suggestion-list";
    Identifiers["suggestionLineTemplate"] = "#t3js-databaseAnalyzer-suggestion-line-template";
    Identifiers["suggestionLineCheckbox"] = ".t3js-databaseAnalyzer-suggestion-line-checkbox";
    Identifiers["suggestionLineLabel"] = ".t3js-databaseAnalyzer-suggestion-line-label";
    Identifiers["suggestionLineStatement"] = ".t3js-databaseAnalyzer-suggestion-line-statement";
    Identifiers["suggestionLineCurrent"] = ".t3js-databaseAnalyzer-suggestion-line-current";
    Identifiers["suggestionLineCurrentValue"] = ".t3js-databaseAnalyzer-suggestion-line-current-value";
    Identifiers["suggestionLineCount"] = ".t3js-databaseAnalyzer-suggestion-line-count";
    Identifiers["suggestionLineCountValue"] = ".t3js-databaseAnalyzer-suggestion-line-count-value";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/database-analyzer
 */
class DatabaseAnalyzer extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.loadModuleFrameAgnostic('@typo3/install/renderable/info-box.js').then(() => {
            this.getData();
        });
        // Select / deselect all checkboxes
        new RegularEvent('click', (event, element) => {
            element.closest('fieldset').querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                checkbox.checked = element.checked;
            });
        }).delegateTo(currentModal, Identifiers.suggestionBlockCheckbox);
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.clearNotifications();
            this.analyze();
        }).delegateTo(currentModal, Identifiers.analyzeTrigger);
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.clearNotifications();
            this.execute();
        }).delegateTo(currentModal, Identifiers.executeTrigger);
    }
    getData() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('databaseAnalyzer')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                Modal.setButtons(data.buttons);
                this.analyze();
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    analyze() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const outputContainer = modalContent.querySelector(Identifiers.outputContainer);
        const progressBar = this.renderProgressBar(outputContainer, {
            label: 'Analyzing current database schema...'
        });
        new RegularEvent('change', () => {
            const hasCheckedCheckboxes = outputContainer.querySelectorAll(':checked').length > 0;
            this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.executeTrigger), hasCheckedCheckboxes);
        }).delegateTo(outputContainer, 'input[type="checkbox"]');
        (new AjaxRequest(Router.getUrl('databaseAnalyzerAnalyze')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                if (Array.isArray(data.status)) {
                    progressBar.remove();
                    data.status.forEach((element) => {
                        outputContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
                if (Array.isArray(data.suggestions)) {
                    data.suggestions.forEach((element) => {
                        const aBlock = modalContent.querySelector(Identifiers.suggestionBlock).content.cloneNode(true);
                        const key = element.key;
                        aBlock.querySelector(Identifiers.suggestionBlockLegend).innerText = element.label;
                        aBlock.querySelector(Identifiers.suggestionBlockCheckbox).setAttribute('id', 't3-install-' + key + '-checkbox');
                        if (element.enabled) {
                            aBlock.querySelector(Identifiers.suggestionBlockCheckbox).setAttribute('checked', 'checked');
                        }
                        aBlock.querySelector(Identifiers.suggestionBlockLabel).setAttribute('for', 't3-install-' + key + '-checkbox');
                        element.children.forEach((line) => {
                            const aLine = modalContent.querySelector(Identifiers.suggestionLineTemplate).content.cloneNode(true);
                            const hash = line.hash;
                            const checkbox = aLine.querySelector(Identifiers.suggestionLineCheckbox);
                            checkbox.setAttribute('id', 't3-install-db-' + hash);
                            checkbox.setAttribute('data-hash', hash);
                            if (element.enabled) {
                                checkbox.setAttribute('checked', 'checked');
                            }
                            aLine.querySelector(Identifiers.suggestionLineLabel).setAttribute('for', 't3-install-db-' + hash);
                            aLine.querySelector(Identifiers.suggestionLineStatement).innerText = line.statement;
                            if (typeof line.current !== 'undefined') {
                                aLine.querySelector(Identifiers.suggestionLineCurrentValue).innerText = line.current;
                                aLine.querySelector(Identifiers.suggestionLineCurrent).style.display = 'inline';
                            }
                            if (typeof line.rowCount !== 'undefined') {
                                aLine.querySelector(Identifiers.suggestionLineCountValue).innerText = line.rowCount;
                                aLine.querySelector(Identifiers.suggestionLineCount).style.display = 'inline';
                            }
                            aBlock.querySelector(Identifiers.suggestionList).append(aLine);
                        });
                        outputContainer.append(aBlock);
                    });
                    this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.analyzeTrigger), true);
                    this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.executeTrigger), outputContainer.querySelectorAll(':checked').length > 0);
                }
                if (data.suggestions.length === 0 && data.status.length === 0) {
                    outputContainer.append(InfoBox.create(Severity.ok, 'Database schema is up to date. Good job!'));
                }
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
                this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.analyzeTrigger), true);
                this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.executeTrigger), false);
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
            this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.analyzeTrigger), true);
            this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.executeTrigger), false);
        });
    }
    execute() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().dataset.databaseAnalyzerExecuteToken;
        const outputContainer = modalContent.querySelector(Identifiers.outputContainer);
        const notificationContainer = modalContent.querySelector(Identifiers.notificationContainer);
        const selectedHashes = [];
        outputContainer.querySelectorAll('.t3js-databaseAnalyzer-suggestion-line input:checked').forEach((element) => {
            selectedHashes.push(element.dataset.hash);
        });
        this.renderProgressBar(outputContainer, {
            label: 'Executing database updates...'
        });
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                action: 'databaseAnalyzerExecute',
                token: executeToken,
                hashes: selectedHashes,
            },
        }).then(async (response) => {
            const data = await response.resolve();
            if (Array.isArray(data.status)) {
                let groupedErrors = '';
                data.status.forEach((element) => {
                    if (element.severity === Severity.error) {
                        const securityUtility = new SecurityUtility();
                        groupedErrors += '<li>' + securityUtility.encodeHtml(element.message) + '</li>';
                    }
                    else {
                        Notification.showMessage(element.title, element.message, element.severity);
                    }
                });
                if (groupedErrors !== '') {
                    notificationContainer.innerHTML = `<div class="alert alert-danger">
                <div class="alert-inner">
                  <div class="alert-icon">
                      <span class="icon-emphasized">
                          <typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon>
                      </span>
                  </div>
                  <div class="alert-content">
                      <div class="alert-title">Database update failed</div>
                      <div class="alert-message">
                        <ul>${groupedErrors}</ul>
                      </div>
                  </div>
                </div>
              </div>`;
                }
            }
            this.analyze();
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        }).finally(() => {
            this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.analyzeTrigger), true);
            this.setModalButtonState(this.getModalFooter().querySelector(Identifiers.executeTrigger), false);
        });
    }
    clearNotifications() {
        this.currentModal.querySelector(Identifiers.notificationContainer).replaceChildren('');
    }
}
export default new DatabaseAnalyzer();
