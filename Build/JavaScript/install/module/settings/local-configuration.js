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
import { Collapse } from 'bootstrap';
import '../../renderable/clearable';
import { AbstractInteractableModule } from '../abstract-interactable-module';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Router from '../../router';
import RegularEvent from '@typo3/core/event/regular-event';
import { KeyTypesEnum } from '@typo3/backend/enum/key-types';
var Identifiers;
(function (Identifiers) {
    Identifiers["item"] = ".t3js-localConfiguration-item";
    Identifiers["toggleAllTrigger"] = ".t3js-localConfiguration-toggleAll";
    Identifiers["writeTrigger"] = ".t3js-localConfiguration-write";
    Identifiers["searchTrigger"] = ".t3js-localConfiguration-search";
    Identifiers["cloneRowTrigger"] = ".t3js-localConfiguration-cloneRow";
    Identifiers["removeRowTrigger"] = ".t3js-localConfiguration-removeRow";
    Identifiers["arrayRowTrigger"] = ".t3js-localConfiguration-array-clone";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/install/module/local-configuration
 */
class LocalConfiguration extends AbstractInteractableModule {
    initialize(currentModal) {
        super.initialize(currentModal);
        this.getContent();
        // Write out new settings
        new RegularEvent('click', (event) => {
            event.preventDefault();
            this.write();
        }).delegateTo(currentModal, Identifiers.writeTrigger);
        // Expand / collapse "Toggle all" button
        new RegularEvent('click', () => {
            const modalContent = this.getModalBody();
            const panels = modalContent.querySelectorAll('.panel-collapse');
            panels.forEach((panel) => {
                const action = panels[0].classList.contains('show') ? 'hide' : 'show';
                Collapse.getOrCreateInstance(panel)[action]();
            });
        }).delegateTo(currentModal, Identifiers.toggleAllTrigger);
        // Focus search field on certain user interactions
        new RegularEvent('keydown', (event) => {
            const searchInput = currentModal.querySelector(Identifiers.searchTrigger);
            if (event.ctrlKey || event.metaKey) {
                // Focus search field on ctrl-f
                if (event.key === 'f' || event.key === 'F') {
                    event.preventDefault();
                    searchInput.focus();
                }
            }
            else if (event.key === KeyTypesEnum.ESCAPE) {
                // Clear search on ESC key
                event.preventDefault();
                searchInput.value = '';
                searchInput.focus();
            }
        }).bindTo(currentModal);
        // Perform expand collapse on search matches
        new RegularEvent('input', (event, target) => {
            const typedQuery = target.value;
            this.search(typedQuery);
        }).delegateTo(currentModal, Identifiers.searchTrigger);
        new RegularEvent('change', (event, target) => {
            const typedQuery = target.value;
            this.search(typedQuery);
        }).delegateTo(currentModal, Identifiers.searchTrigger);
        // Remove a cloned row
        new RegularEvent('click', (event, target) => {
            event.preventDefault();
            const row = target.closest(Identifiers.arrayRowTrigger);
            if (row) {
                row.parentNode?.removeChild(row);
            }
        }).delegateTo(currentModal, Identifiers.removeRowTrigger);
        // Add a fresh clone row
        new RegularEvent('click', (event, target) => {
            event.preventDefault();
            const row = target.closest(Identifiers.arrayRowTrigger);
            if (!row) {
                return;
            }
            // Get input values from the original row
            const inputs = Array.from(row.querySelectorAll('input'));
            let arrayKey;
            let arrayValue;
            if (row.dataset.valuetype === 'map') {
                arrayKey = inputs[0].value.trim();
                arrayValue = inputs[1].value.trim();
            }
            else if (row.dataset.valuetype === 'element-list') {
                arrayValue = inputs[0].value.trim();
                arrayKey = 'empty';
            }
            else {
                return;
            }
            // Skip if map is lacking key/value, or element-list is lacking value
            if (!arrayKey || !arrayValue) {
                row.style.animation = 'record-pulse 0.5s ease-in-out 5';
                setTimeout(() => {
                    row.style.animation = '';
                }, 2500);
                return;
            }
            // Insert the cloned row before the template row
            const clonedRow = row.cloneNode(true);
            row.parentNode?.insertBefore(clonedRow, row);
            // Clear input values in the template row (original row)
            inputs.forEach(input => {
                input.value = '';
            });
            // Replace clone button with remove button
            const buttonCell = clonedRow.querySelector(Identifiers.cloneRowTrigger);
            if (buttonCell) {
                buttonCell.classList.add('d-none');
                clonedRow.querySelector(Identifiers.removeRowTrigger)?.classList.remove('d-none');
            }
        }).delegateTo(currentModal, Identifiers.cloneRowTrigger);
    }
    search(typedQuery) {
        this.currentModal.querySelectorAll(Identifiers.item).forEach((element) => {
            if (element.textContent.toLowerCase().trim().includes(typedQuery.toLowerCase())) {
                element.classList.remove('hidden');
                element.classList.add('searchhit');
            }
            else {
                element.classList.remove('searchhit');
                element.classList.add('hidden');
            }
        });
        this.currentModal.querySelectorAll('.searchhit').forEach((resultElement) => {
            const collapseElement = resultElement.closest('.panel-collapse');
            Collapse.getOrCreateInstance(collapseElement).show();
        });
    }
    getContent() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('localConfigurationGetContent')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                Modal.setButtons(data.buttons);
                this.searchInput = modalContent.querySelector((Identifiers.searchTrigger));
                this.searchInput.clearable();
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    write() {
        this.setModalButtonsState(false);
        const modalContent = this.getModalBody();
        const executeToken = this.getModuleContent().dataset.localConfigurationWriteToken;
        const configurationValues = {};
        const collectedArrayKeys = {};
        const collectedArrayValues = {};
        this.currentModal.querySelectorAll('.t3js-localConfiguration-pathValue').forEach((element) => {
            if (element.type === 'checkbox') {
                if (element.checked) {
                    configurationValues[element.dataset.path] = '1';
                }
                else {
                    configurationValues[element.dataset.path] = '0';
                }
            }
            else {
                if (element.dataset.valuetype === 'map' || element.dataset.valuetype === 'element-list') {
                    // Special type "data-valuetype='map|element-list'" found.
                    // "map": has 'speaking' key and a value
                    // "element-list": only the value counts, the key is just a running numerical index
                    // Note that "array" is a regular input string value that is later exploded and NOT part
                    // of this code fork. The type "list" is a string-only listing NOT getting exploded.
                    // We want to convert these pairs:
                    // <input type="text" name="/GFX/someKey/key[]" value="myKey">
                    // <input type="text" name="/GFX/someKey/value[]" value="myValue">
                    // <input type="text" name="/GFX/someKey/key[]" value="anotherKey">
                    // <input type="text" name="/GFX/someKey/value[]" value="anotherValue">
                    // into:
                    // configurationValues[GFX/someKey][myKey] = myValue
                    // configurationValues[GFX/someKey][anotherKey] = anotherValue
                    // This is done with a temporary helper structure of collectedArrayKeys+collectedArrayValues,
                    // indexed by their main key ("GFX/someKey") so they can later be easily piped into it as JavaScript array.
                    // The "value[]" portion is always required (for map+list), but "key[]" can be optional (only needed for map)
                    if (element.dataset.path.includes('/key[]') && element.value !== '') {
                        const itemArrayPath = element.dataset.path.replace('/key[]', '');
                        if (collectedArrayKeys[itemArrayPath] === undefined) {
                            collectedArrayKeys[itemArrayPath] = [];
                        }
                        collectedArrayKeys[itemArrayPath].push(element.value);
                    }
                    else if (element.dataset.path.includes('/value[]') && element.value !== '') {
                        const itemArrayPath = element.dataset.path.replace('/value[]', '');
                        if (collectedArrayValues[itemArrayPath] === undefined) {
                            collectedArrayValues[itemArrayPath] = [];
                        }
                        collectedArrayValues[itemArrayPath].push(element.value);
                    }
                }
                else {
                    // Regular input string values.
                    configurationValues[element.dataset.path] = element.value;
                }
            }
        });
        // Now iterate the collectedArrayValues and collectedArrayKeys (map needs key+value, list only values).
        for (const itemArrayPath in collectedArrayValues) {
            if (Object.prototype.hasOwnProperty.call(collectedArrayValues, itemArrayPath)) {
                // Create a properly typed object for the collection
                if (configurationValues[itemArrayPath] === undefined) {
                    configurationValues[itemArrayPath] = {};
                }
                // Ensure configurationValues[itemArrayPath] is treated as a Record.
                // Record keys are sorted, and configuration values are also persisted with sorting.
                const configObject = configurationValues[itemArrayPath];
                // Iterate by index, not by keys array values
                collectedArrayValues[itemArrayPath].forEach((arrayValue, index) => {
                    // Ensure we really have that paired collectedArrayValues[] value corresponding to the same key for maps.
                    // Empty key+value pairs are skipped (removed from config).
                    // Also, element-list is evaluated for the cases collectedArrayKeys is not set.
                    if (arrayValue === '') {
                        return;
                    }
                    if (collectedArrayKeys[itemArrayPath]
                        && collectedArrayKeys[itemArrayPath][index] !== undefined
                        && collectedArrayKeys[itemArrayPath][index] !== '') {
                        // Case "map"
                        // Now populate configurationValues[itemArrayPath][myKey] = myValue
                        const arrayKey = collectedArrayKeys[itemArrayPath][index];
                        configObject[arrayKey] = arrayValue;
                    }
                    else {
                        // Case "list"
                        // Now populate configurationValues[itemArrayPath][numericalKey] = myValue
                        configObject[index] = arrayValue;
                    }
                });
            }
        }
        (new AjaxRequest(Router.getUrl())).post({
            install: {
                action: 'localConfigurationWrite',
                token: executeToken,
                configurationValues: configurationValues,
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
            this.setModalButtonsState(true);
        });
    }
}
export default new LocalConfiguration();
