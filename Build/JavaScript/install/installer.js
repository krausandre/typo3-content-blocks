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
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import PasswordStrength from './module/password-strength';
import { InfoBox } from './renderable/info-box';
import '@typo3/backend/element/icon-element';
import { selector } from '@typo3/core/literals';
import '@typo3/backend/element/progress-bar-element';
var Identifiers;
(function (Identifiers) {
    Identifiers["body"] = ".t3js-body";
    Identifiers["moduleContent"] = ".t3js-module-content";
    Identifiers["mainContent"] = ".t3js-installer-content";
    Identifiers["progressBar"] = ".t3js-installer-progress";
    Identifiers["databaseConnectOutput"] = ".t3js-installer-databaseConnect-output";
    Identifiers["databaseSelectOutput"] = ".t3js-installer-databaseSelect-output";
    Identifiers["databaseDataOutput"] = ".t3js-installer-databaseData-output";
})(Identifiers || (Identifiers = {}));
/**
 * Walk through the installation process of TYPO3
 */
class Installer {
    constructor() {
        this.initializeEvents();
        DocumentService.ready().then(() => {
            this.initialize();
        });
    }
    initializeEvents() {
        new RegularEvent('click', (e) => {
            e.preventDefault();
            this.showEnvironmentAndFolders();
        }).delegateTo(document, '.t3js-installer-environmentFolders-retry');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            this.executeEnvironmentAndFolders();
        }).delegateTo(document, '.t3js-installer-environmentFolders-execute');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            this.executeDatabaseConnect();
        }).delegateTo(document, '.t3js-installer-databaseConnect-execute');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            this.executeDatabaseSelect();
        }).delegateTo(document, '.t3js-installer-databaseSelect-execute');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            this.executeDatabaseData();
        }).delegateTo(document, '.t3js-installer-databaseData-execute');
        new RegularEvent('click', (e) => {
            e.preventDefault();
            this.executeDefaultConfiguration();
        }).delegateTo(document, '.t3js-installer-defaultConfiguration-execute');
        new RegularEvent('click', (evt, element) => {
            evt.preventDefault();
            const toggleTarget = document.querySelector(element.dataset.toggleTarget);
            if (element.dataset.toggleState === 'invisible') {
                element.dataset.toggleState = 'visible';
                toggleTarget.setAttribute('type', 'text');
            }
            else {
                element.dataset.toggleState = 'invisible';
                toggleTarget.setAttribute('type', 'password');
            }
        }).delegateTo(document, '.t3-install-form-password-toggle');
        // Database connect db driver selection
        new RegularEvent('change', (e, target) => {
            const driver = target.value;
            document.querySelectorAll('.t3-install-driver-data').forEach(el => el.setAttribute('hidden', ''));
            document.querySelectorAll('.t3-install-driver-data input').forEach(el => el.setAttribute('disabled', 'disabled'));
            document.querySelectorAll(selector `#${driver} input`).forEach(el => el.removeAttribute('disabled'));
            document.querySelector('#' + driver)?.removeAttribute('hidden');
        }).delegateTo(document, '#t3js-connect-database-driver');
    }
    initialize() {
        this.setProgress(0);
        this.getMainLayout();
    }
    getUrl(action) {
        let url = location.href;
        url = url.replace(location.search, '');
        if (action !== undefined) {
            url = url + '?install[action]=' + action;
        }
        return url;
    }
    setProgress(done) {
        const progressBar = document.querySelector(Identifiers.progressBar);
        if (progressBar === null) {
            return;
        }
        if (done !== 0) {
            progressBar.value = done;
            progressBar.label = `Step ${done} of 5 completed`;
        }
    }
    getMainLayout() {
        (new AjaxRequest(this.getUrl('mainLayout')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            document.querySelector(Identifiers.body).innerHTML = data.html;
            this.checkInstallerAvailable();
        });
    }
    checkInstallerAvailable() {
        (new AjaxRequest(this.getUrl('checkInstallerAvailable')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success) {
                this.checkEnvironmentAndFolders();
            }
            else {
                this.showInstallerNotAvailable();
            }
        });
    }
    showInstallerNotAvailable() {
        const outputContainer = document.querySelector(Identifiers.mainContent);
        (new AjaxRequest(this.getUrl('showInstallerNotAvailable')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                outputContainer.innerHTML = data.html;
            }
        });
    }
    checkEnvironmentAndFolders() {
        this.setProgress(1);
        (new AjaxRequest(this.getUrl('checkEnvironmentAndFolders')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkTrustedHostsPattern();
            }
            else {
                this.showEnvironmentAndFolders();
            }
        });
    }
    showEnvironmentAndFolders() {
        const outputContainer = document.querySelector(Identifiers.mainContent);
        (new AjaxRequest(this.getUrl('showEnvironmentAndFolders')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                outputContainer.innerHTML = data.html;
                const detailContainer = document.querySelector('.t3js-installer-environment-details');
                let hasMessage = false;
                if (Array.isArray(data.environmentStatusErrors)) {
                    data.environmentStatusErrors.forEach((element) => {
                        hasMessage = true;
                        detailContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
                if (Array.isArray(data.environmentStatusWarnings)) {
                    data.environmentStatusWarnings.forEach((element) => {
                        hasMessage = true;
                        detailContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
                if (Array.isArray(data.structureErrors)) {
                    data.structureErrors.forEach((element) => {
                        hasMessage = true;
                        detailContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
                if (hasMessage) {
                    detailContainer.removeAttribute('hidden');
                    document.querySelectorAll('.t3js-installer-environmentFolders-bad')
                        .forEach(el => el.removeAttribute('hidden'));
                }
                else {
                    document.querySelectorAll('.t3js-installer-environmentFolders-good')
                        .forEach(el => el.removeAttribute('hidden'));
                }
            }
        });
    }
    executeEnvironmentAndFolders() {
        (new AjaxRequest(this.getUrl('executeEnvironmentAndFolders')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkTrustedHostsPattern();
            }
            else {
                // @todo message output handling
            }
        });
    }
    checkTrustedHostsPattern() {
        (new AjaxRequest(this.getUrl('checkTrustedHostsPattern')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkDatabaseConnect();
            }
            else {
                this.executeAdjustTrustedHostsPattern();
            }
        });
    }
    executeAdjustTrustedHostsPattern() {
        (new AjaxRequest(this.getUrl('executeAdjustTrustedHostsPattern')))
            .get({ cache: 'no-cache' })
            .then(() => {
            this.checkDatabaseConnect();
        });
    }
    checkDatabaseConnect() {
        this.setProgress(2);
        (new AjaxRequest(this.getUrl('checkDatabaseConnect')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkDatabaseSelect();
            }
            else {
                this.showDatabaseConnect();
            }
        });
    }
    showDatabaseConnect() {
        const outputContainer = document.querySelector(Identifiers.mainContent);
        (new AjaxRequest(this.getUrl('showDatabaseConnect')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                outputContainer.innerHTML = data.html;
                document.querySelector('#t3js-connect-database-driver').dispatchEvent(new Event('change', { bubbles: true }));
                PasswordStrength.initialize(document.querySelector('.t3-install-form-password-strength'));
            }
        });
    }
    executeDatabaseConnect() {
        const outputContainer = document.querySelector(Identifiers.databaseConnectOutput);
        const postData = {
            'install[action]': 'executeDatabaseConnect',
            'install[token]': document.querySelector(Identifiers.moduleContent).dataset.installerDatabaseConnectExecuteToken,
        };
        for (const [name, value] of new FormData(document.querySelector(Identifiers.body + ' form'))) {
            postData[name] = value.toString();
        }
        (new AjaxRequest(this.getUrl()))
            .post(postData)
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkDatabaseSelect();
            }
            else {
                if (Array.isArray(data.status)) {
                    outputContainer.replaceChildren();
                    data.status.forEach((element) => {
                        outputContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
            }
        });
    }
    checkDatabaseSelect() {
        this.setProgress(3);
        (new AjaxRequest(this.getUrl('checkDatabaseSelect')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkDatabaseData();
            }
            else {
                this.showDatabaseSelect();
            }
        });
    }
    showDatabaseSelect() {
        const outputContainer = document.querySelector(Identifiers.mainContent);
        (new AjaxRequest(this.getUrl('showDatabaseSelect')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                outputContainer.innerHTML = data.html;
            }
        });
    }
    executeDatabaseSelect() {
        const outputContainer = document.querySelector(Identifiers.databaseSelectOutput);
        const postData = {
            'install[action]': 'executeDatabaseSelect',
            'install[token]': document.querySelector(Identifiers.moduleContent).dataset.installerDatabaseSelectExecuteToken,
        };
        for (const [name, value] of new FormData(document.querySelector(Identifiers.body + ' form'))) {
            postData[name] = value.toString();
        }
        (new AjaxRequest(this.getUrl()))
            .post(postData)
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkDatabaseRequirements();
            }
            else {
                if (Array.isArray(data.status)) {
                    data.status.forEach((element) => {
                        outputContainer.replaceChildren(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
            }
        });
    }
    checkDatabaseRequirements() {
        const outputContainer = document.querySelector(Identifiers.databaseSelectOutput);
        const postData = {
            'install[action]': 'checkDatabaseRequirements',
            'install[token]': document.querySelector(Identifiers.moduleContent).dataset.installerDatabaseCheckRequirementsExecuteToken,
        };
        for (const [name, value] of new FormData(document.querySelector(Identifiers.body + ' form'))) {
            postData[name] = value.toString();
        }
        (new AjaxRequest(this.getUrl()))
            .post(postData)
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkDatabaseData();
            }
            else {
                if (Array.isArray(data.status)) {
                    outputContainer.replaceChildren();
                    data.status.forEach((element) => {
                        outputContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
            }
        });
    }
    checkDatabaseData() {
        this.setProgress(4);
        (new AjaxRequest(this.getUrl('checkDatabaseData')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.showDefaultConfiguration();
            }
            else {
                this.showDatabaseData();
            }
        });
    }
    showDatabaseData() {
        const outputContainer = document.querySelector(Identifiers.mainContent);
        (new AjaxRequest(this.getUrl('showDatabaseData')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                outputContainer.innerHTML = data.html;
                PasswordStrength.initialize(document.querySelector('.t3-install-form-password-strength'));
            }
        });
    }
    executeDatabaseData() {
        const outputContainer = document.querySelector(Identifiers.databaseDataOutput);
        const postData = {
            'install[action]': 'executeDatabaseData',
            'install[token]': document.querySelector(Identifiers.moduleContent).dataset.installerDatabaseDataExecuteToken,
        };
        for (const [name, value] of new FormData(document.querySelector(Identifiers.body + ' form'))) {
            postData[name] = value.toString();
        }
        const progressBar = document.createElement('typo3-backend-progress-bar');
        outputContainer.replaceChildren(progressBar);
        (new AjaxRequest(this.getUrl()))
            .post(postData)
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.showDefaultConfiguration();
            }
            else {
                if (Array.isArray(data.status)) {
                    outputContainer.replaceChildren();
                    data.status.forEach((element) => {
                        outputContainer.append(InfoBox.create(element.severity, element.title, element.message));
                    });
                }
            }
        });
    }
    showDefaultConfiguration() {
        const outputContainer = document.querySelector(Identifiers.mainContent);
        this.setProgress(5);
        (new AjaxRequest(this.getUrl('showDefaultConfiguration')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                outputContainer.innerHTML = data.html;
            }
        });
    }
    executeDefaultConfiguration() {
        const postData = {
            'install[action]': 'executeDefaultConfiguration',
            'install[token]': document.querySelector(Identifiers.moduleContent).dataset.installerDefaultConfigurationExecuteToken,
        };
        for (const [name, value] of new FormData(document.querySelector(Identifiers.body + ' form'))) {
            postData[name] = value.toString();
        }
        (new AjaxRequest(this.getUrl()))
            .post(postData)
            .then(async (response) => {
            const data = await response.resolve();
            top.location.href = data.redirect;
        });
    }
}
export default new Installer();
