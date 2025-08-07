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
 * Module: @typo3/backend/utility/drag-drop-utility
 *
 * @internal
 */
export default class DragDropUtility {
    static isCopyModifierFromEvent(event) {
        if (event.dataTransfer.dropEffect === 'copy') {
            return true;
        }
        if (event.dataTransfer.dropEffect === 'move') {
            return false;
        }
        return navigator.userAgent.includes('Mac')
            ? (event.dataTransfer.effectAllowed === 'copy' || event.altKey)
            : event.ctrlKey;
    }
    static updateEventAndTooltipToReflectCopyMoveIntention(event) {
        const isCopy = DragDropUtility.isCopyModifierFromEvent(event);
        event.dataTransfer.dropEffect = isCopy ? 'copy' : 'move';
        top.document.dispatchEvent(new CustomEvent('typo3:drag-tooltip:metadata-update', {
            detail: {
                statusIconIdentifier: isCopy ? 'actions-duplicate' : 'actions-move'
            }
        }));
    }
}
