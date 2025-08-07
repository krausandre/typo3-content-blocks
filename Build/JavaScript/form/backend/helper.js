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
import { loadModule } from '@typo3/core/java-script-item-processor';
import DocumentService from '@typo3/core/document-service';
/**
 * @exports @typo3/form/backend/helper
 */
export class Helper {
    static dispatchFormEditor(requirements, options) {
        DocumentService.ready().then(() => {
            Promise.all([
                loadModule(requirements.app),
                loadModule(requirements.mediator),
                loadModule(requirements.viewModel),
            ]).then((modules) => ((app, mediator, viewModel) => {
                window.TYPO3.FORMEDITOR_APP = app.getInstance(options, mediator, viewModel).run();
            })(...modules));
        });
    }
    static dispatchFormManager(requirements, options) {
        DocumentService.ready().then(() => {
            Promise.all([
                loadModule(requirements.app),
                loadModule(requirements.viewModel)
            ]).then((modules) => ((formManager, viewModel) => {
                window.TYPO3.FORMMANAGER_APP = formManager.getInstance(options, viewModel).run();
            })(...modules));
        });
    }
}
