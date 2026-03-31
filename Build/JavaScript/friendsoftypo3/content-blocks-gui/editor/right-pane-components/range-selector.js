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
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-range-selector></content-block-editor-range-selector>
 */
let ContentBlockEditorRangeSelector = class ContentBlockEditorRangeSelector extends LitElement {
    constructor() {
        super(...arguments);
        this.isRangeEnabled = false;
    }
    render() {
        this.updateRangeEnabledState();
        return html `
      <div class="component-container">
        <div class="component-header">
          <div class="form-check">
            <input @change="${this.handleRangeEnabledChange}" 
              type="checkbox" 
              id="range_enabled" 
              ?checked="${live(this.isRangeEnabled)}" 
              class="form-check-input" />
            <label class="form-check-label" for="range_enabled">
              Range Configuration
            </label>
          </div>
        </div>
        ${this.isRangeEnabled ? html `
          <div class="component-body">
            <div class="row g-3">
              <div class="col-6">
                <label for="range_lower" class="form-label">Lower</label>
                <input @blur="${this.handleRangeInputChange}" 
                  type="number" 
                  id="range_lower" 
                  .value="${live(this.values.range?.lower || 0)}"
                  class="form-control" />
              </div>
              <div class="col-6">
                <label for="range_upper" class="form-label">Upper</label>
                <input @blur="${this.handleRangeInputChange}" 
                  type="number" 
                  id="range_upper" 
                  .value="${live(this.values.range?.upper || 100)}"
                  class="form-control" />
              </div>
            </div>
          </div>
        ` : ''}
      </div>`;
    }
    updateRangeEnabledState() {
        const range = this.values.range;
        if (range && Object.prototype.hasOwnProperty.call(range, 'enabled')) {
            // If enabled property is explicitly set, use that value
            this.isRangeEnabled = !!range.enabled;
        }
        else if (range && (range.lower !== undefined || range.upper !== undefined)) {
            // If no enabled property but has range values, consider it enabled on initial render
            this.isRangeEnabled = true;
        }
        else {
            // Default to disabled if no range or no values
            this.isRangeEnabled = false;
        }
    }
    handleRangeEnabledChange(event) {
        event.preventDefault();
        const target = event.target;
        if (!this.values.range) {
            this.values.range = {};
        }
        this.isRangeEnabled = target.checked;
        const range = this.values.range;
        range.enabled = target.checked;
        if (target.checked) {
            if (range.lower === undefined) {
                range.lower = 0;
            }
            if (range.upper === undefined) {
                range.upper = 100;
            }
        }
        this.dispatchUpdateEvent();
    }
    handleRangeInputChange(event) {
        event.preventDefault();
        const target = event.target;
        if (!this.values.range) {
            this.values.range = {};
        }
        const range = this.values.range;
        if (target.id === 'range_lower') {
            range.lower = parseInt(target.value, 10);
        }
        else if (target.id === 'range_upper') {
            range.upper = parseInt(target.value, 10);
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
], ContentBlockEditorRangeSelector.prototype, "fieldTypeProperty", void 0);
__decorate([
    property()
], ContentBlockEditorRangeSelector.prototype, "values", void 0);
__decorate([
    property()
], ContentBlockEditorRangeSelector.prototype, "position", void 0);
__decorate([
    property()
], ContentBlockEditorRangeSelector.prototype, "level", void 0);
__decorate([
    property()
], ContentBlockEditorRangeSelector.prototype, "parent", void 0);
__decorate([
    property()
], ContentBlockEditorRangeSelector.prototype, "isRangeEnabled", void 0);
ContentBlockEditorRangeSelector = __decorate([
    customElement('content-block-editor-range-selector')
], ContentBlockEditorRangeSelector);
export { ContentBlockEditorRangeSelector };
