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
/**
 * Module: @typo3/install/module/ajax-queue
 */
class AjaxQueue {
    constructor() {
        this.requests = [];
        this.requestCount = 0;
        this.threshold = 5;
        this.queue = [];
    }
    add(payload) {
        this.queue.push(payload);
        this.handleNext();
    }
    flush() {
        this.queue = [];
        this.requests.forEach((request) => request.abort());
        this.requests = [];
    }
    handleNext() {
        if (this.queue.length > 0 && this.requestCount < this.threshold) {
            this.incrementRequestCount();
            this.sendRequest(this.queue.shift()).finally(() => {
                this.decrementRequestCount();
                this.handleNext();
            });
        }
    }
    async sendRequest(payload) {
        const request = new AjaxRequest(payload.url);
        let response;
        if (typeof payload.method !== 'undefined' && payload.method.toUpperCase() === 'POST') {
            response = request.post(payload.data);
        }
        else {
            response = request.withQueryArguments(payload.data || {}).get();
        }
        this.requests.push(request);
        return response.then(payload.onfulfilled, payload.onrejected).then(() => {
            const idx = this.requests.indexOf(request);
            this.requests.splice(idx, 1);
        });
    }
    incrementRequestCount() {
        this.requestCount++;
    }
    decrementRequestCount() {
        if (this.requestCount > 0) {
            this.requestCount--;
        }
    }
}
export default new AjaxQueue();
