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
import { default as Modal } from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import RegularEvent from '@typo3/core/event/regular-event';
class LinkvalidatorModal {
    constructor() {
        this.selector = '.t3js-linkvalidator-modal';
        this.initialize();
    }
    initialize() {
        new RegularEvent('click', function (e) {
            e.preventDefault();
            const modalContent = new DocumentFragment();
            modalContent.append(document.getElementById(`linkvalidatorModal-${this.dataset.modalIdentifier}`).content.cloneNode(true));
            const configuration = {
                type: Modal.types.default,
                title: this.dataset.modalTitle,
                size: Modal.sizes.large,
                severity: SeverityEnum.notice,
                content: modalContent,
            };
            Modal.advanced(configuration);
        }).delegateTo(document, this.selector);
    }
}
export default new LinkvalidatorModal();
