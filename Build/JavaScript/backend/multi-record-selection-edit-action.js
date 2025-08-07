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
import { MultiRecordSelectionAction } from '@typo3/backend/multi-record-selection-action';
/**
 * Module: @typo3/backend/multi-record-selection-edit-action
 * @exports @typo3/backend/multi-record-selection-edit-action
 */
class MultiRecordSelectionEditAction {
    constructor() {
        new RegularEvent('multiRecordSelection:action:edit', this.edit).bindTo(document);
    }
    edit(event) {
        event.preventDefault();
        const eventDetails = event.detail;
        const entityIdentifiers = MultiRecordSelectionAction.getEntityIdentifiers(eventDetails);
        if (!entityIdentifiers.length) {
            // Return in case no records to edit were found
            return;
        }
        const configuration = eventDetails.configuration;
        const tableName = configuration.tableName || '';
        if (tableName === '') {
            return;
        }
        window.location.href = top.TYPO3.settings.FormEngine.moduleUrl
            + '&edit[' + tableName + '][' + entityIdentifiers.join(',') + ']=edit'
            + '&returnUrl=' + encodeURIComponent(configuration.returnUrl || '');
    }
}
export default new MultiRecordSelectionEditAction();
