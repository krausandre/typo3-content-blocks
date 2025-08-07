"use strict";
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
(function () {
    function decryptCharcode(charCode, start, end, offset) {
        charCode = charCode + offset;
        if (offset > 0 && charCode > end) {
            charCode = start + (charCode - end - 1);
        }
        else if (offset < 0 && charCode < start) {
            charCode = end - (start - charCode - 1);
        }
        return String.fromCharCode(charCode);
    }
    function decryptString(value, offset) {
        let result = '';
        for (let i = 0; i < value.length; i++) {
            const charCode = value.charCodeAt(i);
            if (charCode >= 0x2B && charCode <= 0x3A) {
                result += decryptCharcode(charCode, 0x2B, 0x3A, offset); /* 0-9 . , - + / : */
            }
            else if (charCode >= 0x40 && charCode <= 0x5A) {
                result += decryptCharcode(charCode, 0x40, 0x5A, offset); /* A-Z @ */
            }
            else if (charCode >= 0x61 && charCode <= 0x7A) {
                result += decryptCharcode(charCode, 0x61, 0x7A, offset); /* a-z */
            }
            else {
                result += value.charAt(i);
            }
        }
        return result;
    }
    function windowOpen(url, target, features) {
        const windowRef = window.open(url, target, features);
        if (windowRef) {
            windowRef.focus();
        }
        return windowRef;
    }
    function delegateEvent(event, selector, callback) {
        document.addEventListener(event, function (evt) {
            for (let node = evt.target; node; node = node.parentNode !== document ? node.parentNode : null) {
                if ('matches' in node) {
                    const targetElement = node;
                    if (targetElement.matches(selector)) {
                        callback(evt, targetElement);
                    }
                }
            }
        });
    }
    delegateEvent('click', 'a[data-mailto-token][data-mailto-vector]', function (evt, evtTarget) {
        evt.preventDefault();
        const dataset = evtTarget.dataset;
        const value = dataset.mailtoToken;
        const offset = parseInt(dataset.mailtoVector, 10) * -1;
        document.location.href = decryptString(value, offset);
    });
    delegateEvent('click', 'a[data-window-url]', function (evt, evtTarget) {
        evt.preventDefault();
        const dataset = evtTarget.dataset;
        const url = dataset.windowUrl;
        const target = dataset.windowTarget || null;
        const features = dataset.windowFeatures || null;
        windowOpen(url, target, features);
    });
})();
