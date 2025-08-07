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
var GridEditor_1;
import DocumentService from '@typo3/core/document-service';
import { SeverityEnum } from './enum/severity';
import 'bootstrap';
import { default as Modal } from '@typo3/backend/modal';
import SecurityUtility from '@typo3/core/security-utility';
import { customElement, property } from 'lit/decorators';
import { html, LitElement, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map';
import { styleMap } from 'lit/directives/style-map';
import { ref, createRef } from 'lit/directives/ref';
import { CodeMirrorElement } from '@typo3/backend/code-editor/element/code-mirror-element';
var SlideModes;
(function (SlideModes) {
    SlideModes["none"] = "";
    SlideModes["slide"] = "slide";
    SlideModes["collect"] = "collect";
    SlideModes["collectReverse"] = "collectReverse";
})(SlideModes || (SlideModes = {}));
/**
 * Module: @typo3/backend/grid-editor
 * @exports @typo3/backend/grid-editor
 */
let GridEditor = GridEditor_1 = class GridEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.colCount = 1;
        this.rowCount = 1;
        this.readOnly = false;
        this.fieldName = '';
        this.data = [];
        this.codeMirrorConfig = {};
        this.previewAreaRef = createRef();
        this.codeMirrorRef = createRef();
        this.defaultCell = { spanned: 0, rowspan: 1, colspan: 1, name: '', colpos: '', column: undefined, identifier: '', slideMode: SlideModes.none };
        /**
         *
         * @param {Event} e
         */
        this.modalButtonClickHandler = (e) => {
            const button = e.target;
            const modal = e.currentTarget;
            if (button.name === 'cancel') {
                modal.hideModal();
            }
            else if (button.name === 'ok') {
                this.setName(modal.querySelector('.t3js-grideditor-field-name').value, modal.userData.col, modal.userData.row);
                this.setColumn(parseInt(modal.querySelector('.t3js-grideditor-field-colpos').value, 10), modal.userData.col, modal.userData.row);
                this.setIdentifier(modal.querySelector('.t3js-grideditor-field-identifier').value, modal.userData.col, modal.userData.row);
                this.setSlideMode(modal.querySelector('.t3js-grideditor-field-slide-mode').value, modal.userData.col, modal.userData.row);
                this.requestUpdate();
                this.writeConfig(this.export2LayoutRecord());
                modal.hideModal();
            }
        };
        /**
         *
         * @param {Event} e
         */
        this.addColumnHandler = (e) => {
            e.preventDefault();
            this.addColumn();
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.removeColumnHandler = (e) => {
            e.preventDefault();
            this.removeColumn();
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.addRowTopHandler = (e) => {
            e.preventDefault();
            this.addRowTop();
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.addRowBottomHandler = (e) => {
            e.preventDefault();
            this.addRowBottom();
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.removeRowTopHandler = (e) => {
            e.preventDefault();
            this.removeRowTop();
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.removeRowBottomHandler = (e) => {
            e.preventDefault();
            this.removeRowBottom();
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.linkEditorHandler = (e) => {
            e.preventDefault();
            const element = e.currentTarget;
            this.showOptions(Number(element.dataset.col), Number(element.dataset.row));
        };
        /**
         *
         * @param {Event} e
         */
        this.linkExpandRightHandler = (e) => {
            e.preventDefault();
            const element = e.currentTarget;
            this.addColspan(Number(element.dataset.col), Number(element.dataset.row));
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.linkShrinkLeftHandler = (e) => {
            e.preventDefault();
            const element = e.currentTarget;
            this.removeColspan(Number(element.dataset.col), Number(element.dataset.row));
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.linkExpandDownHandler = (e) => {
            e.preventDefault();
            const element = e.currentTarget;
            this.addRowspan(Number(element.dataset.col), Number(element.dataset.row));
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
        /**
         *
         * @param {Event} e
         */
        this.linkShrinkUpHandler = (e) => {
            e.preventDefault();
            const element = e.currentTarget;
            this.removeRowspan(Number(element.dataset.col), Number(element.dataset.row));
            this.requestUpdate();
            this.writeConfig(this.export2LayoutRecord());
        };
    }
    /**
     * Remove all markup
     *
     * @param {String} input
     * @returns {string}
     */
    static stripMarkup(input) {
        const securityUtility = new SecurityUtility();
        return securityUtility.stripHtml(input);
    }
    async connectedCallback() {
        await DocumentService.ready();
        this.field = document.querySelector('input[name="' + this.fieldName + '"]');
        this.addVisibilityObserver(this);
        super.connectedCallback();
    }
    firstUpdated() {
        this.writeConfig(this.export2LayoutRecord());
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        return html `
      <div class=${classMap({ 'grideditor': true, 'grideditor-readonly': this.readOnly })}>
        ${!this.readOnly ? this.renderControls('top', false) : nothing}
        <div class="grideditor-editor">
          <div class="t3js-grideditor">
            ${this.renderEditorGrid()}
          </div>
        </div>
        ${!this.readOnly ? this.renderControls('right', true) : nothing}
        ${!this.readOnly ? this.renderControls('bottom', false) : nothing}
        <div class="grideditor-preview">
          ${this.renderPreview()}
        </div>
      </div>
    `;
    }
    renderControls(position, vertical) {
        const addHandlerMapping = {
            top: this.addRowTopHandler,
            right: this.addColumnHandler,
            bottom: this.addRowBottomHandler
        };
        const addLocaleMapping = {
            top: TYPO3.lang.grid_addRow,
            right: TYPO3.lang.grid_addColumn,
            bottom: TYPO3.lang.grid_addRow
        };
        const removeHandlerMapping = {
            top: this.removeRowTopHandler,
            right: this.removeColumnHandler,
            bottom: this.removeRowBottomHandler
        };
        const removeLocaleMapping = {
            top: TYPO3.lang.grid_removeRow,
            right: TYPO3.lang.grid_removeColumn,
            bottom: TYPO3.lang.grid_removeRow
        };
        return html `
      <div class="grideditor-control grideditor-control-${position}">
        <div class=${classMap({ 'btn-group': !vertical, 'btn-group-vertical': vertical })}>
          <button @click=${addHandlerMapping[position]} class="btn btn-default btn-sm" title=${addLocaleMapping[position]}>
            <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
          </button>
          <button @click=${removeHandlerMapping[position]} class="btn btn-default btn-sm" title=${removeLocaleMapping[position]}>
            <typo3-backend-icon identifier="actions-minus" size="small"></typo3-backend-icon>
          </button>
        </div>
      </div>
    `;
    }
    renderEditorGrid() {
        const cells = [];
        for (let row = 0; row < this.rowCount; row++) {
            const rowData = this.data[row];
            if (rowData.length === 0) {
                continue;
            }
            for (let col = 0; col < this.colCount; col++) {
                const cell = this.data[row][col];
                if (cell.spanned === 1) {
                    continue;
                }
                cells.push(this.renderGridCell(row, col, cell));
            }
        }
        return html `
      <div class="grideditor-editor-grid">
        ${cells}
      </div>
    `;
    }
    renderGridCell(row, col, cell) {
        const styleMapping = {
            '--grideditor-cell-col': col + 1,
            '--grideditor-cell-colspan': cell.colspan,
            '--grideditor-cell-row': row + 1,
            '--grideditor-cell-rowspan': cell.rowspan
        };
        return html `
      <div class="grideditor-cell" style=${styleMap(styleMapping)}>
        <div class="grideditor-cell-actions">
        ${!this.readOnly ?
            html `
            <button
              @click=${this.linkEditorHandler}
              class="t3js-grideditor-link-editor grideditor-action grideditor-action-edit"
              data-row=${row}
              data-col=${col}
              title=${TYPO3.lang.grid_editCell}>
              <typo3-backend-icon identifier="actions-open" size="small"></typo3-backend-icon>
            </button>
            ${this.cellCanSpanRight(col, row) ?
                html `
                <button
                  @click=${this.linkExpandRightHandler}
                  class="t3js-grideditor-link-expand-right grideditor-action grideditor-action-expand-right"
                  data-row=${row}
                  data-col=${col}
                  title=${TYPO3.lang.grid_cell_merge_right}>
                  <typo3-backend-icon identifier="actions-caret-right" size="small"></typo3-backend-icon>
                </button>
              `
                : nothing}
            ${this.cellCanShrinkLeft(col, row) ?
                html `
                <button
                  @click=${this.linkShrinkLeftHandler}
                  class="t3js-grideditor-link-shrink-left grideditor-action grideditor-action-shrink-left"
                  data-row=${row}
                  data-col=${col}
                  title=${TYPO3.lang.grid_cell_split_horizontal}>
                  <typo3-backend-icon identifier="actions-caret-left" size="small"></typo3-backend-icon>
                </button>
              `
                : nothing}
            ${this.cellCanSpanDown(col, row) ?
                html `
                <button
                  @click=${this.linkExpandDownHandler}
                  class="t3js-grideditor-link-expand-down grideditor-action grideditor-action-expand-down"
                  data-row=${row}
                  data-col=${col}
                  title=${TYPO3.lang.grid_cell_merge_down}>
                  <typo3-backend-icon identifier="actions-caret-down" size="small"></typo3-backend-icon>
                </button>
              `
                : nothing}
            ${this.cellCanShrinkUp(col, row) ?
                html `
                <button
                  @click=${this.linkShrinkUpHandler}
                  class="t3js-grideditor-link-shrink-up grideditor-action grideditor-action-shrink-up"
                  data-row=${row}
                  data-col=${col}
                  title=${TYPO3.lang.grid_cell_split_vertical}>
                  <typo3-backend-icon identifier="actions-caret-up" size="small"></typo3-backend-icon>
                </button>
              `
                : nothing}
          `
            : nothing}
        </div>

        <div class="grideditor-cell-info">
          <strong>${TYPO3.lang.grid_name}:</strong>
          ${cell.name ? GridEditor_1.stripMarkup(cell.name) : TYPO3.lang.grid_notSet}
          <br/>
          <strong>${TYPO3.lang.grid_column}:</strong>
          ${typeof cell.column === 'undefined' || isNaN(cell.column) ? TYPO3.lang.grid_notSet : cell.column}
          ${cell.identifier?.length ? html `<br/><strong>${TYPO3.lang.grid_identifier}:</strong> ${cell.identifier}` : ''}
          ${(cell.slideMode?.toString() || '') !== '' ? html `<br/><strong>${TYPO3.lang.grid_slideMode}:</strong> ${cell.slideMode.toString()}` : ''}
        </div>
      </div>
    `;
    }
    renderPreview() {
        if (Object.keys(this.codeMirrorConfig).length === 0) {
            return html `
        <label>${TYPO3.lang['buttons.pageTsConfig']}</label>
        <div class="t3js-grideditor-preview-config grideditor-preview">
            <textarea class="t3js-tsconfig-preview-area form-control" rows="25" readonly ${ref(this.previewAreaRef)}></textarea>
        </div>
      `;
        }
        return html `
      <typo3-t3editor-codemirror
        class="t3js-grideditor-preview-config grideditor-preview"
        label=${this.codeMirrorConfig.label}
        panel=${this.codeMirrorConfig.panel}
        mode=${this.codeMirrorConfig.mode}
        nolazyload=true
        readonly=true
        ${ref(this.codeMirrorRef)}>
        <textarea class="t3js-tsconfig-preview-area form-control" ${ref(this.previewAreaRef)}></textarea>
      </typo3-t3editor-codemirror>
    `;
    }
    /**
     * Create a new cell from defaultCell
     * @returns {Object}
     */
    getNewCell() {
        return structuredClone(this.defaultCell);
    }
    /**
     * write data back to hidden field
     *
     * @param data
     */
    writeConfig(data) {
        this.field.value = data;
        const configLines = data.split('\n');
        let config = '';
        for (const line of configLines) {
            if (line) {
                config += '\t\t\t' + line + '\n';
            }
        }
        const content = 'mod.web_layout.BackendLayouts {\n' +
            '  exampleKey {\n' +
            '    title = Example\n' +
            '    icon = content-container-columns-2\n' +
            '    config {\n' +
            config.replace(new RegExp('\\t', 'g'), '  ') +
            '    }\n' +
            '  }\n' +
            '}\n';
        const previewArea = this.previewAreaRef.value;
        // Update previewArea value if instantiated
        if (previewArea instanceof HTMLTextAreaElement) {
            previewArea.value = content;
        }
        // Update CodeMirror content if instantiated
        const codemirror = this.codeMirrorRef.value;
        if (codemirror instanceof CodeMirrorElement) {
            codemirror.setContent(content);
        }
    }
    /**
     * Add a new row at the top
     */
    addRowTop() {
        const newRow = [];
        for (let i = 0; i < this.colCount; i++) {
            const newCell = this.getNewCell();
            newCell.name = i + 'x' + this.data.length;
            newRow[i] = newCell;
        }
        this.data.unshift(newRow);
        this.rowCount++;
    }
    /**
     * Add a new row at the bottom
     */
    addRowBottom() {
        const newRow = [];
        for (let i = 0; i < this.colCount; i++) {
            const newCell = this.getNewCell();
            newCell.name = i + 'x' + this.data.length;
            newRow[i] = newCell;
        }
        this.data.push(newRow);
        this.rowCount++;
    }
    /**
     * Removes the first row of the grid and adjusts all cells that might be effected
     * by that change. (Removing colspans)
     */
    removeRowTop() {
        if (this.rowCount <= 1) {
            return false;
        }
        const newData = [];
        for (let rowIndex = 1; rowIndex < this.rowCount; rowIndex++) {
            newData.push(this.data[rowIndex]);
        }
        // fix rowspan in former last row
        for (let colIndex = 0; colIndex < this.colCount; colIndex++) {
            if (this.data[0][colIndex].spanned === 1) {
                this.findUpperCellWidthRowspanAndDecreaseByOne(colIndex, 0);
            }
        }
        this.data = newData;
        this.rowCount--;
        return true;
    }
    /**
     * Removes the last row of the grid and adjusts all cells that might be effected
     * by that change. (Removing colspans)
     */
    removeRowBottom() {
        if (this.rowCount <= 1) {
            return false;
        }
        const newData = [];
        for (let rowIndex = 0; rowIndex < this.rowCount - 1; rowIndex++) {
            newData.push(this.data[rowIndex]);
        }
        // fix rowspan in former last row
        for (let colIndex = 0; colIndex < this.colCount; colIndex++) {
            if (this.data[this.rowCount - 1][colIndex].spanned === 1) {
                this.findUpperCellWidthRowspanAndDecreaseByOne(colIndex, this.rowCount - 1);
            }
        }
        this.data = newData;
        this.rowCount--;
        return true;
    }
    /**
     * Takes a cell and looks above it if there are any cells that have colspans that
     * spans into the given cell. This is used when a row was removed from the grid
     * to make sure that no cell with wrong colspans exists in the grid.
     *
     * @param {number} col
     * @param {number} row integer
     */
    findUpperCellWidthRowspanAndDecreaseByOne(col, row) {
        const upperCell = this.getCell(col, row - 1);
        if (!upperCell) {
            return false;
        }
        if (upperCell.spanned === 1) {
            this.findUpperCellWidthRowspanAndDecreaseByOne(col, row - 1);
        }
        else {
            if (upperCell.rowspan > 1) {
                this.removeRowspan(col, row - 1);
            }
        }
        return true;
    }
    /**
     * Removes the outermost right column from the grid.
     */
    removeColumn() {
        if (this.colCount <= 1) {
            return false;
        }
        const newData = [];
        for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
            const newRow = [];
            for (let colIndex = 0; colIndex < this.colCount - 1; colIndex++) {
                newRow.push(this.data[rowIndex][colIndex]);
            }
            if (this.data[rowIndex][this.colCount - 1].spanned === 1) {
                this.findLeftCellWidthColspanAndDecreaseByOne(this.colCount - 1, rowIndex);
            }
            newData.push(newRow);
        }
        this.data = newData;
        this.colCount--;
        return true;
    }
    /**
     * Checks if there are any cells on the left side of a given cell with a
     * rowspan that spans over the given cell.
     *
     * @param {number} col
     * @param {number} row
     */
    findLeftCellWidthColspanAndDecreaseByOne(col, row) {
        const leftCell = this.getCell(col - 1, row);
        if (!leftCell) {
            return false;
        }
        if (leftCell.spanned === 1) {
            this.findLeftCellWidthColspanAndDecreaseByOne(col - 1, row);
        }
        else {
            if (leftCell.colspan > 1) {
                this.removeColspan(col - 1, row);
            }
        }
        return true;
    }
    /**
     * Adds a column at the right side of the grid.
     */
    addColumn() {
        for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
            const newCell = this.getNewCell();
            newCell.name = this.colCount + 'x' + rowIndex;
            this.data[rowIndex].push(newCell);
        }
        this.colCount++;
    }
    /**
     * Sets the name of a certain grid element.
     *
     * @param {String} newName
     * @param {number} col
     * @param {number} row
     *
     * @returns {Boolean}
     */
    setName(newName, col, row) {
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        cell.name = GridEditor_1.stripMarkup(newName);
        return true;
    }
    /**
     * Sets the column field for a certain grid element. This is NOT the column of the
     * element itself.
     *
     * @param {number} newColumn
     * @param {number} col
     * @param {number} row
     *
     * @returns {Boolean}
     */
    setColumn(newColumn, col, row) {
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        cell.column = parseInt(newColumn.toString(), 10);
        return true;
    }
    setIdentifier(newIdentifier, col, row) {
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        cell.identifier = GridEditor_1.stripMarkup(newIdentifier);
        return true;
    }
    setSlideMode(newSlideMode, col, row) {
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        cell.slideMode = SlideModes[newSlideMode];
        return true;
    }
    /**
     * Creates an Modal with two input fields and shows it. On save, the data
     * is written into the grid element.
     *
     * @param {number} col
     * @param {number} row
     *
     * @returns {Boolean}
     */
    showOptions(col, row) {
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        let colPos;
        if (cell.column === 0) {
            colPos = 0;
        }
        else if (cell.column) {
            colPos = parseInt(cell.column.toString(), 10);
        }
        else {
            colPos = '';
        }
        const markup = document.createElement('div');
        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group');
        const label = document.createElement('label');
        label.classList.add('form-label');
        const input = document.createElement('input');
        input.classList.add('form-control');
        const nameFormGroup = formGroup.cloneNode(true);
        const nameLabel = label.cloneNode(true);
        nameLabel.innerText = TYPO3.lang.grid_nameHelp;
        nameLabel.htmlFor = 'grideditor-field-name';
        const nameInput = input.cloneNode(true);
        nameInput.id = 'grideditor-field-name';
        nameInput.type = 'text';
        nameInput.classList.add('t3js-grideditor-field-name');
        nameInput.name = 'name';
        nameInput.value = GridEditor_1.stripMarkup(cell.name) || '';
        nameFormGroup.append(nameLabel, nameInput);
        const columnFormGroup = formGroup.cloneNode(true);
        const columnLabel = label.cloneNode(true);
        columnLabel.innerText = TYPO3.lang.grid_columnHelp;
        columnLabel.htmlFor = 'grideditor-field-colpos';
        const columnInput = input.cloneNode(true);
        columnInput.type = 'text';
        columnInput.classList.add('t3js-grideditor-field-colpos');
        columnInput.id = 'grideditor-field-colpos';
        columnInput.name = 'column';
        columnInput.value = colPos.toString();
        columnFormGroup.append(columnLabel, columnInput);
        const identifierFormGroup = formGroup.cloneNode(true);
        const identifierLabel = label.cloneNode(true);
        identifierLabel.innerText = TYPO3.lang.grid_identifierHelp;
        identifierLabel.htmlFor = 'grideditor-field-identifier';
        const identifierInput = input.cloneNode(true);
        nameInput.type = 'text';
        identifierInput.classList.add('t3js-grideditor-field-identifier');
        identifierInput.id = 'grideditor-field-identifier';
        identifierInput.name = 'identifier';
        identifierInput.value = typeof (cell.identifier) === 'string' ? GridEditor_1.stripMarkup(cell.identifier) : '';
        identifierFormGroup.append(identifierLabel, identifierInput);
        const slideModeFormGroup = formGroup.cloneNode(true);
        const slideModeLabel = label.cloneNode(true);
        slideModeLabel.innerText = TYPO3.lang.grid_slideModeHelp;
        slideModeLabel.htmlFor = 'grideditor-field-slide-mode';
        const slideModeSelect = document.createElement('select');
        slideModeSelect.classList.add('form-select', 't3js-grideditor-field-slide-mode');
        slideModeSelect.id = 'grideditor-field-slide-mode';
        slideModeSelect.name = 'slideMode';
        slideModeSelect.value = GridEditor_1.stripMarkup(cell.slideMode?.toString()) || '';
        Object.keys(SlideModes).map((key) => {
            const text = key !== 'none' ? key : '';
            const value = SlideModes[key];
            const option = document.createElement('option');
            option.value = value;
            option.text = text;
            option.selected = value === cell.slideMode?.toString();
            slideModeSelect.appendChild(option);
        });
        slideModeFormGroup.append(slideModeLabel, slideModeSelect);
        markup.append(nameFormGroup, columnFormGroup, identifierFormGroup, slideModeFormGroup);
        const modal = Modal.show(TYPO3.lang.grid_windowTitle, markup, SeverityEnum.notice, [
            {
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
                text: TYPO3.lang['button.cancel'] || 'Cancel',
            },
            {
                btnClass: 'btn-primary',
                name: 'ok',
                text: TYPO3.lang['button.ok'] || 'OK',
            },
        ]);
        modal.userData.col = col;
        modal.userData.row = row;
        modal.addEventListener('button.clicked', this.modalButtonClickHandler);
        return true;
    }
    /**
     * Returns a cell element from the grid.
     *
     * @param {number} col
     * @param {number} row
     */
    getCell(col, row) {
        if (col > this.colCount - 1) {
            return false;
        }
        if (row > this.rowCount - 1) {
            return false;
        }
        if (this.data.length > row - 1 && this.data[row].length > col - 1) {
            return this.data[row][col];
        }
        return null;
    }
    /**
     * Checks whether a cell can span to the right or not. A cell can span to the right
     * if it is not in the last column and if there is no cell beside it that is
     * already overspanned by some other cell.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    cellCanSpanRight(col, row) {
        if (col === this.colCount - 1) {
            return false;
        }
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        let checkCell;
        if (cell.rowspan > 1) {
            for (let rowIndex = row; rowIndex < row + cell.rowspan; rowIndex++) {
                checkCell = this.getCell(col + cell.colspan, rowIndex);
                if (!checkCell || checkCell.spanned === 1 || checkCell.colspan > 1 || checkCell.rowspan > 1) {
                    return false;
                }
            }
        }
        else {
            checkCell = this.getCell(col + cell.colspan, row);
            if (!checkCell || cell.spanned === 1 || checkCell.spanned === 1 || checkCell.colspan > 1
                || checkCell.rowspan > 1) {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks whether a cell can span down or not.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    cellCanSpanDown(col, row) {
        if (row === this.rowCount - 1) {
            return false;
        }
        const cell = this.getCell(col, row);
        if (!cell) {
            return false;
        }
        let checkCell;
        if (cell.colspan > 1) {
            // we have to check all cells on the right side for the complete colspan
            for (let colIndex = col; colIndex < col + cell.colspan; colIndex++) {
                checkCell = this.getCell(colIndex, row + cell.rowspan);
                if (!checkCell || checkCell.spanned === 1 || checkCell.colspan > 1 || checkCell.rowspan > 1) {
                    return false;
                }
            }
        }
        else {
            checkCell = this.getCell(col, row + cell.rowspan);
            if (!checkCell || cell.spanned === 1 || checkCell.spanned === 1 || checkCell.colspan > 1
                || checkCell.rowspan > 1) {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks if a cell can shrink to the left. It can shrink if the colspan of the
     * cell is bigger than 1.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    cellCanShrinkLeft(col, row) {
        return (this.data[row][col].colspan > 1);
    }
    /**
     * Returns if a cell can shrink up. This is the case if a cell has at least
     * a rowspan of 2.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    cellCanShrinkUp(col, row) {
        return (this.data[row][col].rowspan > 1);
    }
    /**
     * Adds a colspan to a grid element.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    addColspan(col, row) {
        const cell = this.getCell(col, row);
        if (!cell || !this.cellCanSpanRight(col, row)) {
            return false;
        }
        for (let rowIndex = row; rowIndex < row + cell.rowspan; rowIndex++) {
            this.data[rowIndex][col + cell.colspan].spanned = 1;
        }
        cell.colspan += 1;
        return true;
    }
    /**
     * Adds a rowspan to grid element.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    addRowspan(col, row) {
        const cell = this.getCell(col, row);
        if (!cell || !this.cellCanSpanDown(col, row)) {
            return false;
        }
        for (let colIndex = col; colIndex < col + cell.colspan; colIndex++) {
            this.data[row + cell.rowspan][colIndex].spanned = 1;
        }
        cell.rowspan += 1;
        return true;
    }
    /**
     * Removes a colspan from a grid element.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    removeColspan(col, row) {
        const cell = this.getCell(col, row);
        if (!cell || !this.cellCanShrinkLeft(col, row)) {
            return false;
        }
        cell.colspan -= 1;
        for (let rowIndex = row; rowIndex < row + cell.rowspan; rowIndex++) {
            this.data[rowIndex][col + cell.colspan].spanned = 0;
        }
        return true;
    }
    /**
     * Removes a rowspan from a grid element.
     *
     * @param {number} col
     * @param {number} row
     * @returns {Boolean}
     */
    removeRowspan(col, row) {
        const cell = this.getCell(col, row);
        if (!cell || !this.cellCanShrinkUp(col, row)) {
            return false;
        }
        cell.rowspan -= 1;
        for (let colIndex = col; colIndex < col + cell.colspan; colIndex++) {
            this.data[row + cell.rowspan][colIndex].spanned = 0;
        }
        return true;
    }
    /**
     * Exports the current grid to a TypoScript notation that can be read by the
     * page module and is human readable.
     *
     * @returns {String}
     */
    export2LayoutRecord() {
        let result = 'backend_layout {\n\tcolCount = ' + this.colCount + '\n\trowCount = ' + this.rowCount + '\n\trows {\n';
        for (let row = 0; row < this.rowCount; row++) {
            result += '\t\t' + (row + 1) + ' {\n';
            result += '\t\t\tcolumns {\n';
            let colIndex = 0;
            for (let col = 0; col < this.colCount; col++) {
                const cell = this.getCell(col, row);
                if (cell) {
                    if (!cell.spanned) {
                        const cellName = GridEditor_1.stripMarkup(cell.name) || '';
                        colIndex++;
                        result += '\t\t\t\t' + (colIndex) + ' {\n';
                        result += '\t\t\t\t\tname = ' + ((!cellName) ? col + 'x' + row : cellName) + '\n';
                        if (cell.colspan > 1) {
                            result += '\t\t\t\t\tcolspan = ' + cell.colspan + '\n';
                        }
                        if (cell.rowspan > 1) {
                            result += '\t\t\t\t\trowspan = ' + cell.rowspan + '\n';
                        }
                        if (typeof (cell.column) === 'number') {
                            result += '\t\t\t\t\tcolPos = ' + cell.column + '\n';
                        }
                        if (typeof (cell.identifier) === 'string' && cell.identifier.length) {
                            result += '\t\t\t\t\tidentifier = ' + cell.identifier + '\n';
                        }
                        if (cell.slideMode !== undefined && cell.slideMode !== SlideModes.none) {
                            result += '\t\t\t\t\tslideMode = ' + cell.slideMode.toString() + '\n';
                        }
                        result += '\t\t\t\t}\n';
                    }
                }
            }
            result += '\t\t\t}\n';
            result += '\t\t}\n';
        }
        result += '\t}\n}\n';
        return result;
    }
    /**
     * Observe the editors' visibility, since codeMirror needs to be refreshed as soon as it becomes
     * visible in the viewport. Otherwise, if this element is not in the first visible FormEngine tab,
     * it will not display any value, unless the grid gets manually updated.
     */
    addVisibilityObserver(gridEditor) {
        if (gridEditor.offsetParent !== null) {
            // In case the editor is already visible, we don't have to add the observer
            return;
        }
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const codemirror = this.codeMirrorRef.value;
                // Update CodeMirror if instantiated
                if (entry.intersectionRatio > 0 && codemirror instanceof CodeMirrorElement) {
                    codemirror.requestUpdate();
                }
            });
        }).observe(gridEditor);
    }
};
__decorate([
    property({ type: Number })
], GridEditor.prototype, "colCount", void 0);
__decorate([
    property({ type: Number })
], GridEditor.prototype, "rowCount", void 0);
__decorate([
    property({ type: Boolean })
], GridEditor.prototype, "readOnly", void 0);
__decorate([
    property({ type: String })
], GridEditor.prototype, "fieldName", void 0);
__decorate([
    property({ type: Array })
], GridEditor.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], GridEditor.prototype, "codeMirrorConfig", void 0);
GridEditor = GridEditor_1 = __decorate([
    customElement('typo3-backend-grid-editor')
], GridEditor);
export { GridEditor };
