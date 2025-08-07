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
var AlertElement_1;
import { customElement, property } from 'lit/decorators';
import { html, LitElement, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import Severity from '../severity';
import '@typo3/backend/element/icon-element';
import { lll } from '@typo3/core/lit-helper';
/**
 * * Module: @typo3/backend/element/alert-element
 *
 * @example
 * <typo3-backend-alert
 *   severity="2"
 *   heading="Alert heading"
 *   message="Alert message"
 *   dismissible
 *   show-icon
 * ></typo3-backend-alert>
 *
 * @internal this is subject to change
 */
let AlertElement = AlertElement_1 = class AlertElement extends LitElement {
    constructor() {
        super(...arguments);
        this.severity = SeverityEnum.info;
        this.dismissible = false;
        this.visible = true;
        this.heading = null;
        this.message = null;
        this.showIcon = false;
        this.randomSuffix = Math.random().toString(36).substring(7);
    }
    static getIconIdentifier(severity) {
        const icons = {
            [SeverityEnum.notice]: 'actions-lightbulb',
            [SeverityEnum.ok]: 'actions-check',
            [SeverityEnum.warning]: 'actions-exclamation',
            [SeverityEnum.error]: 'actions-close',
            [SeverityEnum.info]: 'actions-info',
        };
        return icons[severity] || 'actions-info';
    }
    createRenderRoot() {
        return this;
    }
    render() {
        return html `
      <div
        id="alert-${this.randomSuffix}"
        class=${classMap(this.getClasses())}
        role="alert"
        aria-labelledby="alert-title-${this.randomSuffix}"
        aria-describedby="alert-message-${this.randomSuffix}"
        @closed.bs.alert="${this.remove}"
      >
        <div class="alert-inner">
          ${this.showIcon ? html `
            <div class="alert-icon">
              <span class="icon-emphasized">
                <typo3-backend-icon identifier="${AlertElement_1.getIconIdentifier(this.severity)}" size="small"></typo3-backend-icon>
              </span>
            </div>
          ` : nothing}
          <div class="alert-content">
            ${this.heading ? html `<h4 class="alert-title" id="alert-title-${this.randomSuffix}">${this.heading}</h4>` : nothing}
            <p class="alert-body" id="alert-message-${this.randomSuffix}">${this.message}</p>
          </div>
        </div>
        ${this.dismissible ? this.renderDismissButton() : nothing}
      </div>
    `;
    }
    getClasses() {
        return {
            ['alert']: true,
            ['alert-' + Severity.getCssClass(this.severity)]: true,
            ['alert-dismissible']: this.dismissible,
            ['fade']: true,
            ['show']: this.visible,
            ['hidden']: !this.visible,
        };
    }
    renderDismissButton() {
        return html `
      <button type="button" class="close" data-bs-dismiss="alert" aria-label="${lll('button.close') || 'Close'}">
        <span aria-hidden="true"><typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon></span>
        <span class="visually-hidden">${lll('button.close') || 'Close'}</span>
      </button>
    `;
    }
};
__decorate([
    property({ type: Number })
], AlertElement.prototype, "severity", void 0);
__decorate([
    property({ type: Boolean })
], AlertElement.prototype, "dismissible", void 0);
__decorate([
    property({ type: Boolean })
], AlertElement.prototype, "visible", void 0);
__decorate([
    property({ type: String })
], AlertElement.prototype, "heading", void 0);
__decorate([
    property({ type: String })
], AlertElement.prototype, "message", void 0);
__decorate([
    property({ type: Boolean, attribute: 'show-icon' })
], AlertElement.prototype, "showIcon", void 0);
AlertElement = AlertElement_1 = __decorate([
    customElement('typo3-backend-alert')
], AlertElement);
export { AlertElement };
