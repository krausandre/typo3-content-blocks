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
 * Module: @typo3/backend/form-engine-link-browser-adapter
 * LinkBrowser communication with parent window
 */
import LinkBrowser from '@typo3/backend/link-browser';
import Modal from '@typo3/backend/modal';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
export default (function () {
    /**
     * @exports @typo3/backend/form-engine-link-browser-adapter
     */
    const FormEngineLinkBrowserAdapter = {
        onFieldChangeItems: null // those are set in the module initializer function in PHP
    };
    /**
     * @param {OnFieldChangeItem[]} onFieldChangeItems
     */
    FormEngineLinkBrowserAdapter.setOnFieldChangeItems = function (onFieldChangeItems) {
        FormEngineLinkBrowserAdapter.onFieldChangeItems = onFieldChangeItems;
    };
    /**
     * Return reference to parent's form element
     *
     * @returns {Element}
     */
    FormEngineLinkBrowserAdapter.checkReference = function () {
        const selector = 'form[name="' + LinkBrowser.parameters.formName + '"] [data-formengine-input-name="' + LinkBrowser.parameters.itemName + '"]';
        const opener = FormEngineLinkBrowserAdapter.getParent();
        if (opener && opener.document && opener.document.querySelector(selector)) {
            return opener.document.querySelector(selector);
        }
        else {
            Modal.dismiss();
        }
    };
    /**
     * Save the current link back to the opener
     *
     * @param {String} input
     */
    LinkBrowser.finalizeFunction = function (input) {
        const field = FormEngineLinkBrowserAdapter.checkReference();
        if (field) {
            const attributeValues = LinkBrowser.getLinkAttributeValues();
            // encode link on server
            attributeValues.url = input;
            (new AjaxRequest(TYPO3.settings.ajaxUrls.link_browser_encodetypolink))
                .withQueryArguments(attributeValues)
                .get()
                .then(async (response) => {
                const data = await response.resolve();
                if (data.typoLink) {
                    field.value = data.typoLink;
                    field.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                    if (FormEngineLinkBrowserAdapter.onFieldChangeItems instanceof Array) {
                        // @todo us `CustomEvent` or broadcast channel as alternative
                        FormEngineLinkBrowserAdapter.getParent()
                            .TYPO3.FormEngine.processOnFieldChange(FormEngineLinkBrowserAdapter.onFieldChangeItems);
                    }
                    Modal.dismiss();
                }
            });
        }
    };
    /**
     * Returns the parent document object
     */
    FormEngineLinkBrowserAdapter.getParent = function () {
        let opener;
        if (typeof window.parent !== 'undefined' &&
            typeof window.parent.document.list_frame !== 'undefined' &&
            window.parent.document.list_frame.parent.document.querySelector('.t3js-modal-iframe') !== null) {
            opener = window.parent.document.list_frame;
        }
        else if (typeof window.parent !== 'undefined' &&
            typeof window.parent.frames.list_frame !== 'undefined' &&
            window.parent.frames.list_frame.parent.document.querySelector('.t3js-modal-iframe') !== null) {
            opener = window.parent.frames.list_frame;
        }
        else if (typeof window.frames !== 'undefined' &&
            typeof window.frames.frameElement !== 'undefined' &&
            window.frames.frameElement !== null &&
            window.frames.frameElement.classList.contains('t3js-modal-iframe')) {
            opener = window.frames.frameElement.contentWindow.parent;
        }
        else if (window.opener) {
            opener = window.opener;
        }
        return opener;
    };
    return FormEngineLinkBrowserAdapter;
})();
