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
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';
var Identifiers;
(function (Identifiers) {
    Identifiers["modalBody"] = ".t3js-modal-body";
    Identifiers["modalContent"] = ".t3js-module-content";
    Identifiers["modalFooter"] = ".t3js-modal-footer";
})(Identifiers || (Identifiers = {}));
export class AbstractInteractableModule {
    initialize(currentModal) {
        this.currentModal = currentModal;
    }
    getModalBody() {
        return this.findInModal(Identifiers.modalBody);
    }
    getModuleContent() {
        return this.findInModal(Identifiers.modalContent);
    }
    getModalFooter() {
        return this.findInModal(Identifiers.modalFooter);
    }
    findInModal(selector) {
        return this.currentModal.querySelector(selector);
    }
    setModalButtonsState(interactable) {
        this.getModalFooter()?.querySelectorAll('button').forEach((elem) => {
            this.setModalButtonState(elem, interactable);
        });
    }
    setModalButtonState(button, interactable) {
        button.classList.toggle('disabled', !interactable);
        button.disabled = !interactable;
    }
    async loadModuleFrameAgnostic(module) {
        const isInIframe = window.location !== window.parent.location;
        if (isInIframe) {
            await topLevelModuleImport(module);
        }
        else {
            await import(module);
        }
    }
    renderProgressBar(target, properties, mode) {
        this.loadModuleFrameAgnostic('@typo3/backend/element/progress-bar-element.js');
        target = target || this.currentModal;
        const progressBar = target.ownerDocument.createElement('typo3-backend-progress-bar');
        if (typeof properties === 'object') {
            Object.keys(properties).forEach((key) => {
                progressBar[key] = properties[key];
            });
        }
        if (mode === 'append') {
            target.append(progressBar);
        }
        else if (mode === 'prepend') {
            target.prepend(progressBar);
        }
        else {
            target.replaceChildren(progressBar);
        }
        return progressBar;
    }
}
