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
 * Module: @typo3/backend/storage/persistent
 * Wrapper for persistent storage in UC
 * @exports @typo3/backend/storage/persistent
 */
class Persistent {
    constructor() {
        this.data = null;
    }
    /**
     * Persistent storage, stores everything on the server via AJAX, does a greedy load on read
     * common functions get/set/clear
     *
     * @param {String} key
     * @returns {any}
     */
    get(key) {
        if (this.data === null) {
            this.data = this.loadFromServer();
        }
        return this.getRecursiveDataByDeepKey(this.data, key.split('.'));
    }
    /**
     * Store data persistent on server
     *
     * @param {String} key
     * @param {String} value
     * @returns {Promise<UC>}
     */
    set(key, value) {
        if (this.data !== null) {
            this.data = this.setRecursiveDataByDeepKey(this.data, key.split('.'), value);
        }
        return this.storeOnServer(key, value);
    }
    /**
     * @param {string} key
     * @param {string} value
     * @returns {Promise<UC>}
     */
    async addToList(key, value) {
        const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.usersettings_process).post({
            action: 'addToList',
            key,
            value,
        });
        return this.resolveResponse(response);
    }
    /**
     * @param {string} key
     * @param {string} value
     * @returns {Promise<UC>}
     */
    async removeFromList(key, value) {
        const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.usersettings_process).post({
            action: 'removeFromList',
            key,
            value,
        });
        return this.resolveResponse(response);
    }
    async unset(key) {
        const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.usersettings_process).post({
            action: 'unset',
            key,
        });
        return this.resolveResponse(response);
    }
    /**
     * Clears the UC
     */
    clear() {
        new AjaxRequest(TYPO3.settings.ajaxUrls.usersettings_process).post({
            action: 'clear',
        });
        this.data = null;
    }
    /**
     * Checks if a key was set before, useful to not do all the undefined checks all the time
     *
     * @param {string} key
     * @returns {boolean}
     */
    isset(key) {
        const value = this.get(key);
        return (typeof value !== 'undefined' && value !== null);
    }
    /**
     * Loads the data from outside, only used for the initial call from BackendController
     *
     * @param {UC} data
     */
    load(data) {
        this.data = data;
    }
    /**
     * Loads all data from the server
     */
    loadFromServer() {
        const url = new URL(location.origin + TYPO3.settings.ajaxUrls.usersettings_process);
        url.searchParams.set('action', 'getAll');
        const request = new XMLHttpRequest();
        const async = false;
        request.open('GET', url.toString(), async);
        request.send();
        if (request.status === 200) {
            return JSON.parse(request.responseText);
        }
        throw `Unexpected response code ${request.status}, reason: ${request.responseText}`;
    }
    /**
     * Stores data on the server, and gets the updated data on return
     * to always be up-to-date inside the browser
     *
     * @param {string} key
     * @param {string|object} value
     * @returns {Promise<UC>}
     */
    async storeOnServer(key, value) {
        const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.usersettings_process).post({
            action: 'set',
            key,
            value,
        });
        return this.resolveResponse(response);
    }
    /**
     * Helper function used to set a value which could have been a flat object key data["my.foo.bar"] to
     * data[my][foo][bar] is called recursively by itself
     *
     * @param {object} data the data to be used as base
     * @param {string[]} keyParts the keyParts for the subtree
     * @returns {UC}
     */
    getRecursiveDataByDeepKey(data, keyParts) {
        if (keyParts.length === 1) {
            return (data || {})[keyParts[0]];
        }
        const firstKey = keyParts.shift();
        return this.getRecursiveDataByDeepKey(data[firstKey] || {}, keyParts);
    }
    /**
     * helper function used to set a value which could have been a flat object key data["my.foo.bar"] to
     * data[my][foo][bar]
     * is called recursively by itself
     *
     * @param {UC} data
     * @param {string[]} keyParts
     * @param {UC} value
     * @returns {UC}
     */
    setRecursiveDataByDeepKey(data, keyParts, value) {
        if (keyParts.length === 1) {
            data = data || {};
            data[keyParts[0]] = value;
        }
        else {
            const firstKey = keyParts.shift();
            data[firstKey] = this.setRecursiveDataByDeepKey(data[firstKey] || {}, keyParts, value);
        }
        return data;
    }
    async resolveResponse(response) {
        const resolvedResponse = await response.resolve();
        this.data = resolvedResponse;
        return resolvedResponse;
    }
}
export default new Persistent();
