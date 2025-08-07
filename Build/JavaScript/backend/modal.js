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
import { Modal as BootstrapModal } from 'bootstrap';
import { html, nothing, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { unsafeHTML } from 'lit/directives/unsafe-html';
import { classMap } from 'lit/directives/class-map';
import { styleMap } from 'lit/directives/style-map';
import { ifDefined } from 'lit/directives/if-defined';
import { classesArrayToClassInfo } from '@typo3/core/lit-helper';
import RegularEvent from '@typo3/core/event/regular-event';
import { SeverityEnum } from './enum/severity';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Severity from './severity';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/element/spinner-element';
var Identifiers;
(function (Identifiers) {
    Identifiers["modal"] = ".t3js-modal";
    Identifiers["content"] = ".t3js-modal-content";
    Identifiers["close"] = ".t3js-modal-close";
    Identifiers["body"] = ".t3js-modal-body";
    Identifiers["footer"] = ".t3js-modal-footer";
})(Identifiers || (Identifiers = {}));
export var Sizes;
(function (Sizes) {
    Sizes["small"] = "small";
    Sizes["default"] = "default";
    Sizes["medium"] = "medium";
    Sizes["large"] = "large";
    Sizes["full"] = "full";
})(Sizes || (Sizes = {}));
export var Styles;
(function (Styles) {
    Styles["default"] = "default";
    Styles["light"] = "light";
    Styles["dark"] = "dark";
})(Styles || (Styles = {}));
export var Types;
(function (Types) {
    Types["default"] = "default";
    Types["template"] = "template";
    Types["ajax"] = "ajax";
    Types["iframe"] = "iframe";
})(Types || (Types = {}));
let ModalElement = class ModalElement extends LitElement {
    constructor() {
        super(...arguments);
        this.modalTitle = '';
        this.content = '';
        this.type = Types.default;
        this.severity = SeverityEnum.notice;
        this.variant = Styles.default;
        this.size = Sizes.default;
        this.zindex = 5000;
        this.staticBackdrop = false;
        this.hideCloseButton = false;
        this.additionalCssClasses = [];
        this.buttons = [];
        this.templateResultContent = null;
        this.activeButton = null;
        this.bootstrapModal = null;
        this.callback = null;
        this.ajaxCallback = null;
        this.userData = {};
        this.keydownEventHandler = null;
    }
    setContent(content) {
        this.templateResultContent = content;
    }
    hideModal() {
        if (this.bootstrapModal) {
            this.bootstrapModal.hide();
            this.keydownEventHandler?.release();
        }
    }
    createRenderRoot() {
        // Avoid shadow DOM for Bootstrap CSS to be applied
        return this;
    }
    firstUpdated() {
        this.bootstrapModal = new BootstrapModal(this.renderRoot.querySelector(Identifiers.modal), {});
        this.bootstrapModal.show();
        if (this.callback) {
            this.callback(this);
        }
    }
    updated(changedProperties) {
        if (changedProperties.has('templateResultContent')) {
            this.dispatchEvent(new CustomEvent('modal-updated', { bubbles: true }));
        }
    }
    render() {
        const styles = {
            zIndex: this.zindex.toString()
        };
        const classes = classesArrayToClassInfo([
            `modal-type-${this.type}`,
            `modal-severity-${Severity.getCssClass(this.severity)}`,
            `modal-style-${this.variant}`,
            `modal-size-${this.size}`,
            ...this.additionalCssClasses,
        ]);
        return html `
      <div
          tabindex="-1"
          class="modal fade t3js-modal ${classMap(classes)}"
          style=${styleMap(styles)}
          data-bs-backdrop="${ifDefined(this.staticBackdrop) ? 'static' : true}"
          @show.bs.modal=${() => this.trigger('typo3-modal-show')}
          @shown.bs.modal=${() => this.trigger('typo3-modal-shown')}
          @hide.bs.modal=${() => this.trigger('typo3-modal-hide')}
          @hidden.bs.modal=${() => this.trigger('typo3-modal-hidden')}
      >
          <div class="modal-dialog">
              <div class="t3js-modal-content modal-content">
                  <div class="modal-header">
                      <h1 class="h4 t3js-modal-title modal-title">${this.modalTitle}</h1>
                      ${this.hideCloseButton ? nothing : html `
                          <button class="t3js-modal-close close" @click=${() => this.bootstrapModal.hide()}>
                              <typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon>
                              <span class="visually-hidden">${TYPO3?.lang?.['button.close'] || 'Close'}</span>
                          </button>
                      `}
                  </div>
                  <div class="t3js-modal-body modal-body">${this.renderModalBody()}</div>
                  ${this.buttons.length === 0 ? nothing : html `
                    <div class="t3js-modal-footer modal-footer">
                      ${this.buttons.map(button => this.renderModalButton(button))}
                    </div>
                  `}
              </div>
          </div>
      </div>
    `;
    }
    _buttonClick(event, button) {
        const buttonElement = event.currentTarget;
        if (button.action) {
            this.activeButton = button;
            button.action.execute(buttonElement).then(() => this.bootstrapModal.hide());
        }
        else if (button.trigger) {
            button.trigger(event, this);
        }
        buttonElement.dispatchEvent(new CustomEvent('button.clicked', { bubbles: true }));
    }
    renderAjaxBody() {
        if (this.templateResultContent === null) {
            new AjaxRequest(this.content).get()
                .then(async (response) => {
                const htmlResponse = await response.raw().text();
                this.templateResultContent = html `${unsafeHTML(htmlResponse)}`;
                this.updateComplete.then(() => {
                    if (this.ajaxCallback) {
                        this.ajaxCallback(this);
                    }
                    this.dispatchEvent(new CustomEvent('modal-loaded'));
                });
            })
                .catch(async (response) => {
                const htmlResponse = await response.raw().text();
                if (htmlResponse) {
                    this.templateResultContent = html `${unsafeHTML(htmlResponse)}`;
                }
                else {
                    this.templateResultContent = html `<p><strong>Oops, received a ${response.response.status} response from </strong> <span class="text-break">${this.content}</span>.</p>`;
                }
            });
            return html `<div class="modal-loading"><typo3-backend-spinner size="large"></typo3-backend-spinner></div>`;
        }
        return this.templateResultContent;
    }
    renderModalBody() {
        this.keydownEventHandler = new RegularEvent('keydown', this.handleKeydown);
        this.keydownEventHandler.bindTo(document);
        if (this.type === Types.iframe) {
            const loadCallback = (e) => {
                const iframe = e.currentTarget;
                if (iframe.contentDocument.title) {
                    this.modalTitle = iframe.contentDocument.title;
                }
                new RegularEvent('keydown', this.handleKeydown).bindTo(iframe.contentDocument);
            };
            return html `
        <iframe src="${this.content}" name="modal_frame" class="modal-iframe t3js-modal-iframe" @load=${loadCallback}></iframe>
      `;
        }
        if (this.type === Types.ajax) {
            return this.renderAjaxBody();
        }
        if (this.type === Types.template) {
            return this.templateResultContent;
        }
        return html `<p>${this.content}</p>`;
    }
    renderModalButton(button) {
        const btnClass = button.btnClass || 'btn-default';
        const classes = {
            ['btn']: true,
            [btnClass]: true,
            ['t3js-active']: button.active,
            ['disabled']: this.activeButton && this.activeButton !== button,
        };
        return html `
      <button class=${classMap(classes)}
              name=${ifDefined(button.name || undefined)}
              form=${ifDefined(button.form || undefined)}
              @click=${(e) => this._buttonClick(e, button)}>
          ${button.icon ? html `<typo3-backend-icon identifier="${button.icon}" size="small"></typo3-backend-icon>` : nothing}
          ${button.text}
      </button>
    `;
    }
    trigger(event) {
        this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }));
    }
    handleKeydown(e) {
        if (e.key === 'Escape' && parent?.top?.TYPO3?.Modal) {
            parent.top.TYPO3.Modal.dismiss();
        }
    }
};
__decorate([
    property({ type: String, reflect: true })
], ModalElement.prototype, "modalTitle", void 0);
__decorate([
    property({ type: String, reflect: true })
], ModalElement.prototype, "content", void 0);
__decorate([
    property({ type: String, reflect: true })
], ModalElement.prototype, "type", void 0);
__decorate([
    property({ type: String, reflect: true })
], ModalElement.prototype, "severity", void 0);
__decorate([
    property({ type: String, reflect: true })
], ModalElement.prototype, "variant", void 0);
__decorate([
    property({ type: String, reflect: true })
], ModalElement.prototype, "size", void 0);
__decorate([
    property({ type: Number, reflect: true })
], ModalElement.prototype, "zindex", void 0);
__decorate([
    property({ type: Boolean })
], ModalElement.prototype, "staticBackdrop", void 0);
__decorate([
    property({ type: Boolean })
], ModalElement.prototype, "hideCloseButton", void 0);
__decorate([
    property({ type: Array })
], ModalElement.prototype, "additionalCssClasses", void 0);
__decorate([
    property({ type: Array, attribute: false })
], ModalElement.prototype, "buttons", void 0);
__decorate([
    state()
], ModalElement.prototype, "templateResultContent", void 0);
__decorate([
    state()
], ModalElement.prototype, "activeButton", void 0);
ModalElement = __decorate([
    customElement('typo3-backend-modal')
], ModalElement);
export { ModalElement };
/**
 * Module: @typo3/backend/modal
 * API for modal windows powered by Twitter Bootstrap.
 */
class Modal {
    constructor() {
        // @todo: drop? available as named exports
        this.sizes = Sizes;
        this.styles = Styles;
        this.types = Types;
        // @todo: currentModal could be a getter method for the last element in this.instances
        this.currentModal = null;
        this.instances = [];
        this.defaultConfiguration = {
            type: Types.default,
            title: 'Information',
            content: 'No content provided, please check your <code>Modal</code> configuration.',
            severity: SeverityEnum.notice,
            buttons: [],
            style: Styles.default,
            size: Sizes.default,
            additionalCssClasses: [],
            callback: null,
            ajaxCallback: null,
            staticBackdrop: false,
            hideCloseButton: false
        };
        this.initializeMarkupTrigger(document);
    }
    static createModalResponseEventFromElement(element, result) {
        if (!element.dataset.eventName) {
            return null;
        }
        return new CustomEvent(element.dataset.eventName, {
            bubbles: true,
            detail: { result, payload: element.dataset.eventPayload || null }
        });
    }
    /**
     * Close the current open modal
     */
    dismiss() {
        if (this.currentModal) {
            this.currentModal.hideModal();
        }
    }
    /**
     * Shows a confirmation dialog
     * Events:
     * - button.clicked
     * - confirm.button.cancel
     * - confirm.button.ok
     *
     * @param {string} title The title for the confirm modal
     * @param {TemplateResult | string | JQuery | Element | DocumentFragment} content The content for the conform modal, e.g. the main question
     * @param {SeverityEnum} severity Default SeverityEnum.warning
     * @param {Array<Button>} buttons An array with buttons, default no buttons
     * @param {Array<string>} additionalCssClasses Additional css classes to add to the modal
     * @returns {ModalElement}
     */
    confirm(title, content, severity = SeverityEnum.warning, buttons = [], additionalCssClasses) {
        if (buttons.length === 0) {
            buttons.push({
                text: TYPO3?.lang?.['button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
            }, {
                text: TYPO3?.lang?.['button.ok'] || 'OK',
                btnClass: 'btn-' + Severity.getCssClass(severity),
                name: 'ok',
            });
        }
        const modal = this.advanced({
            title,
            content,
            severity,
            buttons,
            additionalCssClasses
        });
        modal.addEventListener('button.clicked', (e) => {
            const button = e.target;
            if (button.getAttribute('name') === 'cancel') {
                button.dispatchEvent(new CustomEvent('confirm.button.cancel', { bubbles: true }));
            }
            else if (button.getAttribute('name') === 'ok') {
                button.dispatchEvent(new CustomEvent('confirm.button.ok', { bubbles: true }));
            }
        });
        return modal;
    }
    /**
     * Load URL with AJAX, append the content to the modal-body
     * and trigger the callback
     *
     * @param {string} title
     * @param {SeverityEnum} severity
     * @param {Array<Button>} buttons
     * @param {string} url
     * @param {ModalCallbackFunction} callback
     * @param {string} target
     * @returns {ModalElement}
     */
    loadUrl(title, severity = SeverityEnum.info, buttons, url, callback) {
        return this.advanced({
            type: Types.ajax,
            title,
            severity,
            buttons,
            ajaxCallback: callback,
            content: url,
        });
    }
    /**
     * Shows a dialog
     *
     * @param {string} title
     * @param {string | JQuery | Element | DocumentFragment} content
     * @param {number} severity
     * @param {Array<Button>} buttons
     * @param {Array<string>} additionalCssClasses
     * @returns {ModalElement}
     */
    show(title, content, severity = SeverityEnum.info, buttons, additionalCssClasses) {
        return this.advanced({
            type: Types.default,
            title,
            content,
            severity,
            buttons,
            additionalCssClasses,
        });
    }
    /**
     * Loads modal by configuration
     */
    advanced(configuration) {
        // Validation of configuration
        configuration.type = typeof configuration.type === 'string' && configuration.type in Types
            ? configuration.type
            : this.defaultConfiguration.type;
        configuration.title = typeof configuration.title === 'string'
            ? configuration.title
            : this.defaultConfiguration.title;
        configuration.content = typeof configuration.content === 'string' || typeof configuration.content === 'object'
            ? configuration.content
            : this.defaultConfiguration.content;
        configuration.severity = typeof configuration.severity !== 'undefined'
            ? configuration.severity
            : this.defaultConfiguration.severity;
        configuration.buttons = configuration.buttons || this.defaultConfiguration.buttons;
        configuration.size = typeof configuration.size === 'string' && configuration.size in Sizes
            ? configuration.size
            : this.defaultConfiguration.size;
        configuration.style = typeof configuration.style === 'string' && configuration.style in Styles
            ? configuration.style
            : this.defaultConfiguration.style;
        configuration.additionalCssClasses = configuration.additionalCssClasses || this.defaultConfiguration.additionalCssClasses;
        configuration.callback = typeof configuration.callback === 'function' ? configuration.callback : this.defaultConfiguration.callback;
        configuration.ajaxCallback = typeof configuration.ajaxCallback === 'function'
            ? configuration.ajaxCallback
            : this.defaultConfiguration.ajaxCallback;
        configuration.staticBackdrop = configuration.staticBackdrop || this.defaultConfiguration.staticBackdrop;
        configuration.hideCloseButton = configuration.hideCloseButton || this.defaultConfiguration.hideCloseButton;
        return this.generate(configuration);
    }
    setButtons(buttons) {
        this.currentModal.buttons = buttons;
        return this.currentModal;
    }
    /**
     * Initialize markup with data attributes
     *
     * @param {HTMLDocument} theDocument
     * @internal
     */
    initializeMarkupTrigger(theDocument) {
        const modalTrigger = (evt, triggerElement) => {
            evt.preventDefault();
            const content = triggerElement.dataset.bsContent || triggerElement.dataset.content || TYPO3?.lang?.['message.confirmation'] || 'Are you sure?';
            let severity = SeverityEnum.notice;
            if (triggerElement.dataset.severity in SeverityEnum) {
                const severityKey = triggerElement.dataset.severity;
                severity = SeverityEnum[severityKey];
            }
            let size = Sizes.default;
            if (triggerElement.dataset.size in Sizes) {
                const sizeKey = triggerElement.dataset.size;
                size = Sizes[sizeKey];
            }
            let url = triggerElement.dataset.url || null;
            if (url !== null) {
                const separator = url.includes('?') ? '&' : '?';
                const params = new URLSearchParams(triggerElement.dataset).toString();
                url = url + separator + params;
            }
            this.advanced({
                type: url !== null ? Types.ajax : Types.default,
                title: triggerElement.dataset.title || 'Alert',
                content: url !== null ? url : content,
                size,
                severity,
                staticBackdrop: triggerElement.dataset.staticBackdrop !== undefined,
                buttons: [
                    {
                        text: triggerElement.dataset.buttonCloseText || TYPO3?.lang?.['button.close'] || 'Close',
                        active: true,
                        btnClass: 'btn-default',
                        trigger: (e, modal) => {
                            modal.hideModal();
                            const event = Modal.createModalResponseEventFromElement(triggerElement, false);
                            if (event !== null) {
                                triggerElement.dispatchEvent(event);
                            }
                        },
                    },
                    {
                        text: triggerElement.dataset.buttonOkText || TYPO3?.lang?.['button.ok'] || 'OK',
                        btnClass: 'btn-' + Severity.getCssClass(severity),
                        trigger: (e, modal) => {
                            modal.hideModal();
                            const event = Modal.createModalResponseEventFromElement(triggerElement, true);
                            if (event !== null) {
                                triggerElement.dispatchEvent(event);
                            }
                            const targetLocation = triggerElement.dataset.uri || triggerElement.dataset.href || triggerElement.getAttribute('href');
                            if (targetLocation && targetLocation !== '#') {
                                triggerElement.ownerDocument.location.href = targetLocation;
                            }
                            if (triggerElement.getAttribute('type') === 'submit' && (triggerElement.tagName === 'BUTTON' || triggerElement.tagName === 'INPUT')) {
                                const submitter = triggerElement;
                                submitter.form?.requestSubmit(submitter);
                            }
                            if (triggerElement.dataset.targetForm) {
                                // Submit a possible form in case the trigger has the data-target-form
                                // attribute set to a valid form identifier in the ownerDocument.
                                triggerElement.ownerDocument.querySelector('form#' + triggerElement.dataset.targetForm)?.submit();
                            }
                        },
                    },
                ],
            });
        };
        new RegularEvent('click', modalTrigger).delegateTo(theDocument, '.t3js-modal-trigger');
    }
    /**
     * @param {Configuration} configuration
     */
    generate(configuration) {
        const currentModal = document.createElement('typo3-backend-modal');
        currentModal.type = configuration.type;
        if (typeof configuration.content === 'string') {
            currentModal.content = configuration.content;
        }
        else if (configuration.type === Types.default) {
            currentModal.type = Types.template;
            currentModal.templateResultContent = configuration.content;
        }
        currentModal.severity = configuration.severity;
        currentModal.variant = configuration.style;
        currentModal.size = configuration.size;
        currentModal.modalTitle = configuration.title;
        currentModal.additionalCssClasses = configuration.additionalCssClasses;
        currentModal.buttons = configuration.buttons;
        currentModal.staticBackdrop = configuration.staticBackdrop;
        currentModal.hideCloseButton = configuration.hideCloseButton;
        if (configuration.callback) {
            currentModal.callback = configuration.callback;
        }
        if (configuration.ajaxCallback) {
            currentModal.ajaxCallback = configuration.ajaxCallback;
        }
        currentModal.addEventListener('typo3-modal-shown', () => {
            const backdrop = currentModal.nextElementSibling;
            // Stack backdrop zIndexes to overlay existing (opened) modals
            // We use 1000 as the overall base to circumvent a stuttering UI as Bootstrap uses a z-index of 1050 for backdrops
            // on initial rendering - this will clash again when at least five modals are open, which is fine and should never happen
            const baseZIndex = 1000 + (10 * this.instances.length);
            currentModal.zindex = baseZIndex;
            const backdropZIndex = baseZIndex - 5;
            backdrop.style.zIndex = backdropZIndex.toString();
            // focus the button which was configured as active button
            const activeButton = currentModal.querySelector(`${Identifiers.footer} .t3js-active`);
            if (activeButton !== null) {
                activeButton.focus();
            }
            else {
                // @todo can be removed once we switch to a native <dialog> tag
                currentModal.querySelector('[autofocus]')?.focus();
            }
        });
        // Remove modal from Modal.instances when hidden
        currentModal.addEventListener('typo3-modal-hide', () => {
            if (this.instances.length > 0) {
                const lastIndex = this.instances.length - 1;
                this.instances.splice(lastIndex, 1);
                this.currentModal = this.instances[lastIndex - 1];
            }
        });
        currentModal.addEventListener('typo3-modal-hidden', () => {
            currentModal.remove();
            // Keep class modal-open on body tag as long as open modals exist
            if (this.instances.length > 0) {
                document.body.classList.add('modal-open');
            }
        });
        // When modal is opened/shown add it to Modal.instances and make it Modal.currentModal
        currentModal.addEventListener('typo3-modal-show', () => {
            this.currentModal = currentModal;
            this.instances.push(currentModal);
        });
        document.body.appendChild(currentModal);
        return currentModal;
    }
}
let modalObject = null;
try {
    if (parent && parent.window.TYPO3 && parent.window.TYPO3.Modal) {
        // fetch from parent
        // we need to trigger the event capturing again, in order to make sure this works inside iframes
        parent.window.TYPO3.Modal.initializeMarkupTrigger(document);
        modalObject = parent.window.TYPO3.Modal;
    }
    else if (top && top.TYPO3.Modal) {
        // fetch object from outer frame
        // we need to trigger the event capturing again, in order to make sure this works inside iframes
        top.TYPO3.Modal.initializeMarkupTrigger(document);
        modalObject = top.TYPO3.Modal;
    }
}
catch {
    // This only happens if the opener, parent or top is some other url (eg a local file)
    // which loaded the current window. Then the browser's cross domain policy jumps in
    // and raises an exception.
    // For this case we are safe and we can create our global object below.
}
if (!modalObject) {
    modalObject = new Modal();
    if (typeof TYPO3 !== 'undefined') {
        // expose as global object
        TYPO3.Modal = modalObject;
    }
}
export default modalObject;
