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
import 'bootstrap';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { AbstractInteractableModule } from '../abstract-interactable-module';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import AjaxQueue from '../../ajax/ajax-queue';
import Router from '../../router';
import RegularEvent from '@typo3/core/event/regular-event';
var Identifiers;
(function (Identifiers) {
    Identifiers["extensionContainer"] = ".t3js-extensionScanner-extension";
    Identifiers["numberOfFiles"] = ".t3js-extensionScanner-number-of-files";
    Identifiers["scanSingleTrigger"] = ".t3js-extensionScanner-scan-single";
    Identifiers["extensionScanButton"] = ".t3js-extensionScanner-scan-all";
})(Identifiers || (Identifiers = {}));
class ExtensionScanner extends AbstractInteractableModule {
    constructor() {
        super(...arguments);
        this.listOfAffectedRestFileHashes = [];
    }
    initialize(currentModal) {
        super.initialize(currentModal);
        Promise.all([
            this.loadModuleFrameAgnostic('@typo3/backend/element/progress-bar-element.js'),
        ]).then(() => {
            this.getData();
        });
        new RegularEvent('typo3-modal-hide', () => {
            AjaxQueue.flush();
        }).bindTo(currentModal);
        new RegularEvent('click', (event, target) => {
            // Scan a single extension by clicking "Rescan"
            event.preventDefault();
            const extension = target.closest(Identifiers.extensionContainer).dataset.extension;
            this.scanSingleExtension(extension);
        }).delegateTo(currentModal, Identifiers.scanSingleTrigger);
        new RegularEvent('click', (event) => {
            // Scan all button
            event.preventDefault();
            this.setModalButtonsState(false);
            const extensions = currentModal.querySelectorAll(Identifiers.extensionContainer);
            this.scanAll(extensions);
        }).delegateTo(currentModal, Identifiers.extensionScanButton);
    }
    getData() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('extensionScannerGetData'))).get().then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                modalContent.innerHTML = data.html;
                Modal.setButtons(data.buttons);
                this.setupEventListeners();
            }
            else {
                Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    setupEventListeners() {
        this.currentModal.querySelectorAll(Identifiers.extensionContainer).forEach((extensionContainer) => {
            new RegularEvent('show.bs.collapse', (event) => {
                // Scan a single extension by opening the panel
                const target = event.currentTarget;
                if (typeof target.dataset.scanned === 'undefined') {
                    const extension = target.dataset.extension;
                    this.scanSingleExtension(extension);
                    target.dataset.scanned = String(true);
                }
            }).bindTo(extensionContainer);
        });
    }
    getExtensionSelector(extension) {
        return Identifiers.extensionContainer + '-' + extension;
    }
    async scanAll(extensions) {
        extensions.forEach(extensionContainer => {
            extensionContainer.classList.remove('panel-danger', 'panel-warning', 'panel-success');
            const panelProgress = extensionContainer.querySelector('.panel-progress-bar');
            panelProgress.style.width = String(0);
            panelProgress.setAttribute('aria-valuenow', String(0));
            panelProgress.querySelector('span').innerText = '0%';
        });
        this.setProgressForAll();
        const scannerPromises = [...extensions].map(async (element) => {
            const extension = element.dataset.extension;
            try {
                await this.scanSingleExtension(extension);
            }
            finally {
                element.dataset.scanned = String(true);
            }
        });
        try {
            await Promise.allSettled(scannerPromises);
        }
        finally {
            this.setModalButtonsState(true);
            Notification.success('Scan finished', 'All extensions have been scanned.');
            try {
                const response = await new AjaxRequest(Router.getUrl()).post({
                    install: {
                        action: 'extensionScannerMarkFullyScannedRestFiles',
                        token: this.getModuleContent().dataset.extensionScannerMarkFullyScannedRestFilesToken,
                        hashes: Array.from(new Set(this.listOfAffectedRestFileHashes)),
                    },
                });
                const data = await response.resolve();
                if (data.success === true) {
                    Notification.success('Marked not affected files', 'Marked ' + data.markedAsNotAffected + ' ReST files as not affected.');
                }
            }
            catch (error) {
                Router.handleAjaxError(error, this.getModalBody());
            }
        }
    }
    setStatusMessageForScan(extension, doneFiles, numberOfFiles) {
        const extensionContainer = this.findInModal(this.getExtensionSelector(extension));
        const numberOfFilesElement = extensionContainer.querySelector(Identifiers.numberOfFiles);
        numberOfFilesElement.innerText = 'Checked ' + doneFiles + ' of ' + numberOfFiles + ' files';
    }
    setProgressForScan(extension, doneFiles, numberOfFiles) {
        const percent = (doneFiles / numberOfFiles) * 100;
        const extensionContainer = this.findInModal(this.getExtensionSelector(extension));
        const panelProgress = extensionContainer.querySelector('.panel-progress-bar');
        panelProgress.style.width = percent + '%';
        panelProgress.setAttribute('aria-valuenow', String(percent));
        panelProgress.querySelector('span').innerText = percent + '%';
    }
    /**
     * @todo: this method should be called by an event handler with fine-grained information (e.g. is the scan still in progress?)
     */
    setProgressForAll() {
        const numberOfExtensions = this.currentModal.querySelectorAll(Identifiers.extensionContainer).length;
        const numberOfScannedExtensions = this.currentModal.querySelectorAll(Identifiers.extensionContainer + '.t3js-extensionscan-finished').length;
        const inProgressLabel = `Scanning extensions (${numberOfScannedExtensions} of ${numberOfExtensions} done)…`;
        const extensionProgressBar = this.findInModal('.t3js-extensionScanner-progress-all-extension');
        extensionProgressBar.removeAttribute('hidden');
        extensionProgressBar.max = numberOfExtensions;
        extensionProgressBar.value = numberOfScannedExtensions;
        extensionProgressBar.label = inProgressLabel;
    }
    /**
     * Handle a single extension scan
     */
    async scanSingleExtension(extension) {
        const executeToken = this.getModuleContent().dataset.extensionScannerFilesToken;
        const modalContent = this.getModalBody();
        const extensionContainer = this.findInModal(this.getExtensionSelector(extension));
        const hitTemplate = '#t3js-extensionScanner-file-hit-template';
        const restTemplate = '#t3js-extensionScanner-file-hit-rest-template';
        let hitFound = false;
        extensionContainer.classList.add('panel-default');
        extensionContainer.classList.remove('panel-danger', 'panel-warning', 'panel-success', 't3js-extensionscan-finished');
        extensionContainer.dataset.hasRun = String('true');
        const scanSingle = extensionContainer.querySelector('.t3js-extensionScanner-scan-single');
        scanSingle.innerText = 'Scanning...';
        scanSingle.disabled = true;
        extensionContainer.querySelector('.t3js-extensionScanner-extension-body-loc').innerText = '0';
        extensionContainer.querySelector('.t3js-extensionScanner-extension-body-ignored-files').innerText = '0';
        extensionContainer.querySelector('.t3js-extensionScanner-extension-body-ignored-lines').innerText = '0';
        this.setProgressForAll();
        try {
            const response = await new AjaxRequest(Router.getUrl()).post({
                install: {
                    action: 'extensionScannerFiles',
                    token: executeToken,
                    extension: extension,
                },
            });
            const data = await response.resolve();
            if (data.success === true && Array.isArray(data.files)) {
                const numberOfFiles = data.files.length;
                if (numberOfFiles <= 0) {
                    Notification.warning('No files found', 'The extension ' + extension + ' contains no scannable files');
                    return;
                }
                this.setStatusMessageForScan(extension, 0, numberOfFiles);
                extensionContainer.querySelector('.t3js-extensionScanner-extension-body').innerText = '';
                extensionContainer.classList.add('panel-has-progress');
                let doneFiles = 0;
                const filePromises = data.files.map((file) => new Promise((resolve, reject) => {
                    AjaxQueue.add({
                        method: 'POST',
                        data: {
                            install: {
                                action: 'extensionScannerScanFile',
                                token: this.getModuleContent().dataset.extensionScannerScanFileToken,
                                extension: extension,
                                file: file,
                            },
                        },
                        url: Router.getUrl(),
                        onfulfilled: async (response) => {
                            const fileData = await response.resolve();
                            doneFiles++;
                            this.setStatusMessageForScan(extension, doneFiles, numberOfFiles);
                            this.setProgressForScan(extension, doneFiles, numberOfFiles);
                            if (fileData.success && Array.isArray(fileData.matches)) {
                                fileData.matches.forEach((match) => {
                                    hitFound = true;
                                    const aMatch = modalContent.querySelector(hitTemplate + ' .panel').cloneNode(true);
                                    aMatch.querySelector('.t3js-extensionScanner-hit-file-panel-head').setAttribute('data-bs-target', '#collapse' + match.uniqueId);
                                    aMatch.querySelector('.t3js-extensionScanner-hit-file-panel-head').setAttribute('aria-controls', 'collapse' + match.uniqueId);
                                    aMatch.querySelector('.t3js-extensionScanner-hit-file-panel-body').setAttribute('id', 'collapse' + match.uniqueId);
                                    aMatch.querySelector('.t3js-extensionScanner-hit-filename').innerText = file;
                                    aMatch.querySelector('.t3js-extensionScanner-hit-message').innerText = match.message;
                                    if (match.indicator === 'strong') {
                                        aMatch.querySelector('.t3js-extensionScanner-hit-file-panel-head .t3js-extensionScanner-hit-badges')
                                            .innerHTML += '<span class="badge badge-danger" title="Reliable match, false positive unlikely">strong</span>';
                                    }
                                    else {
                                        aMatch.querySelector('.t3js-extensionScanner-hit-file-panel-head .t3js-extensionScanner-hit-badges')
                                            .innerHTML += '<span class="badge badge-warning" title="Probable match, but can be a false positive">weak</span>';
                                    }
                                    if (match.silenced === true) {
                                        aMatch.querySelector('.t3js-extensionScanner-hit-file-panel-head .t3js-extensionScanner-hit-badges')
                                            .innerHTML += '<span class="badge badge-info" title="Match has been annotated by extension author' +
                                            ' as false positive match">silenced</span>';
                                    }
                                    aMatch.querySelector('.t3js-extensionScanner-hit-file-lineContent').innerText = match.lineContent;
                                    aMatch.querySelector('.t3js-extensionScanner-hit-file-line').innerText = match.line + ': ';
                                    if (Array.isArray(match.restFiles)) {
                                        match.restFiles.forEach((restFile) => {
                                            const aRest = modalContent.querySelector(restTemplate + ' .panel').cloneNode(true);
                                            aRest.querySelector('.t3js-extensionScanner-hit-rest-panel-head').setAttribute('data-bs-target', '#collapse' + restFile.uniqueId);
                                            aRest.querySelector('.t3js-extensionScanner-hit-rest-panel-head').setAttribute('aria-controls', 'collapse' + restFile.uniqueId);
                                            aRest.querySelector('.t3js-extensionScanner-hit-rest-panel-head .t3js-extensionScanner-hit-rest-badge').innerText = restFile.version;
                                            aRest.querySelector('.t3js-extensionScanner-hit-rest-panel-body').setAttribute('id', 'collapse' + restFile.uniqueId);
                                            aRest.querySelector('.t3js-extensionScanner-hit-rest-headline').innerText = restFile.headline;
                                            aRest.querySelector('.t3js-extensionScanner-hit-rest-body').innerText = restFile.content;
                                            aRest.classList.add('panel-' + restFile.class);
                                            aMatch.querySelector('.t3js-extensionScanner-hit-file-rest-container').append(aRest);
                                            this.listOfAffectedRestFileHashes.push(restFile.file_hash);
                                        });
                                    }
                                    const panelClass = aMatch.querySelectorAll('.panel-breaking, .t3js-extensionScanner-hit-file-rest-container').length > 0
                                        ? 'panel-danger'
                                        : 'panel-warning';
                                    aMatch.classList.add(panelClass);
                                    aMatch.classList.remove('panel-default');
                                    const extensionBody = extensionContainer.querySelector('.t3js-extensionScanner-extension-body');
                                    extensionBody.classList.remove('hide');
                                    extensionBody.append(aMatch);
                                    extensionContainer.classList.remove('panel-default');
                                    if (panelClass === 'panel-danger') {
                                        extensionContainer.classList.remove('panel-warning');
                                        extensionContainer.classList.add(panelClass);
                                    }
                                    if (panelClass === 'panel-warning' && !extensionContainer.classList.contains('panel-danger')) {
                                        extensionContainer.classList.add(panelClass);
                                    }
                                });
                            }
                            if (fileData.success) {
                                const currentLinesOfCode = parseInt(extensionContainer.querySelector('.t3js-extensionScanner-extension-body-loc').innerText, 10);
                                extensionContainer.querySelector('.t3js-extensionScanner-extension-body-loc')
                                    .innerText = String(currentLinesOfCode + fileData.effectiveCodeLines);
                                if (fileData.isFileIgnored) {
                                    const currentIgnoredFiles = parseInt(extensionContainer.querySelector('.t3js-extensionScanner-extension-body-ignored-files').innerText, 10);
                                    extensionContainer.querySelector('.t3js-extensionScanner-extension-body-ignored-files').innerText = String(currentIgnoredFiles + 1);
                                }
                                const currentIgnoredLines = parseInt(extensionContainer.querySelector('.t3js-extensionScanner-extension-body-ignored-lines').innerText, 10);
                                extensionContainer.querySelector('.t3js-extensionScanner-extension-body-ignored-lines')
                                    .innerText = String(currentIgnoredLines + fileData.ignoredLines);
                            }
                            resolve();
                        },
                        onrejected: (reason) => {
                            reject();
                            doneFiles = doneFiles + 1;
                            this.setStatusMessageForScan(extension, doneFiles, numberOfFiles);
                            this.setProgressForScan(extension, doneFiles, numberOfFiles);
                            extensionContainer.classList.remove('panel-has-progress');
                            this.setProgressForAll();
                            console.error(reason);
                        },
                    });
                }));
                await Promise.allSettled(filePromises);
                if (!hitFound) {
                    extensionContainer.classList.remove('panel-default');
                    extensionContainer.classList.add('panel-success');
                }
                extensionContainer.classList.add('t3js-extensionscan-finished');
                extensionContainer.classList.remove('panel-has-progress');
                this.setProgressForAll();
                const scanSingle = extensionContainer.querySelector('.t3js-extensionScanner-scan-single');
                scanSingle.innerText = 'Rescan';
                scanSingle.disabled = false;
            }
            else {
                Notification.error('Oops, an error occurred', 'Please look at the browser console output for details');
                console.error(data);
            }
        }
        catch (error) {
            Router.handleAjaxError(error, modalContent);
        }
    }
}
export default new ExtensionScanner();
