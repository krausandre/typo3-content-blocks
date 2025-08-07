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
export var DataTransferTypes;
(function (DataTransferTypes) {
    DataTransferTypes["treenode"] = "application/x-typo3-treenode";
    DataTransferTypes["newTreenode"] = "application/x-typo3-new-treenode+json";
    DataTransferTypes["pages"] = "application/x-typo3-record-pages+json";
    DataTransferTypes["falResources"] = "application/x-typo3-fal-resources+json";
    DataTransferTypes["dragTooltip"] = "application/x-typo3-drag-tooltip+json";
    DataTransferTypes["content"] = "application/x-typo3-content+json";
})(DataTransferTypes || (DataTransferTypes = {}));
