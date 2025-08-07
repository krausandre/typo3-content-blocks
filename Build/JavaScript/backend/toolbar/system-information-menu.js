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
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import RegularEvent from '@typo3/core/event/regular-event';
import Icons from '../icons';
import PersistentStorage from '../storage/persistent';
import Viewport from '../viewport';
/**
 * Explicit selectors to avoid nesting queries
 */
var SystemInformationSelector;
(function (SystemInformationSelector) {
    SystemInformationSelector["element"] = "#typo3-cms-backend-backend-toolbaritems-systeminformationtoolbaritem";
    SystemInformationSelector["icon"] = "#typo3-cms-backend-backend-toolbaritems-systeminformationtoolbaritem .toolbar-item-icon .t3js-icon";
    SystemInformationSelector["menu"] = "#typo3-cms-backend-backend-toolbaritems-systeminformationtoolbaritem .dropdown-menu";
    SystemInformationSelector["data"] = "[data-systeminformation-data]";
    SystemInformationSelector["badge"] = "[data-systeminformation-badge]";
    SystemInformationSelector["message"] = "[data-systeminformation-message-module]";
    SystemInformationSelector["messageLink"] = "[data-systeminformation-message-module] a";
})(SystemInformationSelector || (SystemInformationSelector = {}));
/**
 * Module: @typo3/backend/toolbar/system-information-menu
 * System information menu handler
 */
class SystemInformationMenu {
    constructor() {
        this.timer = null;
        this.updateMenu = () => {
            const toolbarItemIcon = document.querySelector(SystemInformationSelector.icon);
            const currentIcon = toolbarItemIcon.cloneNode(true);
            if (this.timer !== null) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            Icons.getIcon('spinner-circle', Icons.sizes.small).then((spinner) => {
                toolbarItemIcon.replaceWith(document.createRange().createContextualFragment(spinner));
            });
            (new AjaxRequest(TYPO3.settings.ajaxUrls.systeminformation_render)).get().then(async (response) => {
                document.querySelector(SystemInformationSelector.menu).innerHTML = await response.resolve();
                SystemInformationMenu.updateBadge();
            }).finally(() => {
                document.querySelector(SystemInformationSelector.icon).replaceWith(currentIcon);
                // reload error data every five minutes
                this.timer = setTimeout(this.updateMenu, 1000 * 300);
            });
        };
        new RegularEvent('click', this.handleMessageLinkClick)
            .delegateTo(document, SystemInformationSelector.messageLink);
        Viewport.Topbar.Toolbar.registerEvent(this.updateMenu);
        //  triggred via BackendUtility::setUpdateSignal('updateSystemInformationMenu')
        document.addEventListener('typo3:system-information-menu:update', () => this.updateMenu());
    }
    static getData() {
        const element = document.querySelector(SystemInformationSelector.data);
        const data = element?.dataset;
        return {
            count: data?.systeminformationDataCount ? parseInt(data.systeminformationDataCount, 10) : 0,
            severityBadgeClass: data?.systeminformationDataSeveritybadgeclass ?? '',
        };
    }
    static getMessageDataFromElement(element) {
        const data = element.dataset;
        return {
            count: data.systeminformationMessageCount ? parseInt(data.systeminformationMessageCount, 10) : 0,
            status: data.systeminformationMessageStatus ?? '',
            module: data.systeminformationMessageModule ?? '',
            params: data.systeminformationMessageParams ?? '',
        };
    }
    static updateBadge() {
        const data = SystemInformationMenu.getData();
        const element = document.querySelector(SystemInformationSelector.badge);
        // ensure all default classes are available and previous
        // (at this time in processing unknown) class is removed
        element.removeAttribute('class');
        element.classList.add('toolbar-item-badge');
        element.classList.add('badge');
        element.classList.add('badge-pill');
        if (data.severityBadgeClass !== '') {
            element.classList.add(data.severityBadgeClass);
        }
        element.textContent = data.count.toString();
        element.classList.toggle('hidden', !(data.count > 0));
    }
    /**
     * Updates the UC and opens the linked module
     */
    handleMessageLinkClick(event, target) {
        const messageData = SystemInformationMenu.getMessageDataFromElement(target.closest(SystemInformationSelector.message));
        if (messageData.module === '') {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const moduleStorageObject = {};
        const timestamp = Math.floor(Date.now() / 1000);
        let storedSystemInformationSettings = {};
        if (PersistentStorage.isset('systeminformation')) {
            storedSystemInformationSettings = JSON.parse(PersistentStorage.get('systeminformation'));
        }
        moduleStorageObject[messageData.module] = { lastAccess: timestamp };
        Object.assign(storedSystemInformationSettings, moduleStorageObject);
        const ajax = PersistentStorage.set('systeminformation', JSON.stringify(storedSystemInformationSettings));
        ajax.then(() => {
            // finally, open the module now
            TYPO3.ModuleMenu.App.showModule(messageData.module, messageData.params);
            Viewport.Topbar.refresh();
        });
    }
}
export default new SystemInformationMenu();
