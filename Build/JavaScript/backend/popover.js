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
import { Popover as BootstrapPopover } from 'bootstrap';
/**
 * Module: @typo3/backend/popover
 * API for popover windows powered by Twitter Bootstrap.
 * @exports @typo3/backend/popover
 */
class Popover {
    constructor() {
        /**
         * Default selector string.
         *
         * @return {string}
         */
        this.DEFAULT_SELECTOR = '[data-bs-toggle="popover"]';
        this.initialize();
    }
    /**
     * Initialize
     */
    initialize(selector) {
        selector = selector || this.DEFAULT_SELECTOR;
        document.querySelectorAll(selector).forEach((element) => {
            this.applyTitleIfAvailable(element);
            new BootstrapPopover(element);
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Popover wrapper function
     */
    popover(element) {
        this.toIterable(element).forEach((element) => {
            this.applyTitleIfAvailable(element);
            new BootstrapPopover(element);
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Set popover options on $element
     */
    setOptions(element, options) {
        options = options || {};
        const title = options.title || element.dataset.title || element.dataset.bsTitle || '';
        const content = options.content || element.dataset.bsContent || '';
        element.dataset.bsTitle = title;
        element.dataset.bsOriginalTitle = title;
        element.dataset.bsContent = content;
        element.dataset.bsPlacement = 'auto';
        delete options.title;
        delete options.content;
        const popover = BootstrapPopover.getInstance(element);
        if (popover === null) {
            console.warn('Failed to get popover instance for element.');
            return;
        }
        popover.setContent({
            '.popover-header': title,
            '.popover-body': content
        });
        for (const [optionName, optionValue] of Object.entries(options)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: using internal _config attribute
            popover._config[optionName] = optionValue;
        }
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Show popover with title and content on $element
     */
    show(element) {
        const popover = BootstrapPopover.getInstance(element);
        if (popover === null) {
            console.warn('Failed to get popover instance for element.');
            return;
        }
        popover.show();
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Hide popover on $element
     */
    hide(element) {
        const popover = BootstrapPopover.getInstance(element);
        if (popover === null) {
            console.warn('Failed to get popover instance for element.');
            return;
        }
        popover.hide();
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Destroy popover on $element
     */
    destroy(element) {
        const popover = BootstrapPopover.getInstance(element);
        if (popover === null) {
            console.warn('Failed to get popover instance for element.');
            return;
        }
        popover.dispose();
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Toggle popover on $element
     */
    toggle(element) {
        const popover = BootstrapPopover.getInstance(element);
        if (popover === null) {
            console.warn('Failed to get popover instance for element.');
            return;
        }
        popover.toggle();
    }
    toIterable(element) {
        let elementList;
        if (element instanceof HTMLElement) {
            elementList = [element];
        }
        else if (element instanceof NodeList) {
            elementList = element;
        }
        else {
            throw `Cannot consume element of type ${element.constructor.name}, expected NodeListOf<HTMLElement> or HTMLElement`;
        }
        return elementList;
    }
    /**
     * If the element contains an attributes that qualifies as a title, store it as data attribute "bs-title"
     */
    applyTitleIfAvailable(element) {
        const title = element.title || element.dataset.title || '';
        if (title) {
            element.dataset.bsTitle = title;
        }
    }
}
export default new Popover();
