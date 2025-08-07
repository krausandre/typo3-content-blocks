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
import SecurityUtility from '@typo3/core/security-utility';
import Modal from '@typo3/backend/modal';
import RegularEvent from '@typo3/core/event/regular-event';
import Severity from '@typo3/backend/severity';
import { selector } from '@typo3/core/literals';
import ClientStorage from '@typo3/backend/storage/client';
var Selectors;
(function (Selectors) {
    Selectors["toggleSelector"] = "[data-bs-toggle=\"flexform-inline\"]";
    Selectors["actionFieldSelector"] = ".t3js-flex-control-action";
    Selectors["controlSectionSelector"] = ".t3js-formengine-irre-control";
    Selectors["sectionContentContainerSelector"] = ".t3js-flex-section-content";
    Selectors["sectionContainerLabelSelector"] = ".t3js-formengine-label";
    Selectors["deleteContainerButtonSelector"] = ".t3js-delete";
    Selectors["contentPreviewSelector"] = ".content-preview";
})(Selectors || (Selectors = {}));
class FlexFormContainerContainer {
    constructor(parentContainer, container) {
        this.securityUtility = new SecurityUtility();
        this.parentContainer = parentContainer;
        this.container = container;
        this.containerContent = container.querySelector(Selectors.sectionContentContainerSelector);
        this.containerId = container.dataset.flexformContainerId;
        this.toggleKeyInLocalStorage = `formengine-flex-${parentContainer.getSectionContainer().id}-${this.containerId}-collapse`;
        this.panelHeading = container.querySelector(selector `[data-bs-target="#flexform-container-${this.containerId}"]`);
        this.panelButton = this.panelHeading.querySelector(selector `[aria-controls="flexform-container-${this.containerId}"]`);
        this.registerEvents();
    }
    static getCollapseInstance(container, toggle) {
        return Collapse.getInstance(container) ?? new Collapse(container, { toggle });
    }
    getStatus() {
        return {
            id: this.containerId,
            collapsed: this.panelButton.getAttribute('aria-expanded') === 'false',
        };
    }
    registerEvents() {
        if (this.parentContainer.isRestructuringAllowed()) {
            this.registerDelete();
        }
        this.registerPanelToggle();
        this.registerToggle();
    }
    registerDelete() {
        new RegularEvent('click', () => {
            const title = TYPO3.lang['flexform.section.delete.title'] || 'Delete this container?';
            const content = TYPO3.lang['flexform.section.delete.message'] || 'Are you sure you want to delete this container?';
            const modal = Modal.confirm(title, content, Severity.warning, [
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.no'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'no',
                },
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.yes'] || 'Yes, delete this container',
                    btnClass: 'btn-warning',
                    name: 'yes',
                },
            ]);
            modal.addEventListener('button.clicked', (modalEvent) => {
                if (modalEvent.target.name === 'yes') {
                    const actionField = this.container.querySelector(Selectors.actionFieldSelector);
                    actionField.value = 'DELETE';
                    this.container.appendChild(actionField);
                    this.container.classList.add('t3-flex-section--deleted');
                    this.container.closest('.t3-form-field-container.t3-form-flex')?.querySelector(Selectors.sectionContainerLabelSelector)?.classList.add('has-change');
                    new RegularEvent('transitionend', () => {
                        this.container.classList.add('hidden');
                        const event = new CustomEvent('formengine:flexform:container-deleted', {
                            detail: {
                                containerId: this.containerId
                            }
                        });
                        this.parentContainer.getContainer().dispatchEvent(event);
                    }).bindTo(this.container);
                }
                modal.hideModal();
            });
        }).bindTo(this.container.querySelector(Selectors.deleteContainerButtonSelector));
    }
    registerToggle() {
        const isCollapsed = (ClientStorage.get(this.toggleKeyInLocalStorage) ?? '1') === '1';
        const collapseInstance = FlexFormContainerContainer.getCollapseInstance(this.containerContent, !isCollapsed);
        this.generatePreview();
        new RegularEvent('click', () => {
            collapseInstance.toggle();
        }).delegateTo(this.container, `${Selectors.toggleSelector} .form-irre-header-cell:not(${Selectors.controlSectionSelector}`);
    }
    registerPanelToggle() {
        ['hide.bs.collapse', 'show.bs.collapse'].forEach((eventName) => {
            new RegularEvent(eventName, (e) => {
                const collapseTriggered = e.type === 'hide.bs.collapse';
                ClientStorage.set(this.toggleKeyInLocalStorage, collapseTriggered ? '1' : '0');
                this.panelButton.setAttribute('aria-expanded', collapseTriggered ? 'false' : 'true');
                this.panelButton.parentElement.classList.toggle('collapsed', collapseTriggered);
                this.generatePreview();
            }).bindTo(this.containerContent);
        });
    }
    generatePreview() {
        let previewContent = '';
        if (this.getStatus().collapsed) {
            const formFields = this.containerContent.querySelectorAll('input[type="text"], textarea');
            for (const field of formFields) {
                let content = this.securityUtility.stripHtml(field.value);
                if (content.length > 50) {
                    content = content.substring(0, 50) + '...';
                }
                previewContent += (previewContent ? ' / ' : '') + content;
            }
        }
        this.panelHeading.querySelector(Selectors.contentPreviewSelector).textContent = previewContent;
    }
}
export default FlexFormContainerContainer;
