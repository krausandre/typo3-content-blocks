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
import { Tree } from '@typo3/backend/tree/tree';
import { html } from 'lit';
import { DataTransferTypes } from '@typo3/backend/enum/data-transfer-types';
import Modal from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import DragDropUtility from '@typo3/backend/utility/drag-drop-utility';
/**
 * A Tree based on for pages, which has a AJAX-based loading of the tree
 * and also handles search + filter via AJAX.
 */
export class PageTree extends Tree {
    constructor() {
        super();
        this.settings.defaultProperties = {
            hasChildren: false,
            nameSourceField: 'title',
            prefix: '',
            suffix: '',
            locked: false,
            loaded: false,
            overlayIcon: '',
            selectable: true,
            expanded: false,
            checked: false,
            stopPageTree: false,
        };
    }
    getDataUrl(parentNode = null) {
        if (parentNode === null) {
            return this.settings.dataUrl;
        }
        return this.settings.dataUrl + '&parent=' + parentNode.identifier + '&mount=' + parentNode.mountPoint + '&depth=' + parentNode.depth;
    }
    createNodeToggle(node) {
        const nodeStopIconIdentifier = this.isRTL() ? 'actions-caret-left' : 'actions-caret-right';
        return html `${node.stopPageTree && node.depth !== 0
            ? html `
          <span class="node-stop" @click="${(event) => { event.preventDefault(); event.stopImmediatePropagation(); document.dispatchEvent(new CustomEvent('typo3:pagetree:mountPoint', { detail: { pageId: parseInt(node.identifier, 10) } })); }}">
            <typo3-backend-icon identifier="${nodeStopIconIdentifier}" size="small"></typo3-backend-icon>
          </span>
        `
            : super.createNodeToggle(node)}`;
    }
    handleNodeDragOver(event) {
        // @todo incorporate isDropAllowed
        if (super.handleNodeDragOver(event)) {
            return true;
        }
        // @TODO Unity with parent
        if (event.dataTransfer.types.includes(DataTransferTypes.content)) {
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
            // Allow drop
            event.preventDefault();
            // Adjust allowed drop effect
            DragDropUtility.updateEventAndTooltipToReflectCopyMoveIntention(event);
            return true;
        }
        return false;
    }
    handleNodeDrop(event) {
        if (super.handleNodeDrop(event)) {
            return true;
        }
        if (event.dataTransfer.types.includes(DataTransferTypes.content)) {
            const node = this.getNodeFromDragEvent(event);
            if (node === null) {
                return false;
            }
            const newNodeData = event.dataTransfer.getData(DataTransferTypes.content);
            const parsedData = JSON.parse(newNodeData);
            // allow drop
            event.preventDefault();
            const moveElementUrl = new URL(parsedData.moveElementUrl, window.origin);
            moveElementUrl.searchParams.set('expandPage', node.identifier);
            moveElementUrl.searchParams.set('originalPid', node.identifier);
            if (DragDropUtility.isCopyModifierFromEvent(event)) {
                moveElementUrl.searchParams.set('makeCopy', '1');
            }
            Modal.advanced({
                content: moveElementUrl.toString(),
                severity: SeverityEnum.notice,
                size: Modal.sizes.large,
                type: Modal.types.iframe,
            });
            return true;
        }
        return false;
    }
}
