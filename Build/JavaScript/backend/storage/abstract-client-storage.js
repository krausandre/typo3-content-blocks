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
 * Module: @typo3/backend/storage/abstract-client-storage
 * @exports @typo3/backend/storage/abstract-client-storage
 */
export default class AbstractClientStorage {
    constructor() {
        this.keyPrefix = 't3-';
        this.storage = null;
    }
    get(key) {
        if (this.storage === null) {
            return null;
        }
        return this.storage.getItem(this.keyPrefix + key);
    }
    getByPrefix(prefix) {
        if (this.storage === null) {
            return {};
        }
        const entries = Object.entries(this.storage)
            .filter((item) => item[0].startsWith(this.keyPrefix + prefix))
            .map((item) => {
            return [item[0].substring(this.keyPrefix.length), item[1]];
        });
        return Object.fromEntries(entries);
    }
    set(key, value) {
        if (this.storage !== null) {
            this.storage.setItem(this.keyPrefix + key, value);
        }
    }
    unset(key) {
        if (this.storage !== null) {
            this.storage.removeItem(this.keyPrefix + key);
        }
    }
    unsetByPrefix(prefix) {
        if (this.storage === null) {
            return;
        }
        prefix = this.keyPrefix + prefix;
        Object.keys(this.storage)
            .filter((key) => key.startsWith(prefix))
            .forEach((key) => this.storage.removeItem(key));
    }
    clear() {
        if (this.storage !== null) {
            this.storage.clear();
        }
    }
    isset(key) {
        if (this.storage === null) {
            return false;
        }
        return this.get(key) !== null;
    }
}
