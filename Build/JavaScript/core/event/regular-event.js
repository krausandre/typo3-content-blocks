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
class RegularEvent {
    constructor(eventName, callback, options = false) {
        this.eventName = eventName;
        this.callback = callback;
        this.options = options;
    }
    bindTo(element) {
        if (!element) {
            console.warn(`Binding event ${this.eventName} failed, element was not found.`);
            return;
        }
        this.boundElement = element;
        element.addEventListener(this.eventName, this.callback, this.options);
    }
    delegateTo(element, selector) {
        if (!element) {
            console.warn(`Delegating event ${this.eventName} failed, element was not found.`);
            return;
        }
        this.boundElement = element;
        element.addEventListener(this.eventName, (e) => {
            for (let targetElement = e.target; targetElement && targetElement !== this.boundElement; targetElement = targetElement.parentElement) {
                if (targetElement.matches(selector)) {
                    this.callback.call(targetElement, e, targetElement);
                    break;
                }
            }
        }, this.options);
    }
    release() {
        this.boundElement.removeEventListener(this.eventName, this.callback);
    }
}
export default RegularEvent;
