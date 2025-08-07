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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/* eslint-disable @typescript-eslint/member-ordering */
import { LitElement } from 'lit';
import { defaultConverter } from '@lit/reactive-element';
import { property } from 'lit/decorators';
export const internals = Symbol('internals');
const privateInternals = Symbol('privateInternals');
export const getFormValue = Symbol('getFormValue');
export const getFormState = Symbol('getFormState');
/**
 * Base element class for settings type to act as
 * a form associated custom element.
 *
 * See https://web.dev/articles/more-capable-form-controls#defining_a_form-associated_custom_element
 */
export class BaseElement extends LitElement {
    constructor() {
        super(...arguments);
        this.readonly = false;
        this.debug = false;
    }
    static { this.formAssociated = true; }
    createRenderRoot() {
        return this;
    }
    get [internals]() {
        // Create internals in getter so that it can be used in methods called on
        // construction in `ReactiveElement`, such as `requestUpdate()`.
        if (!this[privateInternals]) {
            this[privateInternals] = this.attachInternals();
        }
        return this[privateInternals];
    }
    get form() {
        return this[internals].form;
    }
    get labels() {
        return this[internals].labels;
    }
    // Use @property for the `name` and `disabled` properties to add them to the
    // `observedAttributes` array and trigger `attributeChangedCallback()`.
    //
    // We don't use Lit's default getter/setter (`noAccessor: true`) because
    // the attributes need to be updated synchronously to work with synchronous
    // form APIs, and Lit updates attributes async by default.
    get name() {
        return this.getAttribute('name') ?? '';
    }
    set name(name) {
        // Note: setting name to null or empty does not remove the attribute.
        this.setAttribute('name', name);
        // We don't need to call `requestUpdate()` since it's called synchronously
        // in `attributeChangedCallback()`.
    }
    get disabled() {
        return this.hasAttribute('disabled');
    }
    set disabled(disabled) {
        this.toggleAttribute('disabled', disabled);
        // We don't need to call `requestUpdate()` since it's called synchronously
        // in `attributeChangedCallback()`.
    }
    attributeChangedCallback(name, old, value) {
        // Manually `requestUpdate()` for `name` and `disabled` when their
        // attribute or property changes.
        // The properties update their attributes, so this callback is invoked
        // immediately when the properties are set. We call `requestUpdate()` here
        // instead of letting Lit set the properties from the attribute change.
        // That would cause the properties to re-set the attribute and invoke this
        // callback again in a loop. This leads to stale state when Lit tries to
        // determine if a property changed or not.
        if (name === 'name' || name === 'disabled') {
            // Disabled's value is only false if the attribute is missing and null.
            const oldValue = name === 'disabled' ? old !== null : old;
            // Trigger a lit update when the attribute changes.
            this.requestUpdate(name, oldValue);
            return;
        }
        super.attributeChangedCallback(name, old, value);
    }
    requestUpdate(name, oldValue, options) {
        super.requestUpdate(name, oldValue, options);
        if (name === 'value') {
            this.dispatchEvent(new CustomEvent('typo3:setting:changed', { detail: { value: this.value } }));
            // Update the form value synchronously in `requestUpdate()` rather than
            // `update()` or `updated()`, which are async. This is necessary to ensure
            // that form data is updated in time for synchronous event listeners.
            this[internals].setFormValue(this[getFormValue](), this[getFormState]());
        }
    }
    formDisabledCallback(disabled) {
        this.disabled = disabled;
    }
    /**
     * Callback triggered when <button type=reset> or form.reset() is triggered.
     */
    formResetCallback() {
        const oldValue = this.value;
        const defaultValue = this.getAttribute('value');
        // Workaround to trigger string to property conversion
        this.attributeChangedCallback('value', this.valueToString(oldValue), null);
        this.attributeChangedCallback('value', null, defaultValue);
    }
    /**
     * Callback triggered when form is (re-)loaded by browser-back button.
     */
    formStateRestoreCallback(state) {
        if (typeof state === 'string') {
            this.attributeChangedCallback('value', this.valueToString(this.value), null);
            this.attributeChangedCallback('value', null, state);
        }
        else {
            throw new Error(`formStateRestoreCallback() needs to be implemented for <${this.localName}> for state type "${typeof state}"`);
        }
    }
    [getFormState]() {
        return this[getFormValue]();
    }
    [getFormValue]() {
        return this.valueToString(this.value);
    }
    valueToString(value) {
        const ctor = this.constructor;
        const options = ctor.getPropertyOptions('value');
        const converter = typeof options.converter === 'object' && typeof options.converter?.toAttribute === 'function' ?
            options.converter.toAttribute : defaultConverter.toAttribute;
        return converter(value, options.type);
    }
}
__decorate([
    property({ type: String })
], BaseElement.prototype, "key", void 0);
__decorate([
    property({ type: String })
], BaseElement.prototype, "formid", void 0);
__decorate([
    property({ type: Boolean })
], BaseElement.prototype, "readonly", void 0);
__decorate([
    property({ type: Object })
], BaseElement.prototype, "enum", void 0);
__decorate([
    property({ type: Boolean })
], BaseElement.prototype, "debug", void 0);
__decorate([
    property({ type: Object })
], BaseElement.prototype, "options", void 0);
__decorate([
    property({ noAccessor: true })
], BaseElement.prototype, "name", null);
__decorate([
    property({ type: Boolean, noAccessor: true })
], BaseElement.prototype, "disabled", null);
