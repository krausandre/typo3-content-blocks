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
import RegularEvent from '@typo3/core/event/regular-event';
import DocumentService from '@typo3/core/document-service';
import AjaxDataHandler from '@typo3/backend/ajax-data-handler';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import ImmediateAction from '@typo3/backend/action-button/immediate-action';
import { lll } from '@typo3/core/lit-helper';
import Viewport from '@typo3/backend/viewport';
export class MoveContentElement {
    constructor() {
        this.initialize();
    }
    async initialize() {
        await DocumentService.ready();
        this.registerEvents(document.querySelector('.element-browser-body'));
    }
    registerEvents(container) {
        new RegularEvent('change', async (e) => {
            const recordTitle = document.querySelector('#elementRecordTitle').value;
            const url = new URL(window.location.href);
            const uid = url.searchParams.get('uid');
            const headline = document.querySelector('h2');
            if (headline) {
                headline.innerText = lll('headline.' + (e.target.checked ? 'copy' : 'move'), recordTitle, uid);
            }
            const buttonLabel = e.target.checked
                ? lll('copyElementToHere')
                : lll('moveElementToHere');
            document.querySelectorAll('[data-action="paste"]').forEach((button) => {
                button.querySelector('span.t3js-button-label').textContent = buttonLabel;
            });
        }).delegateTo(container, '#makeCopy');
        new RegularEvent('click', async (e, actionElement) => {
            const modeCheckbox = document.querySelector('#makeCopy');
            const recordTitle = document.querySelector('#elementRecordTitle').value;
            const targetPageTitle = document.querySelector('#pageRecordTitle').value;
            const pageUid = document.querySelector('#pageUid').value;
            const url = new URL(window.location.href);
            const uid = url.searchParams.get('uid');
            const returnUrl = new URL(url.searchParams.get('returnUrl'), window.origin);
            const isCopyAction = modeCheckbox.checked;
            const action = isCopyAction ? 'copy' : 'move';
            const parameters = {
                cmd: {
                    tt_content: {
                        [uid]: {
                            [action]: actionElement.dataset.position
                        }
                    }
                }
            };
            if (actionElement.dataset.colpos !== undefined) {
                parameters.data = {
                    tt_content: {
                        [uid]: {
                            colPos: actionElement.dataset.colpos
                        }
                    }
                };
            }
            AjaxDataHandler.process(parameters).then(() => {
                Modal.dismiss();
                Notification.success(lll(isCopyAction ? 'moveElement.notification.elementCopied.title' : 'moveElement.notification.elementMoved.title'), lll(isCopyAction ? 'moveElement.notification.elementCopied.message' : 'moveElement.notification.elementMoved.message', recordTitle), 10, [
                    {
                        label: lll('moveElement.notification.elementPasted.action.dismiss'),
                    },
                    {
                        label: lll('moveElement.notification.elementPasted.action.open', targetPageTitle),
                        action: new ImmediateAction(() => {
                            returnUrl.searchParams.set('id', pageUid);
                            Viewport.ContentContainer.setUrl(returnUrl.toString());
                        })
                    }
                ]);
                Viewport.ContentContainer.setUrl(returnUrl.toString());
            });
        }).delegateTo(container, '[data-action="paste"]');
    }
}
