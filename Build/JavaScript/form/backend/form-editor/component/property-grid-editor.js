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
import { repeat } from 'lit/directives/repeat';
import { classMap } from 'lit/directives/class-map';
import { live } from 'lit/directives/live';
import { customElement, property, state } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
export class PropertyGridEditorUpdateEvent extends Event {
    static { this.eventName = 'typo3:backend:form-editor:component:property-grid-editor:update'; }
    constructor(data) {
        super(PropertyGridEditorUpdateEvent.eventName);
        this.data = data;
    }
}
/**
 * Module: @typo3/form/backend/form-editor/component/property-grid-editor
 */
let PropertyGridEditor = class PropertyGridEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.entries = [];
        this.labelLabel = 'Label';
        this.labelValue = 'Value';
        this.labelSelected = 'Selected';
        this.labelAdd = 'Add';
        this.labelRemove = 'Remove';
        this.labelMove = 'Move';
        this.enableAddRow = false;
        this.enableDeleteRow = false;
        this.enableSelection = true;
        this.enableMultiSelection = false;
        this.enableSorting = false;
        this.enableLabelAsFallbackValue = false;
        this.draggedEntry = null;
        this.movedEntry = null;
        this.activeElementRef = null;
    }
    createRenderRoot() {
        return this;
    }
    updated(changedProperties) {
        if (this.activeElementRef) {
            this.activeElementRef.focus();
            this.activeElementRef = null;
        }
        if (changedProperties.has('entries')) {
            const oldEntries = changedProperties.get('entries');
            if (oldEntries !== undefined && JSON.stringify(oldEntries) !== JSON.stringify(this.entries)) {
                this.dispatchEvent(new PropertyGridEditorUpdateEvent(this.entries));
            }
        }
    }
    render() {
        return html `
      <div class="property-grid-editor">
        ${this.entries?.length ? html `
          <div class="property-grid-editor__entries">
            ${repeat(this.entries, entry => entry.id, entry => this.renderEntry(entry))}
          </div>
        ` : nothing}
        ${this.enableAddRow ? html `
          <div class="property-grid-editor__actions">
            <button
              class="btn btn-sm btn-default"
              title=${this.labelAdd}
              @click=${this.handleCreate}
            >
              <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
              <span class="btn-label">${this.labelAdd}</span>
            </button>
          </div>
        ` : nothing}
      </div>
    `;
    }
    renderEntry(entry) {
        return html `
      <div
        class=${classMap({ 'property-grid-editor__entry': true, moving: this.movedEntry === entry, dragging: this.draggedEntry === entry })}
        @dragover=${(event) => this.handleDragOver(event)}
        @dragenter=${(event) => this.handleDragEnter(event, entry)}
        @drop=${(event) => this.handleDrop(event)}
        @dragend=${(event) => this.handleDragEnd(event)}
      >
        <div class="property-grid-editor__entry-inputs">
          <div class="form-group">
            <label for="${entry.id}-label" class="form-label">${this.labelLabel}</label>
            <input
              id="${entry.id}-label"
              class="form-control form-control-sm"
              type="text"
              @change=${(event) => this.handleChange(event, 'label', entry)}
              @keyup=${(event) => this.handleChange(event, 'label', entry)}
              @paste=${(event) => this.handleChange(event, 'label', entry)}
              @focusout=${(event) => this.handleFocusOut(event, 'label', entry)}
              .value=${live(entry.label)}
            />
          </div>
          <div class="form-group">
            <label for="${entry.id}-value" class="form-label">${this.labelValue}</label>
            <input
              id="${entry.id}-value"
              class="form-control form-control-sm"
              type="text"
              @change=${(event) => this.handleChange(event, 'value', entry)}
              @keyup=${(event) => this.handleChange(event, 'value', entry)}
              @paste=${(event) => this.handleChange(event, 'value', entry)}
              @focusout=${(event) => this.handleFocusOut(event, 'value', entry)}
              .value=${live(entry.value)}
            />
          </div>
          ${(this.enableSelection || this.enableMultiSelection) ? html `
            <div class="form-check">
              <input
                id="${entry.id}-selected"
                class="form-check-input"
                type="checkbox"
                @change=${(event) => this.handleChange(event, 'selected', entry)}
                @focusout=${(event) => this.handleFocusOut(event, 'selected', entry)}
                .checked=${live(entry.selected)}
              />
              <label for="${entry.id}-selected" class="form-check-label">${this.labelSelected}</label>
            </div>
          ` : nothing}
        </div>
        ${(this.enableSorting || this.enableDeleteRow) ? html `
          <div class="property-grid-editor__entry-buttons">
            ${this.enableSorting ? html `
              <button
                class="btn btn-sm btn-default"
                title=${this.labelMove}
                draggable="true"
                @click=${(e) => this.handleMoveClick(e, entry)}
                @keydown=${this.handleMoveKeyDown}
                @dragstart=${(e) => this.handleDragStart(e, entry)}
              >
                <typo3-backend-icon identifier=${this.movedEntry === entry ? 'actions-thumbtack' : 'actions-move-move'} size="small"></typo3-backend-icon>
              </button>
            ` : nothing}
            ${this.enableDeleteRow ? html `
              <button
                class="btn btn-sm btn-default"
                title=${this.labelRemove}
                @click=${() => this.handleRemove(entry)}
              >
                <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
              </button>
            ` : nothing}
          </div>
        ` : nothing}
      </div>
    `;
    }
    handleFocusOut(event, property, entry) {
        if (this.enableLabelAsFallbackValue && property === 'label' && entry.value === '') {
            this.setEntryProperty(entry, 'value', entry.label);
        }
    }
    handleChange(event, property, entry) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.setEntryProperty(entry, property, value);
    }
    handleRemove(entry) {
        this.entries = this.entries.filter(item => item !== entry);
    }
    handleCreate() {
        const newEntry = {
            id: 'fe' + Math.floor(Math.random() * 42) + Date.now(),
            label: '',
            value: '',
            selected: false,
        };
        this.entries = [...this.entries, newEntry];
    }
    handleDragStart(event, entry) {
        event.stopImmediatePropagation();
        this.draggedEntry = entry;
        event.dataTransfer?.setData('text/plain', 'dragging');
        event.dataTransfer?.setDragImage(new Image(), 0, 0);
    }
    handleDragOver(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
    handleDragEnter(event, targetEntry) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!this.draggedEntry || this.draggedEntry === targetEntry) {
            return;
        }
        const entriesCopy = [...this.entries];
        const fromIndex = entriesCopy.indexOf(this.draggedEntry);
        const toIndex = entriesCopy.indexOf(targetEntry);
        entriesCopy.splice(fromIndex, 1);
        const insertIndex = fromIndex < toIndex ? toIndex : toIndex;
        entriesCopy.splice(insertIndex, 0, this.draggedEntry);
        this.entries = entriesCopy;
    }
    handleDrop(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.draggedEntry = null;
    }
    handleDragEnd(event) {
        event.stopImmediatePropagation();
        this.draggedEntry = null;
    }
    handleMoveClick(event, entry) {
        if (this.movedEntry === entry) {
            this.movedEntry = null;
        }
        else {
            this.movedEntry = entry;
        }
    }
    handleMoveKeyDown(event) {
        if (this.movedEntry === null) {
            return;
        }
        const handledKeys = [
            'ArrowDown',
            'ArrowUp',
            'Home',
            'End',
            'Enter',
            'Space',
            'Escape',
            'Tab',
        ];
        if (!handledKeys.includes(event.code) || event.altKey || event.ctrlKey) {
            return;
        }
        event.preventDefault();
        let direction;
        switch (event.code) {
            case 'Escape':
            case 'Enter':
            case 'Space':
                this.movedEntry = null;
                return;
            case 'ArrowUp':
                direction = -1;
                break;
            case 'ArrowDown':
                direction = 1;
                break;
            default:
                return;
        }
        const entriesCopy = [...this.entries];
        const fromIndex = entriesCopy.indexOf(this.movedEntry);
        const toIndex = fromIndex + direction;
        console.log(fromIndex, toIndex);
        if (toIndex < 0 || toIndex >= entriesCopy.length) {
            return;
        }
        entriesCopy.splice(fromIndex, 1);
        const insertIndex = fromIndex < toIndex ? toIndex : toIndex;
        entriesCopy.splice(insertIndex, 0, this.movedEntry);
        this.entries = entriesCopy;
        this.activeElementRef = event.target.closest('button');
    }
    setEntryProperty(entry, property, value) {
        const index = this.entries.indexOf(entry);
        if (index === -1) {
            return;
        }
        const updatedEntry = { ...entry };
        if (property === 'label') {
            updatedEntry.label = String(value);
        }
        if (property === 'value') {
            updatedEntry.value = String(value);
        }
        if (property === 'selected') {
            updatedEntry.selected = !!value;
            if (updatedEntry.selected === true && !this.enableMultiSelection) {
                // Deselect others
                this.entries = this.entries.map((item, i) => i === index ? updatedEntry : { ...item, selected: false });
                return;
            }
        }
        this.entries = this.entries.map((item, i) => (i === index ? updatedEntry : item));
    }
};
__decorate([
    property({ type: Array, attribute: 'entries' })
], PropertyGridEditor.prototype, "entries", void 0);
__decorate([
    property({ type: String, attribute: 'label-label' })
], PropertyGridEditor.prototype, "labelLabel", void 0);
__decorate([
    property({ type: String, attribute: 'label-value' })
], PropertyGridEditor.prototype, "labelValue", void 0);
__decorate([
    property({ type: String, attribute: 'label-selected' })
], PropertyGridEditor.prototype, "labelSelected", void 0);
__decorate([
    property({ type: String, attribute: 'label-add' })
], PropertyGridEditor.prototype, "labelAdd", void 0);
__decorate([
    property({ type: String, attribute: 'label-remove' })
], PropertyGridEditor.prototype, "labelRemove", void 0);
__decorate([
    property({ type: String, attribute: 'label-move' })
], PropertyGridEditor.prototype, "labelMove", void 0);
__decorate([
    property({ type: Boolean })
], PropertyGridEditor.prototype, "enableAddRow", void 0);
__decorate([
    property({ type: Boolean })
], PropertyGridEditor.prototype, "enableDeleteRow", void 0);
__decorate([
    property({ type: Boolean })
], PropertyGridEditor.prototype, "enableSelection", void 0);
__decorate([
    property({ type: Boolean })
], PropertyGridEditor.prototype, "enableMultiSelection", void 0);
__decorate([
    property({ type: Boolean })
], PropertyGridEditor.prototype, "enableSorting", void 0);
__decorate([
    property({ type: Boolean })
], PropertyGridEditor.prototype, "enableLabelAsFallbackValue", void 0);
__decorate([
    state()
], PropertyGridEditor.prototype, "draggedEntry", void 0);
__decorate([
    state()
], PropertyGridEditor.prototype, "movedEntry", void 0);
PropertyGridEditor = __decorate([
    customElement('typo3-form-property-grid-editor')
], PropertyGridEditor);
export { PropertyGridEditor };
