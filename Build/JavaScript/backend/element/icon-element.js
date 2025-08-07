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
import { html, LitElement, nothing } from 'lit';
import { Task } from '@lit/task';
import { customElement, property } from 'lit/decorators';
import { unsafeHTML } from 'lit/directives/unsafe-html';
import { Sizes, States, MarkupIdentifiers } from '../enum/icon-types';
import Icons, { IconStyles } from '../icons';
import '@typo3/backend/element/spinner-element';
/**
 * Module: @typo3/backend/element/icon-element
 *
 * @example
 * <typo3-backend-icon identifier="data-view-page" size="small"></typo3-backend-icon>
 */
let IconElement = class IconElement extends LitElement {
    constructor() {
        super(...arguments);
        this.size = Sizes.default;
        this.state = States.default;
        this.overlay = null;
        this.markup = MarkupIdentifiers.inline;
        /**
         * @internal Usage of `raw` attribute is discouraged due to security implications.
         *
         * The `raw` attribute value will be rendered unescaped into DOM as raw html (.innerHTML = raw).
         * That means it is the responsibility of the callee to ensure the HTML string does not contain
         * user supplied strings.
         * This attribute should therefore only be used to preserve backwards compatibility,
         * and must not be used in new code or with user supplied strings.
         * Use `identifier` attribute if ever possible instead.
         */
        this.raw = null;
        this.iconTask = new Task(this, {
            task: async ([identifier, size, overlay, state, markup], { signal }) => {
                return await Icons.getIcon(identifier, size, overlay, state, markup, signal);
            },
            args: () => [this.identifier, this.size, this.overlay, this.state, this.markup]
        });
    }
    static { this.styles = IconStyles.getStyles(); }
    render() {
        if (this.raw) {
            return html `${unsafeHTML(this.raw)}`;
        }
        if (!this.identifier) {
            return nothing;
        }
        return this.iconTask.render({
            pending: () => html `<typo3-backend-spinner size=${this.size}></typo3-backend-size>`,
            complete: (markup) => html `${unsafeHTML(markup)}`,
            error: () => html `
        <span class="t3js-icon icon icon-size-${this.size} icon-state-${this.state} icon-default-not-found" data-identifier="default-not-found" aria-hidden="true">
	        <span class="icon-markup">
            <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 16 16"><g><path fill="#CD201F" d="m11 12 3-2v6H2v-6l3 2 3-2 3 2z"/><path fill="#212121" d="m8 10.3 2.86 1.91.14.09.14-.09 2.61-1.74v5.28H2.25v-5.28l2.61 1.74.14.09.14-.09L8 10.3m6-.3-3 2-3-2-3 2-3-2v6h12v-6z" opacity=".2"/><path fill="#CD201F" d="M14 4v4l-3 2-3-2-3 2-3-2V0h8l4 4z"/><path fill="#212121" d="M13.75 7.87 11 9.7 8.14 7.79 8 7.7l-.14.09L5 9.7 2.25 7.87V.25H10V0H2v8l3 2 3-2 3 2 3-2V4h-.25z" opacity=".2"/><path fill="#FFF" d="M14 4h-4V0l4 4z" opacity=".3"/><path fill="#212121" d="m14 8-4-4h4v4z" opacity=".3"/></g></svg>
	        </span>
        </span>
      `
        });
    }
};
__decorate([
    property({ type: String, reflect: true })
], IconElement.prototype, "identifier", void 0);
__decorate([
    property({ type: String, reflect: true })
], IconElement.prototype, "size", void 0);
__decorate([
    property({ type: String })
], IconElement.prototype, "state", void 0);
__decorate([
    property({ type: String })
], IconElement.prototype, "overlay", void 0);
__decorate([
    property({ type: String })
], IconElement.prototype, "markup", void 0);
__decorate([
    property({ type: String })
], IconElement.prototype, "raw", void 0);
IconElement = __decorate([
    customElement('typo3-backend-icon')
], IconElement);
export { IconElement };
