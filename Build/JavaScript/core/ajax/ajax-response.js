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
export class AjaxResponse {
    constructor(response) {
        this.response = response;
    }
    async resolve(expectedType) {
        // streams can only be read once
        // (otherwise response would have to be cloned)
        if (typeof this.resolvedBody !== 'undefined') {
            return this.resolvedBody;
        }
        const contentType = this.response.headers.get('Content-Type') ?? '';
        if (expectedType === 'json' || contentType.startsWith('application/json')) {
            this.resolvedBody = await this.response.json();
        }
        else {
            this.resolvedBody = await this.response.text();
        }
        return this.resolvedBody;
    }
    raw() {
        return this.response;
    }
    /**
     * Dereferences response data from current `window` scope. A dereferenced
     * response (`SimpleResponseInterface`) can be used in events or messages
     * for broadcasting to other windows/frames.
     */
    async dereference() {
        const headers = new Map();
        this.response.headers.forEach((value, name) => headers.set(name, value));
        return {
            status: this.response.status,
            headers: headers,
            body: await this.resolve()
        };
    }
}
