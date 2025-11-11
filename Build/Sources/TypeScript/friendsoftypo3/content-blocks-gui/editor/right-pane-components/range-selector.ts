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

import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import { live } from 'lit/directives/live.js';
import { FieldTypeProperty } from '@friendsoftypo3/content-blocks-gui/interface/field-type-setting';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-range-selector></content-block-editor-range-selector>
 */
@customElement('content-block-editor-range-selector')
export class ContentBlockEditorRangeSelector extends LitElement {

  @property()
    fieldTypeProperty: FieldTypeProperty;

  @property()
    values: Record<string, unknown>;

  @property()
    position?: number;

  @property()
    level?: number;

  @property()
    parent?: number;

  @property()
    isRangeEnabled = false;

  protected render(): TemplateResult {
    this.updateRangeEnabledState();
    return html`
      <div class="range-container">
        <div class="form-check">
          <input @change="${this.handleRangeEnabledChange}" 
            type="checkbox" 
            id="range_enabled" 
            ?checked="${live(this.isRangeEnabled)}" 
            class="form-check-input" />
          <label class="form-check-label" for="range_enabled">
            Enable Range
          </label>
        </div>
        ${this.isRangeEnabled ? html`
          <div class="range-inputs mt-2">
            <div class="row">
              <div class="col-6">
                <label for="range_lower">Lower:</label>
                <input @blur="${this.handleRangeInputChange}" 
                  type="number" 
                  id="range_lower" 
                  .value="${live(this.values['range']?.lower || 0)}" 
                  class="form-control" />
              </div>
              <div class="col-6">
                <label for="range_upper">Upper:</label>
                <input @blur="${this.handleRangeInputChange}" 
                  type="number" 
                  id="range_upper" 
                  .value="${live(this.values['range']?.upper || 100)}" 
                  class="form-control" />
              </div>
            </div>
          </div>
        ` : ''}
      </div>`;
  }

    protected updateRangeEnabledState(): void {
        const range = this.values['range'];
        this.isRangeEnabled = range?.enabled || false;
    }

  protected handleRangeEnabledChange(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    
    if (!this.values['range']) {
      this.values['range'] = {};
    }
    
    this.isRangeEnabled = target.checked;
    this.values['range'].enabled = target.checked;
    
    if (target.checked) {
      if (this.values['range'].lower === undefined) {
        this.values['range'].lower = 0;
      }
      if (this.values['range'].upper === undefined) {
        this.values['range'].upper = 100;
      }
    }
    
    this.dispatchUpdateEvent();
  }

  protected handleRangeInputChange(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    
    if (!this.values['range']) {
      this.values['range'] = {};
    }
    
    if (target.id === 'range_lower') {
      this.values['range'].lower = parseInt(target.value);
    } else if (target.id === 'range_upper') {
      this.values['range'].upper = parseInt(target.value);
    }
    
    this.dispatchUpdateEvent();
  }

  protected dispatchUpdateEvent(): void {
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

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}