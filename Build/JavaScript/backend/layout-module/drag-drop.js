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
/**
 * Module: @typo3/backend/layout-module/drag-drop
 * this JS code does the drag+drop logic for the Layout module (Web => Page)
 */
import DocumentService from '@typo3/core/document-service';
import DataHandler from '../ajax-data-handler';
import Icons from '../icons';
import RegularEvent from '@typo3/core/event/regular-event';
import { DataTransferTypes } from '@typo3/backend/enum/data-transfer-types';
import BroadcastService from '@typo3/backend/broadcast-service';
import { BroadcastMessage } from '@typo3/backend/broadcast-message';
import DragDropUtility from '@typo3/backend/utility/drag-drop-utility';
var Identifiers;
(function (Identifiers) {
    Identifiers["content"] = ".t3js-page-ce";
    Identifiers["draggableContentHandle"] = ".t3js-page-ce-header[draggable=\"true\"]";
    Identifiers["dropZone"] = ".t3js-page-ce-dropzone-available";
    Identifiers["column"] = ".t3js-page-column";
    Identifiers["addContent"] = ".t3js-page-new-ce";
})(Identifiers || (Identifiers = {}));
var Classes;
(function (Classes) {
    Classes["validDropZoneClass"] = "active";
    Classes["dropPossibleHoverClass"] = "t3-page-ce-dropzone-possible";
})(Classes || (Classes = {}));
class DragDrop {
    constructor() {
        DocumentService.ready().then(() => {
            this.initialize();
        });
    }
    /**
     * initializes Drag+Drop for all content elements on the page
     */
    initialize() {
        new RegularEvent('mousedown', (e, target) => {
            const closestDenyElement = e.target.closest('a,img');
            if (closestDenyElement !== null && target.contains(closestDenyElement)) {
                // Do not enable drag&drop when event is triggered on an anchor element
                return;
            }
        }).delegateTo(document, Identifiers.draggableContentHandle);
        new RegularEvent('dragstart', this.onDragStart.bind(this)).delegateTo(document, Identifiers.draggableContentHandle);
        new RegularEvent('dragenter', this.onDragEnter.bind(this)).delegateTo(document, Identifiers.draggableContentHandle);
        new RegularEvent('dragend', this.onDragEnd.bind(this)).delegateTo(document, Identifiers.draggableContentHandle);
        new RegularEvent('dragenter', (event, target) => {
            target.classList.add(Classes.dropPossibleHoverClass);
            DragDropUtility.updateEventAndTooltipToReflectCopyMoveIntention(event);
        }).delegateTo(document, Identifiers.dropZone);
        new RegularEvent('dragover', (event) => {
            event.preventDefault();
            DragDropUtility.updateEventAndTooltipToReflectCopyMoveIntention(event);
        }).delegateTo(document, Identifiers.dropZone);
        new RegularEvent('dragleave', (event, target) => {
            event.preventDefault();
            target.classList.remove(Classes.dropPossibleHoverClass);
        }).delegateTo(document, Identifiers.dropZone);
        new RegularEvent('drop', this.onDrop.bind(this), { capture: true, passive: true }).delegateTo(document, Identifiers.dropZone);
        new RegularEvent('typo3:page-layout-drag-drop:elementChanged', this.onBroadcastElementChanged.bind(this)).bindTo(top.document);
    }
    onDragEnter(event) {
        event.preventDefault();
        DragDropUtility.updateEventAndTooltipToReflectCopyMoveIntention(event);
        this.showDropZones();
    }
    onDragStart(event, target) {
        const content = target.closest(Identifiers.content);
        event.dataTransfer.setData(DataTransferTypes.content, JSON.stringify({
            pid: this.getCurrentPageId(),
            uid: parseInt(content.dataset.uid, 10),
            language: parseInt(content.dataset.languageUid, 10),
            content: content.outerHTML,
            moveElementUrl: content.dataset.moveElementUrl,
        }));
        const metadata = this.getDragTooltipMetadataFromContentElement(content);
        event.dataTransfer.setData(DataTransferTypes.dragTooltip, JSON.stringify(metadata));
        event.dataTransfer.effectAllowed = 'copyMove';
        DragDropUtility.updateEventAndTooltipToReflectCopyMoveIntention(event);
        content.querySelector(Identifiers.dropZone).hidden = true;
    }
    onDragEnd() {
        this.hideDropZones();
    }
    /**
     * this method does the whole logic when a draggable is dropped on to a dropzone
     * sending out the request and afterwards move the HTML element in the right place.
     *
     * @param {DropEvent} event
     */
    onDrop(event, dropContainer) {
        let draggedElement;
        dropContainer.classList.remove(Classes.dropPossibleHoverClass);
        if (!event.dataTransfer.types.includes(DataTransferTypes.content)) {
            // Dropped element is not accepted
            return;
        }
        const newColumn = this.getColumnPositionForElement(dropContainer);
        const contentElementDragDropData = JSON.parse(event.dataTransfer.getData(DataTransferTypes.content));
        draggedElement = document.querySelector(`${Identifiers.content}[data-uid="${contentElementDragDropData.uid}"]`);
        if (!draggedElement) {
            draggedElement = document.createRange().createContextualFragment(contentElementDragDropData.content).firstElementChild;
        }
        if (typeof (contentElementDragDropData.uid) === 'number' && contentElementDragDropData.uid > 0) {
            const parameters = {};
            // add the information about a possible column position change
            const targetFound = dropContainer.closest(Identifiers.content).dataset.uid;
            // the item was moved to the top of the colPos, so the page ID is used here
            let targetPid;
            if (targetFound === undefined) {
                // the actual page is needed. Read it from the container into which the element was dropped.
                targetPid = parseInt(dropContainer.closest('[data-page]').dataset.page, 10);
            }
            else {
                // the negative value of the content element after where it should be moved
                targetPid = 0 - parseInt(targetFound, 10);
            }
            // the dragged elements language uid
            let language = contentElementDragDropData.language;
            if (language !== -1) {
                // new elements language must be the same as the column the element is dropped in if element is not -1
                language = parseInt(dropContainer.closest('[data-language-uid]').dataset.languageUid, 10);
            }
            let colPos = 0;
            if (targetPid !== 0) {
                colPos = newColumn;
            }
            const isCopyAction = (DragDropUtility.isCopyModifierFromEvent(event) || dropContainer.classList.contains('t3js-paste-copy'));
            const datahandlerCommand = isCopyAction ? 'copy' : 'move';
            parameters.cmd = {
                tt_content: {
                    [contentElementDragDropData.uid]: {
                        [datahandlerCommand]: {
                            action: 'paste',
                            target: targetPid,
                            update: {
                                colPos: colPos,
                                sys_language_uid: language,
                            },
                        }
                    }
                }
            };
            this.ajaxAction(parameters, isCopyAction).then(() => {
                // insert draggable on the new position
                if (!dropContainer.parentElement.classList.contains(Identifiers.content.substring(1))) {
                    dropContainer.closest(Identifiers.dropZone).after(draggedElement);
                }
                else {
                    dropContainer.closest(Identifiers.content).after(draggedElement);
                }
                this.broadcast('elementChanged', {
                    pid: contentElementDragDropData.pid,
                    uid: contentElementDragDropData.uid,
                    targetPid: this.getCurrentPageId(),
                    action: isCopyAction ? 'copy' : 'move',
                });
                const languageDescriber = document.querySelector(`.t3-page-column-lang-name[data-language-uid="${language}"]`);
                if (languageDescriber === null) {
                    return;
                }
                const newFlagIdentifier = languageDescriber.dataset.flagIdentifier;
                const newLanguageTitle = languageDescriber.dataset.languageTitle;
                Icons.getIcon(newFlagIdentifier, Icons.sizes.small).then((markup) => {
                    const flagIcon = draggedElement.querySelector('.t3js-flag');
                    flagIcon.title = newLanguageTitle;
                    flagIcon.innerHTML = markup;
                });
            });
        }
    }
    onBroadcastElementChanged(event) {
        if (event.detail.payload.pid !== this.getCurrentPageId()) {
            return;
        }
        if (event.detail.payload.targetPid === event.detail.payload.pid) {
            return;
        }
        if (event.detail.payload.action === 'move') {
            document.querySelector(`${Identifiers.content}[data-uid="${event.detail.payload.uid}"]`).remove();
        }
    }
    /**
     * this method does the actual AJAX request for both, the move and the copy action.
     *
     * @param {Parameters} parameters
     * @param {boolean} isCopyAction
     * @private
     */
    ajaxAction(parameters, isCopyAction) {
        const table = Object.keys(parameters.cmd).shift();
        const uid = parseInt(Object.keys(parameters.cmd[table]).shift(), 10);
        const eventData = { component: 'dragdrop', action: isCopyAction ? 'copy' : 'move', table, uid };
        const gridContainer = document.querySelector('.t3-grid-container');
        return DataHandler.process(parameters, eventData).then((result) => {
            if (result.hasErrors) {
                throw result.messages;
            }
            if (isCopyAction || (gridContainer?.dataset.defaultLanguageBinding === '1')) {
                self.location.reload();
            }
        });
    }
    /**
     * returns the next "upper" container colPos parameter inside the code
     * @param element HTMLElement
     * @return int|null the colPos
     */
    getColumnPositionForElement(element) {
        const columnContainer = element.closest('[data-colpos]');
        if (columnContainer !== null && columnContainer.dataset.colpos !== undefined) {
            return parseInt(columnContainer.dataset.colpos, 10);
        }
        return false;
    }
    getDragTooltipMetadataFromContentElement(contentElement) {
        let description, iconIdentifier;
        const thumbnails = [];
        const contentElementTitle = contentElement.querySelector('.t3-page-ce-header-title');
        const title = contentElementTitle.innerText;
        const contentElementPreview = contentElement.querySelector('.element-preview');
        if (contentElementPreview) {
            description = contentElementPreview.innerText;
            if (description.length > 80) {
                description = description.substring(0, 80) + '...';
            }
        }
        const contentElementIcon = contentElement.querySelector('.t3js-icon');
        if (contentElementIcon) {
            iconIdentifier = contentElementIcon.dataset.identifier;
        }
        const contentImagePreviews = contentElement.querySelectorAll('.preview-thumbnails-element-image img');
        if (contentImagePreviews.length > 0) {
            contentImagePreviews.forEach((image) => {
                thumbnails.push({
                    src: image.src,
                    height: image.height,
                    width: image.width,
                });
            });
        }
        return {
            statusIconIdentifier: 'actions-move',
            tooltipIconIdentifier: iconIdentifier,
            tooltipLabel: title,
            tooltipDescription: description,
            thumbnails: thumbnails,
        };
    }
    getCurrentPageId() {
        return parseInt(document.querySelector('[data-page]').dataset.page, 10);
    }
    broadcast(eventName, payload) {
        BroadcastService.post(new BroadcastMessage('page-layout-drag-drop', eventName, payload || {}));
    }
    showDropZones() {
        document.querySelectorAll(Identifiers.dropZone).forEach((element) => {
            element.hidden = false;
            const addContentButton = element.parentElement.querySelector(Identifiers.addContent);
            if (addContentButton !== null) {
                addContentButton.hidden = true;
                element.classList.add(Classes.validDropZoneClass);
            }
        });
    }
    hideDropZones() {
        document.querySelectorAll(Identifiers.dropZone).forEach((element) => {
            element.hidden = true;
            const addContentButton = element.parentElement.querySelector(Identifiers.addContent);
            if (addContentButton !== null) {
                addContentButton.hidden = false;
            }
            element.classList.remove(Classes.validDropZoneClass);
        });
    }
}
export default new DragDrop();
