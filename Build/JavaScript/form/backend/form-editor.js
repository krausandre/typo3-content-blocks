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
 * Module: @typo3/form/backend/form-editor
 */
import $ from 'jquery';
import Notification from '@typo3/backend/notification';
import * as Core from '@typo3/form/backend/form-editor/core';
const assert = Core.assert;
export class FormEditor {
    constructor(configuration, mediator, viewModel) {
        this.isRunning = false;
        this.unsavedContent = false;
        this.configuration = configuration || {};
        this.mediator = mediator;
        this.viewModel = viewModel;
    }
    getPublisherSubscriber() {
        return Core.getPublisherSubscriber();
    }
    undoApplicationState() {
        this.getApplicationStateStack().incrementCurrentStackPointer();
    }
    redoApplicationState() {
        this.getApplicationStateStack().decrementCurrentStackPointer();
    }
    getMaximalApplicationStates() {
        return this.getApplicationStateStack().getMaximalStackSize();
    }
    getCurrentApplicationStates() {
        return this.getApplicationStateStack().getCurrentStackSize();
    }
    getCurrentApplicationStatePosition() {
        return this.getApplicationStateStack().getCurrentStackPointer();
    }
    /**
     * @internal
     * @throws 1519855175
     */
    setFormDefinition(formDefinition) {
        assert('object' === $.type(formDefinition), 'Invalid parameter "formDefinition"', 1519855175);
        this.getApplicationStateStack().setCurrentState('formDefinition', this.getFactory().createFormElement(formDefinition, undefined, undefined, true));
    }
    /**
     * @throws 1475378543
     */
    getRunningAjaxRequest(type) {
        assert(this.getUtility().isNonEmptyString(type), 'Invalid parameter "type"', 1475378543);
        return Core.getRunningAjaxRequest(type);
    }
    getUtility() {
        return Core.getUtility();
    }
    assert(test, message, messageCode) {
        this.getUtility().assert(test, message, messageCode);
    }
    buildPropertyPath(propertyPath, collectionElementIdentifier, collectionName, _formElement, allowEmptyReturnValue) {
        if (this.getUtility().isUndefinedOrNull(_formElement)) {
            _formElement = this.getCurrentlySelectedFormElement();
        }
        const formElement = this.getRepository().findFormElement(_formElement);
        return this.getUtility().buildPropertyPath(propertyPath, collectionElementIdentifier, collectionName, formElement, allowEmptyReturnValue);
    }
    addPropertyValidationValidator(validatorIdentifier, func) {
        this.getPropertyValidationService().addValidator(validatorIdentifier, func);
    }
    validateCurrentlySelectedFormElementProperty(propertyPath) {
        return this.validateFormElementProperty(this.getCurrentlySelectedFormElement(), propertyPath);
    }
    validateFormElementProperty(_formElement, propertyPath) {
        const formElement = this.getRepository().findFormElement(_formElement);
        return this.getPropertyValidationService().validateFormElementProperty(formElement, propertyPath);
    }
    validateFormElement(_formElement) {
        const formElement = this.getRepository().findFormElement(_formElement);
        return this.getPropertyValidationService().validateFormElement(formElement);
    }
    validationResultsHasErrors(validationResults) {
        return this.getPropertyValidationService().validationResultsHasErrors(validationResults);
    }
    validateFormElementRecursive(_formElement, returnAfterFirstMatch) {
        const formElement = this.getRepository().findFormElement(_formElement);
        return this.getPropertyValidationService().validateFormElementRecursive(formElement, returnAfterFirstMatch);
    }
    /**
     * @throws 1475378544
     */
    setUnsavedContent(unsavedContent) {
        assert('boolean' === $.type(unsavedContent), 'Invalid parameter "unsavedContent"', 1475378544);
        this.unsavedContent = unsavedContent;
    }
    getUnsavedContent() {
        return this.unsavedContent;
    }
    getRootFormElement() {
        return this.getRepository().getRootFormElement();
    }
    getCurrentlySelectedFormElement() {
        return this.getRepository().findFormElementByIdentifierPath(this.getApplicationStateStack().getCurrentState('currentlySelectedFormElementIdentifierPath'));
    }
    /**
     * @publish core/currentlySelectedFormElementChanged
     */
    setCurrentlySelectedFormElement(_formElement, doNotRefreshCurrentlySelectedPageIndex) {
        doNotRefreshCurrentlySelectedPageIndex = !!doNotRefreshCurrentlySelectedPageIndex;
        const formElement = this.getRepository().findFormElement(_formElement);
        this.getApplicationStateStack().setCurrentState('currentlySelectedFormElementIdentifierPath', formElement.get('__identifierPath'));
        if (!doNotRefreshCurrentlySelectedPageIndex) {
            this.refreshCurrentlySelectedPageIndex();
        }
        this.getPublisherSubscriber().publish('core/currentlySelectedFormElementChanged', [formElement]);
    }
    /**
     * @throws 1475378545
     */
    getFormElementByIdentifierPath(identifierPath) {
        assert(this.getUtility().isNonEmptyString(identifierPath), 'Invalid parameter "identifierPath"', 1475378545);
        return this.getRepository().findFormElementByIdentifierPath(identifierPath);
    }
    isFormElementIdentifierUsed(formElementIdentifier) {
        return this.getRepository().isFormElementIdentifierUsed(formElementIdentifier);
    }
    createAndAddFormElement(formElementType, referenceFormElement, disablePublishersOnSet) {
        const formElement = this.addFormElement(this.createFormElement(formElementType, disablePublishersOnSet), referenceFormElement, disablePublishersOnSet);
        formElement.set('renderables', formElement.get('renderables'));
        return formElement;
    }
    /**
     * @throws 1475434337
     */
    addFormElement(formElement, _referenceFormElement, disablePublishersOnSet) {
        this.saveApplicationState();
        if (this.getUtility().isUndefinedOrNull(_referenceFormElement)) {
            _referenceFormElement = this.getCurrentlySelectedFormElement();
        }
        const referenceFormElement = this.getRepository().findFormElement(_referenceFormElement);
        assert('object' === $.type(formElement), 'Invalid parameter "formElement"', 1475434337);
        return this.getRepository().addFormElement(formElement, referenceFormElement, true, disablePublishersOnSet);
    }
    /**
     * @throws 1475434336
     * @throws 1475435857
     */
    createFormElement(formElementType, disablePublishersOnSet) {
        assert(this.getUtility().isNonEmptyString(formElementType), 'Invalid parameter "formElementType"', 1475434336);
        const identifier = this.getRepository().getNextFreeFormElementIdentifier(formElementType);
        const formElementDefinition = this.getFormElementDefinitionByType(formElementType, undefined);
        return this.getFactory().createFormElement({
            type: formElementType,
            identifier: identifier,
            label: formElementDefinition.label || formElementType
        }, undefined, undefined, undefined, disablePublishersOnSet);
    }
    removeFormElement(_formElementToRemove, disablePublishersOnSet) {
        this.saveApplicationState();
        const formElementToRemove = this.getRepository().findFormElement(_formElementToRemove);
        const parentFormElement = formElementToRemove.get('__parentRenderable');
        this.getRepository().removeFormElement(formElementToRemove, true, disablePublishersOnSet);
        return parentFormElement;
    }
    /**
     * @throws 1475378551
     */
    moveFormElement(_formElementToMove, position, _referenceFormElement, disablePublishersOnSet) {
        this.saveApplicationState();
        let formElementToMove = this.getRepository().findFormElement(_formElementToMove);
        const referenceFormElement = this.getRepository().findFormElement(_referenceFormElement);
        assert('after' === position || 'before' === position || 'inside' === position, 'Invalid position "' + position + '"', 1475378551);
        formElementToMove = this.getRepository().moveFormElement(formElementToMove, position, referenceFormElement, true);
        disablePublishersOnSet = !!disablePublishersOnSet;
        if (!disablePublishersOnSet) {
            formElementToMove.get('__parentRenderable').set('renderables', formElementToMove.get('__parentRenderable').get('renderables'));
        }
        return formElementToMove;
    }
    /**
     * @throws 1475378555
     * @throws 1475378556
     * @throws 1475446108
     */
    getPropertyCollectionElementConfiguration(collectionElementIdentifier, collectionName, _formElement) {
        let collection, collectionElement;
        if (this.getUtility().isUndefinedOrNull(_formElement)) {
            _formElement = this.getCurrentlySelectedFormElement();
        }
        const formElement = this.getRepository().findFormElement(_formElement);
        assert(this.getUtility().isNonEmptyString(collectionElementIdentifier), 'Invalid parameter "collectionElementIdentifier"', 1475378555);
        assert(this.getUtility().isNonEmptyString(collectionName), 'Invalid parameter "collectionName"', 1475378556);
        const formElementDefinition = this.getFormElementDefinitionByType(formElement.get('type'), undefined);
        if (!this.getUtility().isUndefinedOrNull(formElementDefinition.propertyCollections)) {
            collection = formElementDefinition.propertyCollections[collectionName];
            assert(!this.getUtility().isUndefinedOrNull(collection), 'Invalid collection name "' + collectionName + '"', 1475446108);
            collectionElement = this.getRepository().findCollectionElementByIdentifierPath(collectionElementIdentifier, collection);
            // Return a dereferenced object
            return $.extend(true, {}, collectionElement);
        }
        else {
            return {};
        }
    }
    /**
     * @throws 1475378557
     * @throws 1475378558
     */
    getIndexFromPropertyCollectionElement(collectionElementIdentifier, collectionName, _formElement) {
        if (this.getUtility().isUndefinedOrNull(_formElement)) {
            _formElement = this.getCurrentlySelectedFormElement();
        }
        const formElement = this.getRepository().findFormElement(_formElement);
        assert(this.getUtility().isNonEmptyString(collectionElementIdentifier), 'Invalid parameter "collectionElementIdentifier"', 1475378557);
        assert(this.getUtility().isNonEmptyString(collectionName), 'Invalid parameter "collectionName"', 1475378558);
        const indexFromPropertyCollectionElement = this.getRepository().getIndexFromPropertyCollectionElementByIdentifier(collectionElementIdentifier, collectionName, formElement);
        return indexFromPropertyCollectionElement;
    }
    createAndAddPropertyCollectionElement(collectionElementIdentifier, collectionName, formElement, collectionElementConfiguration, referenceCollectionElementIdentifier) {
        return this.addPropertyCollectionElement(this.createPropertyCollectionElement(collectionElementIdentifier, collectionName, collectionElementConfiguration), collectionName, formElement, referenceCollectionElementIdentifier);
    }
    /**
     * @throws 1475443300
     * @throws 1475443301
     */
    addPropertyCollectionElement(collectionElement, collectionName, _formElement, referenceCollectionElementIdentifier) {
        let collection;
        this.saveApplicationState();
        if (this.getUtility().isUndefinedOrNull(_formElement)) {
            _formElement = this.getCurrentlySelectedFormElement();
        }
        const formElement = this.getRepository().findFormElement(_formElement);
        assert('object' === $.type(collectionElement), 'Invalid parameter "collectionElement"', 1475443301);
        assert(this.getUtility().isNonEmptyString(collectionName), 'Invalid parameter "collectionName"', 1475443300);
        if (this.getUtility().isUndefinedOrNull(referenceCollectionElementIdentifier)) {
            collection = formElement.get(collectionName);
            if ('array' === $.type(collection) && collection.length > 0) {
                referenceCollectionElementIdentifier = collection[collection.length - 1].identifier;
            }
        }
        return this.getRepository().addPropertyCollectionElement(collectionElement, collectionName, formElement, referenceCollectionElementIdentifier, false);
    }
    /**
     * @throws 1475378559
     * @throws 1475378560
     */
    createPropertyCollectionElement(collectionElementIdentifier, collectionName, collectionElementConfiguration) {
        assert(this.getUtility().isNonEmptyString(collectionElementIdentifier), 'Invalid parameter "collectionElementIdentifier"', 1475378559);
        assert(this.getUtility().isNonEmptyString(collectionName), 'Invalid parameter "collectionName"', 1475378560);
        if ('object' !== $.type(collectionElementConfiguration)) {
            collectionElementConfiguration = {};
        }
        return this.getFactory().createPropertyCollectionElement(collectionElementIdentifier, collectionElementConfiguration, collectionName);
    }
    /**
     * @throws 1475378561
     * @throws 1475378562
     */
    removePropertyCollectionElement(collectionElementIdentifier, collectionName, _formElement, disablePublishersOnSet) {
        this.saveApplicationState();
        if (this.getUtility().isUndefinedOrNull(_formElement)) {
            _formElement = this.getCurrentlySelectedFormElement();
        }
        const formElement = this.getRepository().findFormElement(_formElement);
        assert(this.getUtility().isNonEmptyString(collectionElementIdentifier), 'Invalid parameter "collectionElementIdentifier"', 1475378561);
        assert(this.getUtility().isNonEmptyString(collectionName), 'Invalid parameter "collectionName"', 1475378562);
        this.getRepository().removePropertyCollectionElementByIdentifier(formElement, collectionElementIdentifier, collectionName, true);
        disablePublishersOnSet = !!disablePublishersOnSet;
        if (!disablePublishersOnSet) {
            this.getPublisherSubscriber().publish('core/formElement/somePropertyChanged', ['__fakeProperty']);
        }
    }
    /**
     * @throws 1477404352
     * @throws 1477404353
     * @throws 1477404354
     * @throws 1477404355
     */
    movePropertyCollectionElement(collectionElementToMove, position, referenceCollectionElement, collectionName, formElement, disablePublishersOnSet) {
        this.saveApplicationState();
        formElement = this.getRepository().findFormElement(formElement);
        assert('string' === $.type(collectionElementToMove), 'Invalid parameter "collectionElementToMove"', 1477404352);
        assert('string' === $.type(referenceCollectionElement), 'Invalid parameter "referenceCollectionElement"', 1477404353);
        assert('after' === position || 'before' === position, 'Invalid position "' + position + '"', 1477404354);
        assert(this.getUtility().isNonEmptyString(collectionName), 'Invalid parameter "collectionName"', 1477404355);
        this.getRepository().movePropertyCollectionElement(collectionElementToMove, position, referenceCollectionElement, collectionName, formElement, disablePublishersOnSet);
    }
    /**
     * @throws 1475378563
     */
    getFormElementDefinitionByType(elementType, formElementDefinitionKey) {
        assert(this.getUtility().isNonEmptyString(elementType), 'Invalid parameter "elementType"', 1475378563);
        const formElementDefinition = this.getRepository().getFormEditorDefinition('formElements', elementType);
        if (formElementDefinitionKey !== undefined /* && formElementDefinitionKey !== null*/) {
            const formElementDefinitionEntry = formElementDefinition[formElementDefinitionKey];
            if (formElementDefinitionEntry !== null && (typeof formElementDefinitionEntry === 'object')) {
                return $.extend(true, {}, formElementDefinitionEntry);
            }
            else {
                return formElementDefinitionEntry;
            }
        }
        if (formElementDefinition !== null && (typeof formElementDefinition === 'object')) {
            return $.extend(true, {}, formElementDefinition);
        }
        else {
            return formElementDefinition;
        }
    }
    getFormElementDefinition(formElement, formElementDefinitionKey) {
        formElement = this.getRepository().findFormElement(formElement);
        return this.getFormElementDefinitionByType(formElement.get('type'), formElementDefinitionKey);
    }
    getFormEditorDefinition(definitionName, subject) {
        return this.getRepository().getFormEditorDefinition(definitionName, subject);
    }
    /**
     * @throws 1475672362
     */
    getFormElementPropertyValidatorDefinition(validatorIdentifier) {
        assert(this.getUtility().isNonEmptyString(validatorIdentifier), 'Invalid parameter "validatorIdentifier"', 1475672362);
        const validatorDefinition = this.getRepository().getFormEditorDefinition('formElementPropertyValidators', validatorIdentifier);
        // Return a dereferenced object
        return $.extend(true, {}, validatorDefinition);
    }
    getCurrentlySelectedPageIndex() {
        return this.getApplicationStateStack().getCurrentState('currentlySelectedPageIndex');
    }
    refreshCurrentlySelectedPageIndex() {
        this.getApplicationStateStack().setCurrentState('currentlySelectedPageIndex', this.getPageIndexFromFormElement(this.getCurrentlySelectedFormElement()));
    }
    /**
     * @throws 1477786068
     */
    getCurrentlySelectedPage() {
        const currentPage = this.getRepository().getRootFormElement().get('renderables')[this.getCurrentlySelectedPageIndex()];
        assert('object' === $.type(currentPage), 'No page found', 1477786068);
        return currentPage;
    }
    getLastTopLevelElementOnCurrentPage() {
        const renderables = this.getCurrentlySelectedPage().get('renderables');
        if (this.getUtility().isUndefinedOrNull(renderables)) {
            return undefined;
        }
        return renderables[renderables.length - 1];
    }
    getLastFormElementWithinParentFormElement(formElement) {
        formElement = this.getRepository().findFormElement(formElement);
        if (formElement.get('__identifierPath') === this.getRootFormElement().get('__identifierPath')) {
            return formElement;
        }
        return formElement.get('__parentRenderable').get('renderables')[formElement.get('__parentRenderable').get('renderables').length - 1];
    }
    getPageIndexFromFormElement(formElement) {
        formElement = this.getRepository().findFormElement(formElement);
        return this.getRepository().getIndexForEnclosingCompositeFormElementWhichIsOnTopLevelForFormElement(formElement);
    }
    renderCurrentFormPage() {
        this.renderFormPage(this.getCurrentlySelectedPageIndex());
    }
    /**
     * @throws 1475446442
     */
    renderFormPage(pageIndex) {
        assert('number' === $.type(pageIndex), 'Invalid parameter "pageIndex"', 1475446442);
        this.getDataBackend().renderFormDefinitionPage(pageIndex);
    }
    findEnclosingCompositeFormElementWhichIsNotOnTopLevel(formElement) {
        return this.getRepository().findEnclosingCompositeFormElementWhichIsNotOnTopLevel(this.getRepository().findFormElement(formElement));
    }
    /**
     * @todo deprecate, method is unused
     */
    findEnclosingGridRowFormElement(formElement) {
        return this.getRepository().findEnclosingGridRowFormElement(this.getRepository().findFormElement(formElement));
    }
    getNonCompositeNonToplevelFormElements() {
        return this.getRepository().getNonCompositeNonToplevelFormElements();
    }
    isRootFormElementSelected() {
        return (this.getCurrentlySelectedFormElement().get('__identifierPath') === this.getRootFormElement().get('__identifierPath'));
    }
    getViewModel() {
        return this.viewModel;
    }
    saveFormDefinition() {
        this.getDataBackend().saveFormDefinition();
    }
    /**
     * @throws 1473200696
     */
    run() {
        if (this.isRunning) {
            throw 'You can not run the app twice (1473200696)';
        }
        try {
            this.bootstrap();
            this.isRunning = true;
        }
        catch (error) {
            if (!(error instanceof Error)) {
                throw error;
            }
            Notification.error(TYPO3.lang['formEditor.error.headline'], TYPO3.lang['formEditor.error.message']
                + '\r\n'
                + '\r\n'
                + TYPO3.lang['formEditor.error.technicalReason']
                + '\r\n'
                + error.message);
        }
        return this;
    }
    saveApplicationState() {
        this.getApplicationStateStack().addAndReset({
            formDefinition: this.getApplicationStateStack().getCurrentState('formDefinition').clone(),
            currentlySelectedPageIndex: this.getApplicationStateStack().getCurrentState('currentlySelectedPageIndex'),
            currentlySelectedFormElementIdentifierPath: this.getApplicationStateStack().getCurrentState('currentlySelectedFormElementIdentifierPath')
        });
    }
    getDataBackend() {
        return Core.getDataBackend();
    }
    getFactory() {
        return Core.getFactory();
    }
    getRepository() {
        return Core.getRepository();
    }
    getPropertyValidationService() {
        return Core.getPropertyValidationService();
    }
    getApplicationStateStack() {
        return Core.getApplicationStateStack();
    }
    /**
     * @publish ajax/beforeSend
     * @publish ajax/complete
     */
    ajaxSetup() {
        $.ajaxSetup({
            beforeSend: () => {
                this.getPublisherSubscriber().publish('ajax/beforeSend');
            },
            complete: () => {
                this.getPublisherSubscriber().publish('ajax/complete');
            }
        });
    }
    /**
     * @throws 1475379748
     * @throws 1475379749
     * @throws 1475927876
     */
    dataBackendSetup(endpoints, prototypeName, formPersistenceIdentifier) {
        assert('object' === $.type(endpoints), 'Invalid parameter "endpoints"', 1475379748);
        assert(this.getUtility().isNonEmptyString(prototypeName), 'Invalid parameter "prototypeName"', 1475927876);
        assert(this.getUtility().isNonEmptyString(formPersistenceIdentifier), 'Invalid parameter "formPersistenceIdentifier"', 1475379749);
        Core.getDataBackend().setEndpoints(endpoints);
        Core.getDataBackend().setPrototypeName(prototypeName);
        Core.getDataBackend().setPersistenceIdentifier(formPersistenceIdentifier);
    }
    /**
     * @throws 1475379750
     */
    repositorySetup(formEditorDefinitions) {
        assert('object' === $.type(formEditorDefinitions), 'Invalid parameter "formEditorDefinitions"', 1475379750);
        this.getRepository().setFormEditorDefinitions(formEditorDefinitions);
    }
    /**
     * @throws 1475492374
     */
    viewSetup(additionalViewModelModules) {
        assert('function' === $.type(this.viewModel.bootstrap), 'The view model does not implement the method "bootstrap"', 1475492374);
        if (this.getUtility().isUndefinedOrNull(additionalViewModelModules)) {
            additionalViewModelModules = [];
        }
        this.viewModel.bootstrap(formEditorInstance, additionalViewModelModules);
    }
    /**
     * @throws 1475492032
     */
    mediatorSetup() {
        assert('function' === $.type(this.mediator.bootstrap), 'The mediator does not implement the method "bootstrap"', 1475492032);
        this.mediator.bootstrap(formEditorInstance, this.viewModel);
    }
    /**
     * @throws 1475379751
     */
    applicationStateStackSetup(rootFormElement, maximumUndoSteps) {
        assert('object' === $.type(rootFormElement), 'Invalid parameter "rootFormElement"', 1475379751);
        if ('number' !== $.type(maximumUndoSteps)) {
            maximumUndoSteps = 10;
        }
        this.getApplicationStateStack().setMaximalStackSize(maximumUndoSteps);
        this.getApplicationStateStack().addAndReset({
            currentlySelectedPageIndex: 0,
            currentlySelectedFormElementIdentifierPath: rootFormElement.identifier
        }, true);
        this.getApplicationStateStack().setCurrentState('formDefinition', this.getFactory().createFormElement(rootFormElement, undefined, undefined, true));
    }
    bootstrap() {
        this.mediatorSetup();
        this.ajaxSetup();
        this.dataBackendSetup(this.configuration.endpoints, this.configuration.prototypeName, this.configuration.formPersistenceIdentifier);
        this.repositorySetup(this.configuration.formEditorDefinitions);
        this.applicationStateStackSetup(this.configuration.formDefinition, this.configuration.maximumUndoSteps);
        this.setCurrentlySelectedFormElement(this.getRepository().getRootFormElement());
        this.viewSetup(this.configuration.additionalViewModelModules);
    }
}
let formEditorInstance = null;
/**
 * @public
 * @static
 *
 * Implement the "Singleton Pattern".
 *
 * Return a singleton instance of a
 * "FormEditor" object.
 */
export function getInstance(configuration, mediator, viewModel) {
    if (formEditorInstance === null) {
        formEditorInstance = new FormEditor(configuration, mediator, viewModel);
    }
    return formEditorInstance;
}
