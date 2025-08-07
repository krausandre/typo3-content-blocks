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
import DocumentService from '@typo3/core/document-service';
import { selector } from '@typo3/core/literals';
import {} from './select-tree';
import {} from './select-tree-toolbar';
import '@typo3/backend/element/icon-element';
/**
 * Module: @typo3/backend/form-engine/element/category-element
 *
 * Functionality for the category element (renders a tree view)
 *
 * @example
 * <typo3-formengine-element-category recordFieldId="some-id" treeWrapperId="some-id">
 *   ...
 * </typo3-formengine-element-category>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class CategoryElement extends HTMLElement {
    constructor() {
        super(...arguments);
        this.recordField = null;
        this.treeWrapper = null;
        this.tree = null;
        this.selectNode = (evt) => {
            const node = evt.detail.node;
            this.updateAncestorsIndeterminateState(node);
            // check all nodes again, to ensure correct display of __indeterminate state
            this.calculateIndeterminate(this.tree.nodes);
            this.saveCheckboxes();
            this.tree.setup.input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        };
        /**
         * Resets the node.__indeterminate for the whole tree.
         * It's done once after loading data.
         * Later __indeterminate state is updated just for the subset of nodes
         */
        this.loadDataAfter = (evt) => {
            this.tree.nodes = evt.detail.nodes.map((node) => {
                node.__indeterminate = false;
                return node;
            });
            this.calculateIndeterminate(this.tree.nodes);
        };
        /**
         * Sets a comma-separated list of selected nodes identifiers to configured input
         */
        this.saveCheckboxes = () => {
            this.recordField.value = this.tree.getSelectedNodes().map((node) => node.identifier).join(',');
        };
    }
    async connectedCallback() {
        if (this.tree !== null) {
            // Element is already initialized, which means the component has been rendered before. Nothing to do here.
            return;
        }
        await DocumentService.ready();
        this.recordField = this.querySelector(selector `#${this.getAttribute('recordFieldId') || ''}`);
        this.treeWrapper = this.querySelector(selector `#${this.getAttribute('treeWrapperId') || ''}`);
        if (!this.recordField || !this.treeWrapper) {
            return;
        }
        this.tree = document.createElement('typo3-backend-form-selecttree');
        this.tree.classList.add('tree-wrapper');
        this.tree.setup = {
            id: this.treeWrapper.id,
            dataUrl: this.generateDataUrl(),
            readOnlyMode: this.recordField.dataset.readOnly,
            input: this.recordField,
            exclusiveNodesIdentifiers: this.recordField.dataset.treeExclusiveKeys,
            validation: JSON.parse(this.recordField.dataset.formengineValidationRules)[0],
            expandUpToLevel: this.recordField.dataset.treeExpandUpToLevel,
            unselectableElements: []
        };
        this.treeWrapper.append(this.tree);
        this.registerTreeEventListeners();
    }
    registerTreeEventListeners() {
        this.tree.addEventListener('typo3:tree:nodes-prepared', this.loadDataAfter);
        this.tree.addEventListener('typo3:tree:node-selected', this.selectNode);
        this.tree.addEventListener('tree:initialized', () => {
            if (this.recordField.dataset.treeShowToolbar) {
                const toolbarElement = document.createElement('typo3-backend-form-selecttree-toolbar');
                toolbarElement.tree = this.tree;
                this.tree.prepend(toolbarElement);
            }
        });
    }
    generateDataUrl() {
        return TYPO3.settings.ajaxUrls.record_tree_data + '&' + new URLSearchParams({
            uid: this.recordField.dataset.uid,
            command: this.recordField.dataset.command,
            tableName: this.recordField.dataset.tablename,
            fieldName: this.recordField.dataset.fieldname,
            defaultValues: this.recordField.dataset.defaultvalues,
            overrideValues: this.recordField.dataset.overridevalues,
            recordTypeValue: this.recordField.dataset.recordtypevalue,
            flexFormSheetName: this.recordField.dataset.flexformsheetname,
            flexFormFieldName: this.recordField.dataset.flexformfieldname,
            flexFormContainerName: this.recordField.dataset.flexformcontainername,
            dataStructureIdentifier: this.recordField.dataset.datastructureidentifier,
            flexFormContainerFieldName: this.recordField.dataset.flexformcontainerfieldname,
            flexFormContainerIdentifier: this.recordField.dataset.flexformcontaineridentifier,
            flexFormSectionContainerIsNew: this.recordField.dataset.flexformsectioncontainerisnew,
        }).toString();
    }
    /**
     * Updates the __indeterminate state for ancestors of the current node
     */
    updateAncestorsIndeterminateState(node) {
        // foreach ancestor except node itself
        let __indeterminate = false;
        node.__treeParents.forEach((treeIdentifier) => {
            const TreeNodeInterface = this.tree.getNodeByTreeIdentifier(treeIdentifier);
            TreeNodeInterface.__indeterminate = (node.checked || node.__indeterminate || __indeterminate);
            // check state for the next level
            __indeterminate = (TreeNodeInterface.checked || TreeNodeInterface.__indeterminate || node.checked || node.__indeterminate);
        });
    }
    /**
     * Sets __indeterminate state for a subtree.
     * It relays on the tree to have __indeterminate state reset beforehand.
     */
    calculateIndeterminate(nodes) {
        nodes.forEach((node) => {
            if ((node.checked || node.__indeterminate) && node.__treeParents && node.__treeParents.length > 0) {
                node.__treeParents.forEach((treeParentIdentifier) => {
                    const TreeNodeInterface = this.tree.getNodeByTreeIdentifier(treeParentIdentifier);
                    TreeNodeInterface.__indeterminate = true;
                });
            }
        });
    }
}
window.customElements.define('typo3-formengine-element-category', CategoryElement);
