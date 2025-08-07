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
import Icons from '@typo3/backend/icons';
/**
 * Module: @typo3/backend/form/submit-interceptor
 */
export default class SubmitInterceptor {
    constructor(form) {
        this.isSubmitting = false;
        this.preSubmitCallbacks = [];
        form.addEventListener('submit', this.submitHandler.bind(this));
    }
    addPreSubmitCallback(callback) {
        if (typeof callback !== 'function') {
            throw 'callback must be a function.';
        }
        this.preSubmitCallbacks.push(callback);
        return this;
    }
    submitHandler(e) {
        if (this.isSubmitting) {
            return;
        }
        for (const callback of this.preSubmitCallbacks) {
            const callbackResult = callback(e);
            if (!callbackResult) {
                e.preventDefault();
                return;
            }
        }
        this.isSubmitting = true;
        if (e.submitter !== null) {
            if (e.submitter instanceof HTMLInputElement || e.submitter instanceof HTMLButtonElement) {
                e.submitter.disabled = true;
            }
            Icons.getIcon('spinner-circle', Icons.sizes.small).then((markup) => {
                e.submitter.replaceChild(document.createRange().createContextualFragment(markup), e.submitter.querySelector('.t3js-icon'));
            }).catch(() => {
                // Catch error in case the promise was not resolved
                // e.g. loading a new page
            });
        }
    }
}
