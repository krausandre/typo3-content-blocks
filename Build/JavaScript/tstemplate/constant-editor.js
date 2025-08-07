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
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
import '@typo3/backend/color-picker';
var Selectors;
(function (Selectors) {
    Selectors["editIconSelector"] = ".t3js-toggle";
})(Selectors || (Selectors = {}));
/**
 * Module: @typo3/tstemplate/constant-editor
 * Various functions related to the Constant Editor
 * e.g. updating the field and working with colors
 */
class ConstantEditor {
    constructor() {
        DocumentService.ready().then((document) => {
            if (document.querySelectorAll('typo3-backend-color-picker').length) {
                import('@typo3/backend/color-picker');
            }
            this.registerEvents();
        });
    }
    registerEvents() {
        new RegularEvent('click', this.changeProperty)
            .delegateTo(document, Selectors.editIconSelector);
    }
    /**
     * initially register event listeners
     */
    changeProperty() {
        const constantName = this.getAttribute('rel');
        const defaultDiv = document.getElementById('defaultTS-' + constantName);
        const userDiv = document.getElementById('userTS-' + constantName);
        const checkBox = document.getElementById('check-' + constantName);
        const toggleState = this.dataset.bsToggle;
        if (toggleState === 'edit') {
            defaultDiv.style.display = 'none';
            userDiv.style.removeProperty('display');
            checkBox.removeAttribute('disabled');
        }
        else if (toggleState === 'undo') {
            userDiv.style.display = 'none';
            defaultDiv.style.removeProperty('display');
            checkBox.setAttribute('disabled', 'disabled');
        }
    }
}
export default new ConstantEditor();
