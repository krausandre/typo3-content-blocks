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
 * Module: @typo3/backend/utility
 */
class Utility {
    /**
     * Splits a string by a given delimiter and trims the values
     *
     * @param {string} delimiter
     * @param {string} string
     * @return Array<string>
     */
    static trimExplode(delimiter, string) {
        return string.split(delimiter).map((item) => item.trim()).filter((item) => item !== '');
    }
    /**
     * Trims string items.
     *
     * @param {string[]|any[]} items
     */
    static trimItems(items) {
        return items.map((item) => {
            if (item instanceof String) {
                return item.trim();
            }
            return item;
        });
    }
    /**
     * Splits a string by a given delimiter and converts the values to integer
     *
     * @param {string} delimiter
     * @param {string} string
     * @param {boolean} excludeZeroValues
     * @return Array<number>
     */
    static intExplode(delimiter, string, excludeZeroValues = false) {
        return string
            .split(delimiter)
            .map((item) => parseInt(item, 10))
            .filter((item) => !isNaN(item) || excludeZeroValues && item === 0);
    }
    /**
     * Checks if a given number is really a number
     *
     * Taken from:
     * http://dl.dropbox.com/u/35146/js/tests/isNumber.html
     *
     * @param {number} value
     * @returns {boolean}
     */
    static isNumber(value) {
        return !isNaN(parseFloat(value.toString())) && isFinite(value);
    }
    /**
     * Updates a parameter inside of given url
     *
     * @param {string} url
     * @param {string} key
     * @param {string} value
     * @returns {string}
     * @deprecated will be removed in TYPO3 v14
     */
    static updateQueryStringParameter(url, key, value) {
        console.warn('Utility.updateQueryStringParameter() has been marked as deprecated and will be removed in TYPO3 v14.');
        const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        const separator = url.includes('?') ? '&' : '?';
        if (url.match(re)) {
            return url.replace(re, '$1' + key + '=' + value + '$2');
        }
        return url + separator + key + '=' + value;
    }
    static convertFormToObject(form) {
        const obj = {};
        form.querySelectorAll('input, select, textarea').forEach((element) => {
            const name = element.name;
            const value = element.value;
            if (name) {
                if (element.tagName.toLowerCase() === 'input' && element.type == 'checkbox') {
                    const checkbox = element;
                    if (obj[name] === undefined) {
                        obj[name] = [];
                    }
                    if (checkbox.checked) {
                        obj[name].push(value);
                    }
                }
                else {
                    obj[name] = value;
                }
            }
        });
        return obj;
    }
    /**
     * Performs a deep merge of `source` into `target`.
     * Mutates `target` only but not its objects and arrays.
     *
     * @author inspired by [jhildenbiddle](https://stackoverflow.com/a/48218209/4828813).
     */
    static mergeDeep(...objects) {
        const isObject = (obj) => {
            return obj && typeof obj === 'object';
        };
        return objects.reduce((prev, obj) => {
            Object.keys(obj).forEach((key) => {
                const pVal = prev[key];
                const oVal = obj[key];
                if (Array.isArray(pVal) && Array.isArray(oVal)) {
                    prev[key] = pVal.concat(...oVal);
                }
                else if (isObject(pVal) && isObject(oVal)) {
                    prev[key] = Utility.mergeDeep(pVal, oVal);
                }
                else {
                    prev[key] = oVal;
                }
            });
            return prev;
        }, {});
    }
    /**
     * Checks if the origin, pathnames and query string are equal (ignoring different fragments),
     * and therefore point to the same server side resource.
     *
     * @param {string|null} url1
     * @param {string|null} url2
     *
     * @returns {boolean}
     */
    static urlsPointToSameServerSideResource(url1, url2) {
        if (!url1 || !url2) {
            return false;
        }
        const currentWindowUrlOrigin = window.location.origin;
        try {
            const uriObject1 = new URL(url1, Utility.isValidUrl(url1) ? undefined : currentWindowUrlOrigin);
            const uriObject2 = new URL(url2, Utility.isValidUrl(url2) ? undefined : currentWindowUrlOrigin);
            const resource1 = uriObject1.origin + uriObject1.pathname + uriObject1.search;
            const resource2 = uriObject2.origin + uriObject2.pathname + uriObject2.search;
            return resource1 === resource2;
        }
        catch {
            return false;
        }
    }
    /**
     * Checks, if the given URL is valid.
     *
     * @param {null|string} url
     * @private
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
}
export default Utility;
