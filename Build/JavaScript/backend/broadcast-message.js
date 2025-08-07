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
/**
 * @module @typo3/backend/broadcast-message
 */
export class BroadcastMessage {
    constructor(componentName, eventName, payload) {
        if (!componentName || !eventName) {
            throw new Error('Properties componentName and eventName have to be defined');
        }
        this.componentName = componentName;
        this.eventName = eventName;
        this.payload = payload || {};
    }
    static fromData(data) {
        const payload = Object.assign({}, data);
        delete payload.componentName;
        delete payload.eventName;
        return new BroadcastMessage(data.componentName, data.eventName, payload);
    }
    createCustomEvent(scope = 'typo3') {
        return new CustomEvent([scope, this.componentName, this.eventName].join(':'), { detail: this.payload });
    }
}
