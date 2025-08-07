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
import {} from 'bootstrap';
import Popover from './popover';
import RegularEvent from '@typo3/core/event/regular-event';
import DocumentService from '@typo3/core/document-service';
/**
 * Module: @typo3/backend/context-help
 * API for context help.
 * @exports @typo3/backend/context-help
 */
class ContextHelp {
    constructor() {
        this.trigger = 'click';
        this.placement = 'auto';
        this.selector = '.help-link';
        this.initialize();
    }
    async initialize() {
        await DocumentService.ready();
        const elements = document.querySelectorAll(this.selector);
        elements.forEach((element) => {
            element.dataset.bsHtml = 'true';
            element.dataset.bsPlacement = this.placement;
            element.dataset.bsTrigger = this.trigger;
            Popover.popover(element);
        });
        new RegularEvent('show.bs.popover', (e) => {
            const me = e.target;
            const description = me.dataset.description;
            if (description) {
                const options = {
                    title: me.dataset.title || '',
                    content: description,
                };
                Popover.setOptions(me, options);
            }
        }).delegateTo(document, this.selector);
        new RegularEvent('click', (e) => {
            const me = e.target;
            elements.forEach((element) => {
                if (!element.isEqualNode(me)) {
                    Popover.hide(element);
                }
            });
        }).delegateTo(document, 'body');
    }
}
export default new ContextHelp();
