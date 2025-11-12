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

import { html, LitElement } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import type { FieldTypeProperty } from '@friendsoftypo3/content-blocks-gui/interface/field-type-setting';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-value-picker></content-block-editor-value-picker>
 */
@customElement('content-block-editor-value-picker')
export class ContentBlockEditorValuePicker extends LitElement {

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
    isValuePickerEnabled = false;

  protected render(): TemplateResult {
    this.updateValuePickerEnabledState();
    const currentValue = this.values[this.fieldTypeProperty.name] as any || { mode: 'blank', items: [] };
    
    return html`
      <div class="component-container">
        <div class="component-header">
          <div class="form-check">
            <input @change="${this.handleValuePickerEnabledChange}" 
              type="checkbox" 
              id="valuePicker_enabled" 
              ?checked="${live(this.isValuePickerEnabled)}" 
              class="form-check-input" />
            <label class="form-check-label" for="valuePicker_enabled">
              Value Picker
            </label>
          </div>
        </div>
        ${this.isValuePickerEnabled ? html`
          <div class="component-body">
            <div class="form-group mb-3">
              <label for="${this.fieldTypeProperty.name}_mode" class="form-label">Mode</label>
              <select @change="${this.updateValuePickerMode}" class="form-select" id="${this.fieldTypeProperty.name}_mode" data-field="${this.fieldTypeProperty.name}">
                <option value="blank" ?selected=${currentValue.mode === 'blank'}>Blank (replace)</option>
                <option value="append" ?selected=${currentValue.mode === 'append'}>Append</option>
                <option value="prepend" ?selected=${currentValue.mode === 'prepend'}>Prepend</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Items</label>
              <div class="items-list">
                ${(currentValue.items || []).map((item: [string, string], index: number) => html`
                  <div class="item-row">
                    <div class="row g-2 align-items-center">
                      <div class="col">
                        <input 
                          @blur="${this.updateValuePickerItem}" 
                          type="text" 
                          placeholder="Label" 
                          .value="${live(item[0] || '')}" 
                          class="form-control form-control-sm" 
                          data-field="${this.fieldTypeProperty.name}" 
                          data-index="${index}" 
                          data-part="label" />
                      </div>
                      <div class="col">
                        <input 
                          @blur="${this.updateValuePickerItem}" 
                          type="text" 
                          placeholder="Value" 
                          .value="${live(item[1] || '')}" 
                          class="form-control form-control-sm" 
                          data-field="${this.fieldTypeProperty.name}" 
                          data-index="${index}" 
                          data-part="value" />
                      </div>
                      <div class="col-auto">
                        <button 
                          @click="${this.removeValuePickerItem}" 
                          class="btn btn-outline-danger btn-sm" 
                          title="Remove item"
                          data-field="${this.fieldTypeProperty.name}" 
                          data-index="${index}">
                          <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                `)}
                <div class="add-item-row">
                  <button 
                    @click="${this.addValuePickerItem}" 
                    class="btn btn-outline-secondary btn-sm" 
                    data-field="${this.fieldTypeProperty.name}">
                    <typo3-backend-icon identifier="actions-add" size="small"></typo3-backend-icon>
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  protected updateValuePickerMode(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const fieldName = target.dataset.field!;
    const currentValue = this.values[fieldName] as any || { mode: 'blank', items: [] };
    
    this.values[fieldName] = {
      ...currentValue,
      mode: target.value
    };
    
    this.dispatchUpdateEvent();
  }

  protected updateValuePickerItem(event: Event): void {
    const target = event.target as HTMLInputElement;
    const fieldName = this.fieldTypeProperty.name;
    const index = parseInt(target.dataset.index!);
    const part = target.dataset.part!;

    if (!this.values[fieldName]) {
      this.values[fieldName] = { mode: 'blank', items: [], enabled: true };
    }

    const currentValue = this.values[fieldName] as any;
    if (!currentValue.items) {
      currentValue.items = [];
    }
    
    if (!currentValue.items[index]) {
      currentValue.items[index] = ['', ''];
    }
    
    currentValue.items[index][part === 'label' ? 0 : 1] = target.value;
    
    this.values[fieldName] = currentValue;
    this.dispatchUpdateEvent();
  }

  protected addValuePickerItem(event: Event): void {
    event.preventDefault();
    const fieldName = this.fieldTypeProperty.name;

    if (!this.values[fieldName]) {
      this.values[fieldName] = { mode: 'blank', items: [], enabled: true };
    }

    const currentValue = this.values[fieldName] as any;
    if (!currentValue.items) {
      currentValue.items = [];
    }
    
    currentValue.items.push(['', '']);
    this.values[fieldName] = currentValue;
    
    this.requestUpdate();
    this.dispatchUpdateEvent();
  }

  protected removeValuePickerItem(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLButtonElement;
    const fieldName = this.fieldTypeProperty.name;
    const index = parseInt(target.dataset.index!);
    
    if (!this.values[fieldName] || !this.values[fieldName].items) {
      return;
    }

    const currentValue = this.values[fieldName] as any;
    currentValue.items.splice(index, 1);
    this.values[fieldName] = currentValue;
    
    this.requestUpdate();
    this.dispatchUpdateEvent();
  }

  protected updateValuePickerEnabledState(): void {
    const valuePicker = this.values[this.fieldTypeProperty.name];
    this.isValuePickerEnabled = valuePicker?.enabled || false;
  }

  protected handleValuePickerEnabledChange(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const fieldName = this.fieldTypeProperty.name;

    if (!this.values[fieldName]) {
      this.values[fieldName] = { mode: 'blank', items: [] };
    }

    this.isValuePickerEnabled = target.checked;
    this.values[fieldName].enabled = target.checked;

    if (target.checked) {
      if (!this.values[fieldName].mode) {
        this.values[fieldName].mode = 'blank';
      }
      if (!this.values[fieldName].items) {
        this.values[fieldName].items = [];
      }
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