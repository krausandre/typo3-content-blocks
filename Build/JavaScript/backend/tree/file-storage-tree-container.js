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
import { customElement, query } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import '@typo3/backend/tree/tree-toolbar';
import { TreeNodePositionEnum } from '@typo3/backend/tree/tree-node';
import { FileStorageTree } from '@typo3/backend/tree/file-storage-tree';
import { TreeModuleState } from '@typo3/backend/tree/tree-module-state';
import ContextMenu from '@typo3/backend/context-menu';
import Notification from '@typo3/backend/notification';
import { ModuleStateStorage } from '@typo3/backend/storage/module-state-storage';
import { ModuleUtility } from '@typo3/backend/module';
import { FileListDragDropEvent } from '@typo3/filelist/file-list-dragdrop';
import { Resource } from '@typo3/backend/resource/resource';
import { DataTransferTypes } from '@typo3/backend/enum/data-transfer-types';
export const navigationComponentName = 'typo3-backend-navigation-component-filestoragetree';
/**
 * FileStorageTree which allows for drag+drop, and in-place editing, as well as
 * tree highlighting from the outside
 */
let EditableFileStorageTree = class EditableFileStorageTree extends FileStorageTree {
    constructor() {
        super(...arguments);
        this.allowNodeDrag = true;
    }
    handleNodeMove(node, target, position) {
        if (!this.isDropAllowed(target, node)) {
            return;
        }
        const options = this.getDropCommandDetails(target, node, position);
        if (options === null) {
            return;
        }
        const fileOperationCollection = FileOperationCollection.fromNodePositionOptions(options);
        const operationConflicts = fileOperationCollection.getConflictingOperationsForTreeNode(options.target);
        if (operationConflicts.length > 0) {
            operationConflicts.forEach((operation) => {
                Notification.showMessage(TYPO3.lang['drop.conflict'], TYPO3.lang['mess.drop.conflict']
                    .replace('%s', operation.resource.name)
                    .replace('%s', decodeURIComponent(options.target.identifier)), SeverityEnum.error);
            });
            return;
        }
        this.initiateDropAction(fileOperationCollection);
    }
    createDataTransferItemsFromNode(node) {
        return [
            {
                type: DataTransferTypes.treenode,
                data: this.getNodeTreeIdentifier(node),
            },
            {
                type: DataTransferTypes.falResources,
                data: JSON.stringify([
                    FileResource.fromTreeNode(node),
                ]),
            },
        ];
    }
    handleNodeDragOver(event) {
        // @todo incorporate isDropAllowed
        if (super.handleNodeDragOver(event)) {
            return true;
        }
        // @TODO Unity with parent
        if (event.dataTransfer.types.includes(DataTransferTypes.falResources)) {
            // Find the current hovered node
            // Exit when no node was hovered
            const targetNode = this.getNodeFromDragEvent(event);
            if (targetNode === null) {
                return false;
            }
            this.cleanDrag();
            // Add hover styling to the current hovered node
            // element, during the drag the default mouse over
            // is disabled by the browser
            const hoverElement = this.getElementFromNode(targetNode);
            hoverElement.classList.add('node-hover');
            // Open node with children while holding the
            // node/element over this node for 1 second
            if (targetNode.hasChildren && !targetNode.__expanded) {
                if (this.openNodeTimeout.targetNode != targetNode) {
                    this.openNodeTimeout.targetNode = targetNode;
                    clearTimeout(this.openNodeTimeout.timeout);
                    this.openNodeTimeout.timeout = setTimeout(() => {
                        this.showChildren(this.openNodeTimeout.targetNode);
                        this.openNodeTimeout.targetNode = null;
                        this.openNodeTimeout.timeout = null;
                    }, 1000);
                }
            }
            else {
                clearTimeout(this.openNodeTimeout.timeout);
                this.openNodeTimeout.targetNode = null;
                this.openNodeTimeout.timeout = null;
            }
            // allow drop
            event.preventDefault();
            return true;
        }
        return false;
    }
    getTooltipDescription(node) {
        return decodeURIComponent(node.identifier);
    }
    handleNodeDrop(event) {
        if (super.handleNodeDrop(event)) {
            return true;
        }
        if (event.dataTransfer.types.includes(DataTransferTypes.falResources)) {
            const node = this.getNodeFromDragEvent(event);
            if (node === null) {
                return false;
            }
            if (node) {
                const targetResource = FileResource.fromTreeNode(node);
                const fileOperationCollection = FileOperationCollection.fromDataTransfer(event.dataTransfer, targetResource);
                const operationConflicts = fileOperationCollection.getConflictingOperationsForTreeNode(node);
                if (operationConflicts.length > 0) {
                    operationConflicts.forEach((operation) => {
                        Notification.showMessage(TYPO3.lang['drop.conflict'], TYPO3.lang['mess.drop.conflict']
                            .replace('%s', operation.resource.name)
                            .replace('%s', decodeURIComponent(node.identifier)), SeverityEnum.error);
                    });
                    return false;
                }
                // allow drop
                event.preventDefault();
                this.initiateDropAction(fileOperationCollection);
                return true;
            }
        }
        return false;
    }
    /**
     * Prepares all the details, which node is dropped on which other, if it is inside or before
     * the target node (= droppedNode).
     */
    getDropCommandDetails(droppedNode, draggingNode, position) {
        const nodes = this.nodes;
        const identifier = draggingNode.identifier;
        let target = droppedNode /* || draggingNode*/;
        if (identifier === target.identifier) {
            return null;
        }
        if (position === TreeNodePositionEnum.BEFORE) {
            const index = nodes.indexOf(droppedNode);
            const positionAndTarget = this.setNodePositionAndTarget(index);
            if (positionAndTarget === null) {
                return null;
            }
            position = positionAndTarget.position;
            target = positionAndTarget.target;
        }
        return {
            node: draggingNode,
            identifier: identifier, // dragged node id
            target: target, // hovered node
            position: position // before, in, after
        };
    }
    /**
     * Returns position and target node where it should be added
     */
    setNodePositionAndTarget(index) {
        const nodes = this.nodes;
        const nodeOver = nodes[index];
        const nodeOverDepth = nodeOver.depth;
        if (index > 0) {
            index--;
        }
        const nodeBefore = nodes[index];
        const nodeBeforeDepth = nodeBefore.depth;
        const target = this.nodes[index];
        if (nodeBeforeDepth === nodeOverDepth) {
            return { position: TreeNodePositionEnum.AFTER, target };
        }
        else if (nodeBeforeDepth < nodeOverDepth) {
            return { position: TreeNodePositionEnum.INSIDE, target };
        }
        else {
            for (let i = index; i >= 0; i--) {
                if (nodes[i].depth === nodeOverDepth) {
                    return { position: TreeNodePositionEnum.AFTER, target: this.nodes[i] };
                }
                else if (nodes[i].depth < nodeOverDepth) {
                    return { position: TreeNodePositionEnum.AFTER, target: nodes[i] };
                }
            }
        }
        return null;
    }
    isDropAllowed(target, draggingNode) {
        if (target === draggingNode) {
            return false;
        }
        // @todo: why needed?
        if (!this.isOverRoot) {
            return false;
        }
        return true;
    }
    initiateDropAction(fileOperationCollection) {
        const detail = {
            action: 'transfer',
            resources: fileOperationCollection.getResources(),
            target: fileOperationCollection.target,
        };
        top.document.dispatchEvent(new CustomEvent(FileListDragDropEvent.transfer, { detail: detail }));
    }
};
EditableFileStorageTree = __decorate([
    customElement('typo3-backend-navigation-component-filestorage-tree')
], EditableFileStorageTree);
export { EditableFileStorageTree };
/**
 * Responsible for setting up the viewport for the Navigation Component for the File Tree
 */
let FileStorageTreeNavigationComponent = class FileStorageTreeNavigationComponent extends TreeModuleState(LitElement) {
    constructor() {
        super(...arguments);
        this.moduleStateType = 'media';
        this.refresh = () => {
            this.tree.refreshOrFilterTree();
        };
        this.selectFirstNode = () => {
            const node = this.tree.nodes[0];
            if (node) {
                this.tree.selectNode(node, true);
            }
        };
        this.loadContent = (evt) => {
            const node = evt.detail.node;
            if (!node?.checked) {
                return;
            }
            // remember the selected folder in the global state
            ModuleStateStorage.updateWithTreeIdentifier('media', decodeURIComponent(node.identifier), decodeURIComponent(node.__treeIdentifier));
            if (evt.detail.propagate === false) {
                return;
            }
            // Load the currently selected module with the updated URL
            const moduleMenu = top.TYPO3.ModuleMenu.App;
            let contentUrl = ModuleUtility.getFromName(moduleMenu.getCurrentModule()).link;
            contentUrl += contentUrl.includes('?') ? '&' : '?';
            top.TYPO3.Backend.ContentContainer.setUrl(contentUrl + 'id=' + node.identifier);
        };
        this.showContextMenu = (evt) => {
            const node = evt.detail.node;
            if (!node) {
                return;
            }
            ContextMenu.show(node.recordType, decodeURIComponent(node.identifier), 'tree', '', '', this.tree.getElementFromNode(node), evt.detail.originalEvent);
        };
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('typo3:filestoragetree:refresh', this.refresh);
        document.addEventListener('typo3:filestoragetree:selectFirstNode', this.selectFirstNode);
    }
    disconnectedCallback() {
        document.removeEventListener('typo3:filestoragetree:refresh', this.refresh);
        document.removeEventListener('typo3:filestoragetree:selectFirstNode', this.selectFirstNode);
        super.disconnectedCallback();
    }
    // disable shadow dom for now
    createRenderRoot() {
        return this;
    }
    render() {
        const treeSetup = {
            dataUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_data,
            rootlineUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_rootline,
            filterUrl: top.TYPO3.settings.ajaxUrls.filestorage_tree_filter,
            showIcons: true
        };
        return html `
      <div id="typo3-filestoragetree" class="tree">
        <typo3-backend-tree-toolbar .tree="${this.tree}" id="filestoragetree-toolbar"></typo3-backend-tree-toolbar>
        <div class="navigation-tree-container">
          <typo3-backend-navigation-component-filestorage-tree
              id="typo3-filestoragetree-tree"
              class="tree-wrapper"
              .setup=${treeSetup}
              @typo3:tree:node-selected=${this.loadContent}
              @typo3:tree:node-context=${this.showContextMenu}
              @typo3:tree:nodes-prepared=${this.selectActiveNodeInLoadedNodes}
              @tree:initialized=${this.fetchActiveNodeIfMissing}
          ></typo3-backend-navigation-component-filestorage-tree>
        </div>
      </div>
    `;
    }
    firstUpdated() {
        this.toolbar.tree = this.tree;
    }
    transformModuleStateIdentifierToNodeIdentifier(moduleStateIdentifier) {
        return encodeURIComponent(moduleStateIdentifier);
    }
    transformNodeIdentifierToModuleStateIdentifier(nodeIdentifier) {
        return decodeURIComponent(nodeIdentifier);
    }
};
__decorate([
    query('.tree-wrapper')
], FileStorageTreeNavigationComponent.prototype, "tree", void 0);
__decorate([
    query('typo3-backend-tree-toolbar')
], FileStorageTreeNavigationComponent.prototype, "toolbar", void 0);
FileStorageTreeNavigationComponent = __decorate([
    customElement('typo3-backend-navigation-component-filestoragetree')
], FileStorageTreeNavigationComponent);
export { FileStorageTreeNavigationComponent };
/**
 * Internal helper class for drag&drop handling
 */
class FileOperation {
    constructor(resource, position = TreeNodePositionEnum.INSIDE) {
        this.resource = resource;
        this.position = position;
    }
    hasConflictWithTreeNode(node) {
        return this.resource.type === 'folder' && (node.identifier === this.resource.identifier
            || node.__parents[0] == this.resource.identifier
            || node.__parents.includes(this.resource.identifier));
    }
}
class FileResource extends Resource {
    static fromTreeNode(node) {
        return new FileResource(decodeURIComponent(node.resourceType), decodeURIComponent(node.identifier), decodeURIComponent(node.name));
    }
}
class FileOperationCollection {
    constructor(operations, target) {
        this.operations = operations;
        this.target = target;
    }
    static fromDataTransfer(dataTransfer, target) {
        return FileOperationCollection.fromArray(JSON.parse(dataTransfer.getData(DataTransferTypes.falResources)), target);
    }
    static fromArray(items, target) {
        const operations = [];
        for (const item of items) {
            operations.push(new FileOperation(item, TreeNodePositionEnum.INSIDE));
        }
        return new FileOperationCollection(operations, target);
    }
    static fromNodePositionOptions(options) {
        const resource = FileResource.fromTreeNode(options.node);
        const targetResource = FileResource.fromTreeNode(options.target);
        const operations = [
            new FileOperation(resource, options.position)
        ];
        return new FileOperationCollection(operations, targetResource);
    }
    getConflictingOperationsForTreeNode(node) {
        return this.operations.filter((operation) => operation.hasConflictWithTreeNode(node));
    }
    getResources() {
        const resources = [];
        this.operations.forEach((operation) => {
            resources.push(operation.resource);
        });
        return resources;
    }
}
