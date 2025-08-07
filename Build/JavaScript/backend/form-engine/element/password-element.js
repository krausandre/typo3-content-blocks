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
import { selector } from '@typo3/core/literals';
/**
 * Module: @typo3/backend/form-engine/element/password-element
 *
 * Functionality for the password element
 *
 * @example
 * <typo3-formengine-element-password recordFieldId="some-id" passwordPolicy="some-policy">
 *   ...
 * </typo3-formengine-element-password>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class PasswordElement extends HTMLElement {
    constructor() {
        super(...arguments);
        this.element = null;
        this.passwordPolicyInfo = null;
        this.passwordPolicySet = false;
    }
    async connectedCallback() {
        if (this.element !== null) {
            // Element is already initialized, which means the component has been rendered before. Nothing to do here.
            return;
        }
        const recordFieldId = this.getAttribute('recordFieldId');
        if (recordFieldId === null) {
            return;
        }
        await DocumentService.ready();
        this.element = this.querySelector(selector `#${recordFieldId}`);
        if (!this.element) {
            return;
        }
        this.passwordPolicyInfo = this.querySelector(selector `#password-policy-info-${this.element.id}`);
        this.passwordPolicySet = (this.getAttribute('passwordPolicy') || '') !== '';
        this.registerEventHandler();
    }
    registerEventHandler() {
        if (this.passwordPolicySet && this.passwordPolicyInfo !== null) {
            this.element.addEventListener('focusin', () => {
                this.passwordPolicyInfo.classList.remove('hidden');
            });
            this.element.addEventListener('focusout', () => {
                this.passwordPolicyInfo.classList.add('hidden');
            });
        }
    }
}
window.customElements.define('typo3-formengine-element-password', PasswordElement);
