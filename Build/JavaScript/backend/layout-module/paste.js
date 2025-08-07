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
import DocumentService from '@typo3/core/document-service';
/**
 * Module: @typo3/backend/layout-module/paste
 * Dynamically adds "Paste" Icons in the Page Layout module (Web => Page)
 * and triggers a modal window. which then calls the AjaxDataHandler
 * to execute the action to paste the current clipboard contents.
 */
import DataHandler from '../ajax-data-handler';
import { default as Modal } from '@typo3/backend/modal';
import Severity from '../severity';
import '@typo3/backend/element/icon-element';
import { SeverityEnum } from '../enum/severity';
import RegularEvent from '@typo3/core/event/regular-event';
class Paste {
    /**
     * initializes paste icons for all content elements on the page
     */
    constructor(args) {
        this.itemOnClipboardUid = 0;
        this.itemOnClipboardTitle = '';
        this.copyMode = '';
        this.elementIdentifier = '.t3js-page-ce';
        this.pasteAfterLinkTemplate = '';
        this.pasteIntoLinkTemplate = '';
        this.itemOnClipboardUid = args.itemOnClipboardUid;
        this.itemOnClipboardTitle = args.itemOnClipboardTitle;
        this.copyMode = args.copyMode;
        DocumentService.ready().then(() => {
            if (document.querySelectorAll('.t3js-page-columns').length > 0) {
                this.generateButtonTemplates();
                this.activatePasteIcons();
                this.initializeEvents();
            }
        });
    }
    static determineColumn(element) {
        const columnContainer = element.closest('[data-colpos]');
        return parseInt(columnContainer?.dataset?.colpos ?? '0', 10);
    }
    initializeEvents() {
        new RegularEvent('click', (evt, target) => {
            evt.preventDefault();
            this.activatePasteModal(target);
        }).delegateTo(document, '.t3js-paste');
    }
    generateButtonTemplates() {
        if (!this.itemOnClipboardUid) {
            return;
        }
        this.pasteAfterLinkTemplate = '<button'
            + ' type="button"'
            + ' class="t3js-paste t3js-paste' + (this.copyMode ? '-' + this.copyMode : '') + ' t3js-paste-after btn btn-default btn-sm"'
            + ' title="' + TYPO3.lang?.pasteAfterRecord + '">'
            + '<typo3-backend-icon identifier="actions-document-paste-into" size="small"></typo3-backend-icon>'
            + '</button>';
        this.pasteIntoLinkTemplate = '<button'
            + ' type="button"'
            + ' class="t3js-paste t3js-paste' + (this.copyMode ? '-' + this.copyMode : '') + ' t3js-paste-into btn btn-default btn-sm"'
            + ' title="' + TYPO3.lang?.pasteIntoColumn + '">'
            + '<typo3-backend-icon identifier="actions-document-paste-into" size="small"></typo3-backend-icon>'
            + '</button>';
    }
    /**
     * activates the paste into / paste after icons outside the context menus
     */
    activatePasteIcons() {
        if (this.pasteAfterLinkTemplate && this.pasteIntoLinkTemplate) {
            document.querySelectorAll('.t3js-page-new-ce').forEach((el) => {
                const template = el.parentElement.dataset.page ? this.pasteIntoLinkTemplate : this.pasteAfterLinkTemplate;
                el.append(document.createRange().createContextualFragment(template));
            });
        }
    }
    /**
     * generates the paste into / paste after modal
     */
    activatePasteModal(element) {
        const title = (TYPO3.lang['paste.modal.title.paste'] || 'Paste record') + ': "' + this.itemOnClipboardTitle + '"';
        const content = TYPO3.lang['paste.modal.paste'] || 'Do you want to paste the record to this position?';
        let buttons = [];
        buttons = [
            {
                text: TYPO3.lang['paste.modal.button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                trigger: (e, modal) => modal.hideModal(),
            },
            {
                text: TYPO3.lang['paste.modal.button.paste'] || 'Paste',
                btnClass: 'btn-' + Severity.getCssClass(SeverityEnum.warning),
                trigger: (e, modal) => {
                    modal.hideModal();
                    this.execute(element);
                },
            },
        ];
        Modal.show(title, content, SeverityEnum.warning, buttons);
    }
    /**
     * Send an AJAX request via the AjaxDataHandler
     */
    execute(element) {
        const colPos = Paste.determineColumn(element);
        const closestElement = element.closest(this.elementIdentifier);
        const targetFound = closestElement.dataset.uid;
        let targetPid;
        if (typeof targetFound === 'undefined') {
            targetPid = parseInt(closestElement.dataset.page, 10);
        }
        else {
            targetPid = 0 - parseInt(targetFound, 10);
        }
        const language = parseInt(element.closest('[data-language-uid]').dataset.languageUid, 10);
        const parameters = {
            CB: {
                paste: 'tt_content|' + targetPid,
                pad: 'normal',
                update: {
                    colPos: colPos,
                    sys_language_uid: language,
                },
            },
        };
        DataHandler.process(parameters).then((result) => {
            if (!result.hasErrors) {
                window.location.reload();
            }
        });
    }
}
export default Paste;
