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
export var SeverityEnum;
(function (SeverityEnum) {
    SeverityEnum[SeverityEnum["notice"] = -2] = "notice";
    SeverityEnum[SeverityEnum["info"] = -1] = "info";
    SeverityEnum[SeverityEnum["ok"] = 0] = "ok";
    SeverityEnum[SeverityEnum["warning"] = 1] = "warning";
    SeverityEnum[SeverityEnum["error"] = 2] = "error";
})(SeverityEnum || (SeverityEnum = {}));
