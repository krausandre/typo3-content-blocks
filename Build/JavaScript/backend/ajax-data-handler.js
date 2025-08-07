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
import { BroadcastMessage } from '@typo3/backend/broadcast-message';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import DocumentService from '@typo3/core/document-service';
import BroadcastService from '@typo3/backend/broadcast-service';
import Icons from './icons';
import Notification from './notification';
import RegularEvent from '@typo3/core/event/regular-event';
import { sudoModeInterceptor } from '@typo3/backend/security/sudo-mode-interceptor';
var Identifiers;
(function (Identifiers) {
    Identifiers["hide"] = "button[data-datahandler-action=\"visibility\"]";
    Identifiers["icon"] = ".t3js-icon";
})(Identifiers || (Identifiers = {}));
/**
 * Module: @typo3/backend/ajax-data-handler
 * Javascript functions to work with AJAX and interacting with Datahandler
 * through \TYPO3\CMS\Backend\Controller\SimpleDataHandlerController->processAjaxRequest (record_process route)
 */
class AjaxDataHandler {
    constructor() {
        DocumentService.ready().then(() => {
            this.initialize();
        });
    }
    /**
     * Refresh the page tree
     */
    static refreshPageTree() {
        top.document.dispatchEvent(new CustomEvent('typo3:pagetree:refresh'));
    }
    /**
     * AJAX call to record_process route (SimpleDataHandlerController->processAjaxRequest)
     * returns a jQuery Promise to work with
     *
     * @param {string | object} params
     * @returns {Promise<ResponseInterface>}
     */
    static call(params) {
        return (new AjaxRequest(TYPO3.settings.ajaxUrls.record_process))
            .addMiddleware(sudoModeInterceptor)
            .withQueryArguments(params)
            .get()
            .then(async (response) => {
            return await response.resolve();
        });
    }
    /**
     * Generic function to call from the outside the script and validate directly showing errors
     *
     * @param {string | object} parameters
     * @param {AfterProcessEventDict} eventDict Dictionary used as event detail. This is private API yet.
     * @returns {Promise<ResponseInterface>}
     */
    process(parameters, eventDict) {
        const promise = AjaxDataHandler.call(parameters);
        return promise.then((result) => {
            if (result.hasErrors) {
                this.handleErrors(result);
            }
            if (eventDict) {
                const payload = { ...eventDict, hasErrors: result.hasErrors };
                const message = new BroadcastMessage('datahandler', 'process', payload);
                BroadcastService.post(message);
                const event = new CustomEvent('typo3:datahandler:process', {
                    detail: {
                        payload: payload
                    }
                });
                document.dispatchEvent(event);
            }
            return result;
        });
    }
    // @todo: Many extensions rely on this behavior but it's misplaced in AjaxDataHandler. Move into recordlist.ts and deprecate in v11.
    initialize() {
        // HIDE/UNHIDE: click events for all action icons to hide/unhide
        new RegularEvent('click', (e, element) => {
            e.preventDefault();
            this.handleVisibilityToggle(element);
        }).delegateTo(document, Identifiers.hide);
    }
    handleVisibilityToggle(element) {
        const rowElement = element.closest('tr[data-uid]');
        // Show spinner
        const iconElement = element.querySelector(Identifiers.icon);
        this._showSpinnerIcon(iconElement);
        const isVisible = element.dataset.datahandlerStatus === 'visible';
        // Get Settings from element
        const settings = {
            table: element.dataset.datahandlerTable,
            uid: element.dataset.datahandlerUid,
            field: element.dataset.datahandlerField,
            visible: isVisible,
            overlayIcon: isVisible
                ? element.dataset.datahandlerRecordHiddenOverlayIcon ?? 'overlay-hidden'
                : element.dataset.datahandlerRecordVisibleOverlayIcon ?? null
        };
        const params = {
            data: {
                [settings.table]: {
                    [settings.uid]: {
                        [settings.field]: settings.visible
                            ? element.dataset.datahandlerHiddenValue
                            : element.dataset.datahandlerVisibleValue
                    }
                }
            }
        };
        // Submit Data
        this.process(params).then((result) => {
            if (!result.hasErrors) {
                // Inverse current state
                settings.visible = !(settings.visible);
                element.setAttribute('data-datahandler-status', settings.visible ? 'visible' : 'hidden');
                const elementLabel = settings.visible
                    ? element.dataset.datahandlerVisibleLabel
                    : element.dataset.datahandlerHiddenLabel;
                element.setAttribute('title', elementLabel);
                const elementIconIdentifier = settings.visible
                    ? element.dataset.datahandlerVisibleIcon
                    : element.dataset.datahandlerHiddenIcon;
                const iconElement = element.querySelector(Identifiers.icon);
                Icons.getIcon(elementIconIdentifier, Icons.sizes.small).then((icon) => {
                    iconElement.replaceWith(document.createRange().createContextualFragment(icon));
                });
                // Set overlay for the record icon
                const recordIcon = rowElement.querySelector('.col-icon ' + Identifiers.icon);
                recordIcon.querySelector('.icon-overlay')?.remove();
                Icons.getIcon('miscellaneous-placeholder', Icons.sizes.small, settings.overlayIcon).then((icon) => {
                    const iconFragment = document.createRange().createContextualFragment(icon);
                    recordIcon.append(iconFragment.querySelector('.icon-overlay'));
                });
                // Animate row
                const animationEvent = new RegularEvent('animationend', () => {
                    rowElement.classList.remove('record-pulse');
                    animationEvent.release();
                });
                animationEvent.bindTo(rowElement);
                rowElement.classList.add('record-pulse');
                // Refresh Pagetree
                if (settings.table === 'pages') {
                    AjaxDataHandler.refreshPageTree();
                }
            }
        });
    }
    /**
     * Handle the errors from result object
     *
     * @param {Object} result
     */
    handleErrors(result) {
        for (const message of result.messages) {
            Notification.error(message.title, message.message);
        }
    }
    /**
     * Replace the given icon with a spinner icon
     */
    _showSpinnerIcon(iconElement) {
        Icons.getIcon('spinner-circle', Icons.sizes.small).then((icon) => {
            iconElement.replaceWith(document.createRange().createContextualFragment(icon));
        });
    }
}
export default new AjaxDataHandler();
