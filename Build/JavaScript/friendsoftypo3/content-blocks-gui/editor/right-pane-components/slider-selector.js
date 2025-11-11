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
import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import { live } from 'lit/directives/live.js';
import { FieldTypeProperty } from '@friendsoftypo3/content-blocks-gui/interface/field-type-setting';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-slider-selector></content-block-editor-slider-selector>
 */
let ContentBlockEditorSliderSelector = class ContentBlockEditorSliderSelector extends LitElement {
    constructor() {
        super(...arguments);
        this.isSliderEnabled = false;
    }
    render() {
        this.updateSliderEnabledState();
        return html `
      <div class="slider-container">
        <div class="form-check">
          <input @change="${this.handleSliderEnabledChange}" 
            type="checkbox" 
            id="slider_enabled" 
            ?checked="${live(this.isSliderEnabled)}" 
            class="form-check-input" />
          <label class="form-check-label" for="slider_enabled">
            Add Slider
          </label>
        </div>
        ${this.isSliderEnabled ? html `
          <div class="slider-inputs mt-2">
            <div class="row">
              <div class="col-6">
                <label for="slider_step">Step:</label>
                <input @blur="${this.handleSliderInputChange}" 
                  type="number" 
                  id="slider_step" 
                  step="0.1"
                  .value="${live(this.values['slider']?.step || 1)}" 
                  class="form-control" />
              </div>
              <div class="col-6">
                <label for="slider_width">Width (px):</label>
                <input @blur="${this.handleSliderInputChange}" 
                  type="number" 
                  id="slider_width" 
                  .value="${live(this.values['slider']?.width || 100)}" 
                  class="form-control" />
              </div>
            </div>
          </div>
        ` : ''}
      </div>`;
    }
    updateSliderEnabledState() {
        const slider = this.values['slider'];
        this.isSliderEnabled = slider?.enabled || false;
    }
    handleSliderEnabledChange(event) {
        event.preventDefault();
        const target = event.target;
        if (!this.values['slider']) {
            this.values['slider'] = {};
        }
        this.isSliderEnabled = target.checked;
        this.values['slider'].enabled = target.checked;
        if (target.checked) {
            if (this.values['slider'].step === undefined) {
                this.values['slider'].step = 1;
            }
            if (this.values['slider'].width === undefined) {
                this.values['slider'].width = 100;
            }
        }
        this.dispatchUpdateEvent();
    }
    handleSliderInputChange(event) {
        event.preventDefault();
        const target = event.target;
        if (!this.values['slider']) {
            this.values['slider'] = {};
        }
        if (target.id === 'slider_step') {
            this.values['slider'].step = parseFloat(target.value);
        }
        else if (target.id === 'slider_width') {
            this.values['slider'].width = parseInt(target.value);
        }
        this.dispatchUpdateEvent();
    }
    dispatchUpdateEvent() {
        this.dispatchEvent(new CustomEvent('updateCbFieldData', {
            bubbles: true,
            composed: true,
            detail: {
                position: this.position,
                level: this.level,
                parent: this.parent,
                values: this.values,
            },
        }));
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        // const renderRoot = this.attachShadow({mode: 'open'});
        return this;
    }
};
__decorate([
    property()
], ContentBlockEditorSliderSelector.prototype, "fieldTypeProperty", void 0);
__decorate([
    property()
], ContentBlockEditorSliderSelector.prototype, "values", void 0);
__decorate([
    property()
], ContentBlockEditorSliderSelector.prototype, "position", void 0);
__decorate([
    property()
], ContentBlockEditorSliderSelector.prototype, "level", void 0);
__decorate([
    property()
], ContentBlockEditorSliderSelector.prototype, "parent", void 0);
__decorate([
    property()
], ContentBlockEditorSliderSelector.prototype, "isSliderEnabled", void 0);
ContentBlockEditorSliderSelector = __decorate([
    customElement('content-block-editor-slider-selector')
], ContentBlockEditorSliderSelector);
export { ContentBlockEditorSliderSelector };
