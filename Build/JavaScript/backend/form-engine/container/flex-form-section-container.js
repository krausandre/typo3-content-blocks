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
import { Collapse } from 'bootstrap';
import Sortable from 'sortablejs';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import DocumentService from '@typo3/core/document-service';
import FlexFormContainerContainer from './flex-form-container-container';
import FormEngine from '@typo3/backend/form-engine';
import RegularEvent from '@typo3/core/event/regular-event';
import { JavaScriptItemProcessor } from '@typo3/core/java-script-item-processor';
var Selectors;
(function (Selectors) {
    Selectors["toggleAllSelector"] = ".t3-form-flexsection-toggle";
    Selectors["addContainerSelector"] = ".t3js-flex-container-add";
    Selectors["actionFieldSelector"] = ".t3js-flex-control-action";
    Selectors["sectionContainerSelector"] = ".t3js-flex-section";
    Selectors["sectionContentContainerSelector"] = ".t3js-flex-section-content";
    Selectors["sectionContainerLabelSelector"] = ".t3js-formengine-label";
    Selectors["sortContainerButtonSelector"] = ".t3js-sortable-handle";
})(Selectors || (Selectors = {}));
class FlexFormSectionContainer {
    /**
     * @param {string} elementId
     */
    constructor(elementId) {
        this.allowRestructure = false;
        this.flexformContainerContainers = [];
        this.updateSorting = (e) => {
            const actionFields = this.container.querySelectorAll(Selectors.actionFieldSelector);
            actionFields.forEach((element, key) => {
                element.value = key.toString();
            });
            this.updateToggleAllState();
            this.flexformContainerContainers.splice(e.newIndex, 0, this.flexformContainerContainers.splice(e.oldIndex, 1)[0]);
            document.dispatchEvent(new Event('formengine:flexform:sorting-changed'));
        };
        DocumentService.ready().then((document) => {
            this.container = document.getElementById(elementId);
            this.sectionContainer = this.container.querySelector(this.container.dataset.section);
            this.allowRestructure = this.sectionContainer.dataset.t3FlexAllowRestructure === '1';
            this.registerEvents();
            this.registerContainers();
        });
    }
    static getCollapseInstance(container) {
        return Collapse.getInstance(container) ?? new Collapse(container, { toggle: false });
    }
    getContainer() {
        return this.container;
    }
    getSectionContainer() {
        return this.sectionContainer;
    }
    isRestructuringAllowed() {
        return this.allowRestructure;
    }
    registerEvents() {
        if (this.allowRestructure) {
            this.registerSortable();
            this.registerContainerDeleted();
        }
        this.registerToggleAll();
        this.registerCreateNewContainer();
        this.registerPanelToggle();
    }
    registerContainers() {
        const sectionContainerContainers = this.container.querySelectorAll(Selectors.sectionContainerSelector);
        for (const sectionContainerContainer of sectionContainerContainers) {
            this.flexformContainerContainers.push(new FlexFormContainerContainer(this, sectionContainerContainer));
        }
        this.updateToggleAllState();
    }
    getToggleAllButton() {
        return this.container.querySelector(Selectors.toggleAllSelector);
    }
    registerSortable() {
        new Sortable(this.sectionContainer, {
            group: this.sectionContainer.id,
            handle: Selectors.sortContainerButtonSelector,
            onSort: this.updateSorting,
        });
    }
    registerToggleAll() {
        new RegularEvent('click', (e) => {
            const trigger = e.target;
            const showAll = trigger.dataset.expandAll === 'true';
            const collapsibles = this.container.querySelectorAll(Selectors.sectionContentContainerSelector);
            for (const collapsible of collapsibles) {
                if (showAll) {
                    FlexFormSectionContainer.getCollapseInstance(collapsible).show();
                }
                else {
                    FlexFormSectionContainer.getCollapseInstance(collapsible).hide();
                }
            }
        }).bindTo(this.getToggleAllButton());
    }
    registerCreateNewContainer() {
        new RegularEvent('click', (e, target) => {
            e.preventDefault();
            this.createNewContainer(target.dataset);
        }).delegateTo(this.container, Selectors.addContainerSelector);
    }
    createNewContainer(dataset) {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.record_flex_container_add)).post({
            vanillaUid: dataset.vanillauid,
            databaseRowUid: dataset.databaserowuid,
            command: dataset.command,
            tableName: dataset.tablename,
            fieldName: dataset.fieldname,
            recordTypeValue: dataset.recordtypevalue,
            dataStructureIdentifier: JSON.parse(dataset.datastructureidentifier),
            flexFormSheetName: dataset.flexformsheetname,
            flexFormFieldName: dataset.flexformfieldname,
            flexFormContainerName: dataset.flexformcontainername,
        }).then(async (response) => {
            const data = await response.resolve();
            const createdContainer = new DOMParser().parseFromString(data.html, 'text/html').body.firstElementChild;
            this.flexformContainerContainers.push(new FlexFormContainerContainer(this, createdContainer));
            const sectionContainer = document.querySelector(dataset.target);
            sectionContainer.insertAdjacentElement('beforeend', createdContainer);
            if (data.scriptItems instanceof Array && data.scriptItems.length > 0) {
                const processor = new JavaScriptItemProcessor();
                processor.processItems(data.scriptItems);
            }
            if (data.stylesheetFiles && data.stylesheetFiles.length > 0) {
                for (const stylesheetFile of data.stylesheetFiles) {
                    const element = document.createElement('link');
                    element.rel = 'stylesheet';
                    element.type = 'text/css';
                    element.href = stylesheetFile;
                    document.head.appendChild(element);
                }
            }
            this.updateToggleAllState();
            FormEngine.reinitialize();
            FormEngine.Validation.initializeInputFields();
            FormEngine.Validation.validate(sectionContainer);
            this.container.querySelector(Selectors.sectionContainerLabelSelector)?.classList.add('has-change');
        });
    }
    registerContainerDeleted() {
        new RegularEvent('formengine:flexform:container-deleted', (e) => {
            const deletedContainerId = e.detail.containerId;
            this.flexformContainerContainers = this.flexformContainerContainers.filter(flexformContainerContainer => flexformContainerContainer.getStatus().id !== deletedContainerId);
            FormEngine.Validation.validate(this.container);
            this.updateToggleAllState();
        }).bindTo(this.container);
    }
    registerPanelToggle() {
        ['hide.bs.collapse', 'show.bs.collapse'].forEach((eventName) => {
            new RegularEvent(eventName, () => {
                this.updateToggleAllState();
            }).delegateTo(this.container, Selectors.sectionContentContainerSelector);
        });
    }
    updateToggleAllState() {
        if (this.flexformContainerContainers.length > 0) {
            const firstContainer = this.flexformContainerContainers.find(Boolean);
            this.getToggleAllButton().dataset.expandAll = firstContainer.getStatus().collapsed === true ? 'true' : 'false';
        }
    }
}
export default FlexFormSectionContainer;
