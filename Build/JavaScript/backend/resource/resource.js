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
export class Resource {
    constructor(type, identifier, name, thumbnail = null, uid = null, metaUid = null, url = null) {
        this.type = type;
        this.identifier = identifier;
        this.name = name;
        this.thumbnail = thumbnail;
        this.uid = uid;
        this.metaUid = metaUid;
        this.url = url;
    }
}
