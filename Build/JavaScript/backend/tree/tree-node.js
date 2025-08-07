/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
export var TreeNodeCommandEnum;
(function (TreeNodeCommandEnum) {
    TreeNodeCommandEnum["COPY"] = "copy";
    TreeNodeCommandEnum["EDIT"] = "edit";
    TreeNodeCommandEnum["MOVE"] = "move";
    TreeNodeCommandEnum["DELETE"] = "delete";
    TreeNodeCommandEnum["NEW"] = "new";
})(TreeNodeCommandEnum || (TreeNodeCommandEnum = {}));
export var TreeNodePositionEnum;
(function (TreeNodePositionEnum) {
    TreeNodePositionEnum["INSIDE"] = "inside";
    TreeNodePositionEnum["BEFORE"] = "before";
    TreeNodePositionEnum["AFTER"] = "after";
})(TreeNodePositionEnum || (TreeNodePositionEnum = {}));
