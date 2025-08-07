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
/**
 * Module: @typo3/form/backend/form-editor/modals-component
 */
import $ from 'jquery';
import * as Helper from '@typo3/form/backend/form-editor/helper';
import Modal, {} from '@typo3/backend/modal';
import Severity from '@typo3/backend/severity';
let configuration = null;
const defaultConfiguration = {
    domElementClassNames: {
        buttonDefault: 'btn-default',
        buttonInfo: 'btn-info',
        buttonWarning: 'btn-warning'
    },
    domElementDataAttributeNames: {
        elementType: 'element-type',
        fullElementType: 'data-element-type'
    },
    domElementDataAttributeValues: {
        rowItem: 'rowItem',
        rowLink: 'rowLink',
        rowsContainer: 'rowsContainer',
        templateInsertElements: 'Modal-InsertElements',
        templateInsertPages: 'Modal-InsertPages',
        templateValidationErrors: 'Modal-ValidationErrors'
    }
};
let formEditorApp = null;
function getFormEditorApp() {
    return formEditorApp;
}
function getHelper(_configuration) {
    if (getUtility().isUndefinedOrNull(_configuration)) {
        return Helper.setConfiguration(configuration);
    }
    return Helper.setConfiguration(_configuration);
}
function getUtility() {
    return getFormEditorApp().getUtility();
}
function assert(test, message, messageCode) {
    return getFormEditorApp().assert(test, message, messageCode);
}
function getRootFormElement() {
    return getFormEditorApp().getRootFormElement();
}
function getPublisherSubscriber() {
    return getFormEditorApp().getPublisherSubscriber();
}
function getFormElementDefinition(formElement, formElementDefinitionKey) {
    return getFormEditorApp().getFormElementDefinition(formElement, formElementDefinitionKey);
}
/**
 * @throws 1478889044
 * @throws 1478889049
 */
function showRemoveElementModal(publisherTopicName, publisherTopicArguments) {
    const modalButtons = [];
    assert(getUtility().isNonEmptyString(publisherTopicName), 'Invalid parameter "publisherTopicName"', 1478889049);
    assert('array' === $.type(publisherTopicArguments), 'Invalid parameter "formElement"', 1478889044);
    modalButtons.push({
        text: getFormElementDefinition(getRootFormElement(), 'modalRemoveElementCancelButton'),
        active: true,
        btnClass: getHelper().getDomElementClassName('buttonDefault'),
        name: 'cancel',
        trigger: (e, modal) => {
            modal.hideModal();
        }
    });
    modalButtons.push({
        text: getFormElementDefinition(getRootFormElement(), 'modalRemoveElementConfirmButton'),
        active: true,
        btnClass: getHelper().getDomElementClassName('buttonWarning'),
        name: 'confirm',
        trigger: (e, modal) => {
            getPublisherSubscriber().publish(publisherTopicName, publisherTopicArguments);
            modal.hideModal();
        }
    });
    Modal.show(getFormElementDefinition(getRootFormElement(), 'modalRemoveElementDialogTitle'), getFormElementDefinition(getRootFormElement(), 'modalRemoveElementDialogMessage'), Severity.warning, modalButtons);
}
/**
 * @publish mixed
 * @throws 1478910954
 */
function insertElementsModalSetup(modalContent, publisherTopicName, configuration) {
    assert(getUtility().isNonEmptyString(publisherTopicName), 'Invalid parameter "publisherTopicName"', 1478910954);
    if ('object' === $.type(configuration)) {
        for (const key of Object.keys(configuration)) {
            if (key === 'disableElementTypes'
                && 'array' === $.type(configuration[key])) {
                for (let i = 0, len = configuration[key].length; i < len; ++i) {
                    $(getHelper().getDomElementDataAttribute('fullElementType', 'bracesWithKeyValue', [configuration[key][i]]), modalContent).addClass(getHelper().getDomElementClassName('disabled'));
                }
            }
            if (key === 'onlyEnableElementTypes'
                && 'array' === $.type(configuration[key])) {
                $(getHelper().getDomElementDataAttribute('fullElementType', 'bracesWithKey'), modalContent).each(function () {
                    for (let i = 0, len = configuration[key].length; i < len; ++i) {
                        const that = $(this);
                        if (that.data(getHelper().getDomElementDataAttribute('elementType')) !== configuration[key][i]) {
                            that.addClass(getHelper().getDomElementClassName('disabled'));
                        }
                    }
                });
            }
        }
    }
    $(modalContent).on('typo3:form:insert-element-click', function (e) {
        getPublisherSubscriber().publish(publisherTopicName, [e.detail.item.identifier]);
    });
}
/**
 * @publish view/modal/validationErrors/element/clicked
 * @throws 1479161268
 */
function _validationErrorsModalSetup(modalContent, validationResults) {
    let formElement, newRowItem;
    assert('array' === $.type(validationResults), 'Invalid parameter "validationResults"', 1479161268);
    const rowItemTemplate = $(getHelper().getDomElementDataIdentifierSelector('rowItem'), modalContent).clone();
    $(getHelper().getDomElementDataIdentifierSelector('rowItem'), modalContent).remove();
    for (let i = 0, len = validationResults.length; i < len; ++i) {
        let hasError = false;
        for (let j = 0, len2 = validationResults[i].validationResults.length; j < len2; ++j) {
            if (validationResults[i].validationResults[j].validationResults
                && validationResults[i].validationResults[j].validationResults.length > 0) {
                hasError = true;
                break;
            }
        }
        if (hasError) {
            formElement = getFormEditorApp()
                .getFormElementByIdentifierPath(validationResults[i].formElementIdentifierPath);
            newRowItem = rowItemTemplate.clone();
            $(getHelper().getDomElementDataIdentifierSelector('rowLink'), newRowItem)
                .attr(getHelper().getDomElementDataAttribute('elementIdentifier'), validationResults[i].formElementIdentifierPath)
                .get(0).replaceChildren(_buildTitleByFormElement(formElement));
            $(getHelper().getDomElementDataIdentifierSelector('rowsContainer'), modalContent)
                .append(newRowItem);
        }
    }
    $('a', modalContent).on('click', function () {
        getPublisherSubscriber().publish('view/modal/validationErrors/element/clicked', [
            $(this).attr(getHelper().getDomElementDataAttribute('elementIdentifier'))
        ]);
        $('a', modalContent).off();
        Modal.currentModal.hideModal();
    });
}
/**
 * @throws 1479162557
 */
function _buildTitleByFormElement(formElement) {
    assert('object' === $.type(formElement), 'Invalid parameter "formElement"', 1479162557);
    const span = document.createElement('span');
    span.textContent = formElement.get('label') ? formElement.get('label') : formElement.get('identifier');
    return span;
}
/* *************************************************************
 * Public Methods
 * ************************************************************/
/**
 * @publish view/modal/removeFormElement/perform
 */
export function showRemoveFormElementModal(formElement) {
    showRemoveElementModal('view/modal/removeFormElement/perform', [formElement]);
}
/**
 * @publish view/modal/removeCollectionElement/perform
 * @throws 1478894420
 * @throws 1478894421
 */
export function showRemoveCollectionElementModal(collectionElementIdentifier, collectionName, formElement) {
    assert(getUtility().isNonEmptyString(collectionElementIdentifier), 'Invalid parameter "collectionElementIdentifier"', 1478894420);
    assert(getUtility().isNonEmptyString(collectionName), 'Invalid parameter "collectionName"', 1478894421);
    showRemoveElementModal('view/modal/removeCollectionElement/perform', [collectionElementIdentifier, collectionName, formElement]);
}
/**
 * @publish view/modal/close/perform
 */
export function showCloseConfirmationModal() {
    const modalButtons = [];
    modalButtons.push({
        text: getFormElementDefinition(getRootFormElement(), 'modalCloseCancelButton'),
        active: true,
        btnClass: getHelper().getDomElementClassName('buttonDefault'),
        name: 'cancel',
        trigger: (e, modal) => {
            modal.hideModal();
        }
    });
    modalButtons.push({
        text: getFormElementDefinition(getRootFormElement(), 'modalCloseConfirmButton'),
        active: true,
        btnClass: getHelper().getDomElementClassName('buttonWarning'),
        name: 'confirm',
        trigger: (e, modal) => {
            getPublisherSubscriber().publish('view/modal/close/perform', []);
            modal.hideModal();
        }
    });
    Modal.show(getFormElementDefinition(getRootFormElement(), 'modalCloseDialogTitle'), getFormElementDefinition(getRootFormElement(), 'modalCloseDialogMessage'), Severity.warning, modalButtons);
}
export function showInsertElementsModal(publisherTopicName, configuration) {
    const template = getHelper().getTemplate('templateInsertElements');
    if (template.length > 0) {
        const html = $(template.html());
        insertElementsModalSetup(html, publisherTopicName, configuration);
        Modal.advanced({
            title: getFormElementDefinition(getRootFormElement(), 'modalInsertElementsDialogTitle'),
            size: Modal.sizes.large,
            content: $(html),
        });
    }
}
export function showInsertPagesModal(publisherTopicName) {
    const template = getHelper().getTemplate('templateInsertPages');
    if (template.length > 0) {
        const html = $(template.html());
        insertElementsModalSetup(html, publisherTopicName);
        Modal.advanced({
            title: getFormElementDefinition(getRootFormElement(), 'modalInsertPagesDialogTitle'),
            size: Modal.sizes.small,
            content: $(html),
        });
    }
}
export function showValidationErrorsModal(validationResults) {
    const modalButtons = [];
    modalButtons.push({
        text: getFormElementDefinition(getRootFormElement(), 'modalValidationErrorsConfirmButton'),
        active: true,
        btnClass: getHelper().getDomElementClassName('buttonDefault'),
        name: 'confirm',
        trigger: function (e, modal) {
            modal.hideModal();
        }
    });
    const template = getHelper().getTemplate('templateValidationErrors');
    if (template.length > 0) {
        const html = $(template.html()).clone();
        _validationErrorsModalSetup(html, validationResults);
        Modal.show(getFormElementDefinition(getRootFormElement(), 'modalValidationErrorsDialogTitle'), html, Severity.error, modalButtons);
    }
}
export function bootstrap(_formEditorApp, customConfiguration) {
    formEditorApp = _formEditorApp;
    configuration = $.extend(true, defaultConfiguration, customConfiguration || {});
    Helper.bootstrap(formEditorApp);
    return this;
}
