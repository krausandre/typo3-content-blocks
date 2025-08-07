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
import InfoWindow from '@typo3/backend/info-window';
import RegularEvent from '@typo3/core/event/regular-event';
import shortcutMenu from '@typo3/backend/toolbar/shortcut-menu';
import windowManager from '@typo3/backend/window-manager';
import moduleMenuApp from '@typo3/backend/module-menu';
import documentService from '@typo3/core/document-service';
import Utility from '@typo3/backend/utility';
/**
 * Module: @typo3/backend/action-dispatcher
 *
 * @example
 * <a class="btn btn-default" href="#"
 *  data-dispatch-action="TYPO3.InfoWindow.showItem"
 *  data-dispatch-args-list="tt_content,123"
 *  ...
 *  data-dispatch-args="[$quot;tt_content&quot;,123]"
 *  ...
 *  data-dispatch-disabled>
 */
class ActionDispatcher {
    constructor() {
        this.delegates = {};
        this.createDelegates();
        documentService.ready().then(() => this.registerEvents());
    }
    static resolveArguments(element) {
        if (element.dataset.dispatchArgs) {
            // `&quot;` is the only literal of a PHP `json_encode` that needs to be substituted
            // all other payload values are expected to be serialized to unicode literals
            const json = element.dataset.dispatchArgs.replace(/&quot;/g, '"');
            const args = JSON.parse(json);
            return args instanceof Array ? Utility.trimItems(args) : null;
        }
        else if (element.dataset.dispatchArgsList) {
            const args = element.dataset.dispatchArgsList.split(',');
            return Utility.trimItems(args);
        }
        return null;
    }
    createDelegates() {
        this.delegates = {
            'TYPO3.InfoWindow.showItem': InfoWindow.showItem.bind(null),
            'TYPO3.ShortcutMenu.createShortcut': shortcutMenu.createShortcut.bind(shortcutMenu),
            'TYPO3.WindowManager.localOpen': windowManager.localOpen.bind(windowManager),
            'TYPO3.ModuleMenu.showModule': moduleMenuApp.App.showModule.bind(moduleMenuApp.App),
        };
    }
    registerEvents() {
        new RegularEvent('click', this.handleClickEvent.bind(this))
            .delegateTo(document, '[data-dispatch-action]');
    }
    handleClickEvent(evt, target) {
        evt.preventDefault();
        this.delegateTo(evt, target);
    }
    delegateTo(evt, target) {
        const disabled = target.hasAttribute('data-dispatch-disabled');
        if (disabled) {
            return;
        }
        const action = target.dataset.dispatchAction;
        let args = ActionDispatcher.resolveArguments(target);
        if (args instanceof Array) {
            args = args.map((arg) => {
                switch (arg) {
                    case '{$target}':
                        return target;
                    case '{$event}':
                        return evt;
                    default:
                        return arg;
                }
            });
        }
        if (this.delegates[action]) {
            this.delegates[action].apply(null, args || []);
        }
    }
}
export default new ActionDispatcher();
