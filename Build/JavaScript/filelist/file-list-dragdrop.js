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
import RegularEvent from '@typo3/core/event/regular-event';
import { MultiRecordSelectionSelectors } from '@typo3/backend/multi-record-selection';
import { FileListActionSelector, FileListActionUtility } from '@typo3/filelist/file-list-actions';
import { DataTransferTypes } from '@typo3/backend/enum/data-transfer-types';
export var FileListDragDropEvent;
(function (FileListDragDropEvent) {
    FileListDragDropEvent["transfer"] = "typo3:filelist:resource:dragdrop:transfer";
})(FileListDragDropEvent || (FileListDragDropEvent = {}));
class FileListDragDrop {
    constructor() {
        this.previewSize = 32;
        const selector = FileListActionSelector.elementSelector + '[draggable="true"]';
        new RegularEvent('dragstart', (event, target) => {
            const selectedItems = [];
            let icon = '';
            let label = '';
            const checkedItems = document.querySelectorAll(MultiRecordSelectionSelectors.checkboxSelector + ':checked');
            if (checkedItems.length) {
                checkedItems.forEach((checkbox) => {
                    if (checkbox.checked) {
                        const element = checkbox.closest(FileListActionSelector.elementSelector);
                        element.dataset.filelistDragdropTransferItem = 'true';
                        const resource = FileListActionUtility.getResourceForElement(element);
                        selectedItems.push(resource);
                        label = element.dataset.filelistName;
                        icon = element.dataset.filelistIcon;
                    }
                });
            }
            else {
                const element = target.closest(FileListActionSelector.elementSelector);
                element.dataset.filelistDragdropTransferItem = 'true';
                const resource = FileListActionUtility.getResourceForElement(element);
                selectedItems.push(resource);
                label = element.dataset.filelistName;
                icon = element.dataset.filelistIcon;
            }
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData(DataTransferTypes.falResources, JSON.stringify(selectedItems));
            const metadata = {
                tooltipIconIdentifier: selectedItems.length > 1 ? 'apps-clipboard-images' : icon,
                tooltipLabel: selectedItems.length > 1 ? this.getPreviewLabel(selectedItems) : label,
                thumbnails: this.getPreviewItems(selectedItems),
            };
            event.dataTransfer.setData(DataTransferTypes.dragTooltip, JSON.stringify(metadata));
        }).delegateTo(document, selector);
        new RegularEvent('dragover', (event, target) => {
            const resource = FileListActionUtility.getResourceForElement(target);
            if (this.isDropAllowedOnResoruce(resource)) {
                event.dataTransfer.dropEffect = 'move';
                event.preventDefault();
                target.classList.add('success');
            }
        }, { capture: true }).delegateTo(document, selector);
        new RegularEvent('drop', (event, target) => {
            const detail = {
                action: 'transfer',
                resources: JSON.parse(event.dataTransfer.getData(DataTransferTypes.falResources) ?? '{}'),
                target: FileListActionUtility.getResourceForElement(target),
            };
            top.document.dispatchEvent(new CustomEvent(FileListDragDropEvent.transfer, { detail: detail }));
        }, { capture: true, passive: true }).delegateTo(document, selector);
        new RegularEvent('dragend', ( /*event: DragEvent*/) => {
            this.reset();
        }, { capture: true, passive: true }).delegateTo(document, selector);
        new RegularEvent('dragleave', (event, target) => {
            target.classList.remove('success');
        }, { capture: true, passive: true }).delegateTo(document, selector);
    }
    getPreviewItems(selectedItems) {
        return selectedItems
            .filter((item) => item.thumbnail !== null)
            .map((item) => {
            return {
                src: item.thumbnail,
                width: this.previewSize,
                height: this.previewSize,
            };
        });
    }
    getPreviewLabel(selectedItems) {
        // Counter
        const previewItems = selectedItems.filter((item) => item.thumbnail !== null);
        const count = selectedItems.length - previewItems.length;
        if (count > 0) {
            return (previewItems.length > 0 ? '+' : '') + count.toString();
        }
        return '';
    }
    reset() {
        document.querySelectorAll(FileListActionSelector.elementSelector).forEach((element) => {
            delete element.dataset.filelistDragdropTransferItem;
            element.classList.remove('success');
        });
    }
    isDropAllowedOnResoruce(resource) {
        const element = document.querySelector(FileListActionSelector.elementSelector + '[data-filelist-identifier="' + resource.identifier + '"]');
        return !('filelistDragdropTransferItem' in element.dataset) && resource.type === 'folder';
    }
}
export default new FileListDragDrop();
