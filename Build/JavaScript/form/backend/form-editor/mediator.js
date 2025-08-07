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
 * Module: @typo3/form/backend/form-editor/mediator
 */
import $ from 'jquery';
import * as Helper from '@typo3/form/backend/form-editor/helper';
let formEditorApp = null;
let viewModel = null;
function getFormEditorApp() {
    return formEditorApp;
}
function getViewModel() {
    return viewModel;
}
function getUtility() {
    return getFormEditorApp().getUtility();
}
function assert(test, message, messageCode) {
    return getFormEditorApp().assert(test, message, messageCode);
}
function getHelper(_configuration) {
    if (getUtility().isUndefinedOrNull(_configuration)) {
        return Helper.setConfiguration(getViewModel().getConfiguration());
    }
    return Helper.setConfiguration(_configuration);
}
function getCurrentlySelectedFormElement() {
    return getFormEditorApp().getCurrentlySelectedFormElement();
}
function getPublisherSubscriber() {
    return getFormEditorApp().getPublisherSubscriber();
}
function getRootFormElement() {
    return getFormEditorApp().getRootFormElement();
}
function subscribeEvents() {
    /* *********************************************************
     * Misc
     * ********************************************************/
    window.onbeforeunload = function (e) {
        if (!getFormEditorApp().getUnsavedContent()) {
            return undefined;
        }
        e = e || window.event;
        if (e) {
            e.returnValue = getFormEditorApp().getFormElementDefinition(getRootFormElement(), 'modalCloseDialogMessage');
        }
        return getFormEditorApp().getFormElementDefinition(getRootFormElement(), 'modalCloseDialogTitle');
    };
    /**
     * @subscribe view/ready
     */
    getPublisherSubscriber().subscribe('view/ready', () => {
        getViewModel().onViewReadyBatch();
    });
    /**
     * @subscribe core/applicationState/add
     */
    getPublisherSubscriber().subscribe('core/applicationState/add', (topic, [applicationState, // eslint-disable-line @typescript-eslint/no-unused-vars
    currentStackPointer, currentStackSize]) => {
        getViewModel().disableButton($(getHelper().getDomElementDataIdentifierSelector('buttonHeaderRedo')));
        if (currentStackSize > 1 && currentStackPointer <= currentStackSize) {
            getViewModel().enableButton($(getHelper().getDomElementDataIdentifierSelector('buttonHeaderUndo')));
        }
        else {
            getViewModel().disableButton($(getHelper().getDomElementDataIdentifierSelector('buttonHeaderUndo')));
        }
    });
    /* *********************************************************
     * Ajax
     * ********************************************************/
    /**
     * @subscribe core/ajax/saveFormDefinition/success
     */
    getPublisherSubscriber().subscribe('core/ajax/saveFormDefinition/success', (topic, [data]) => {
        getFormEditorApp().setUnsavedContent(false);
        getViewModel().setPreviewMode(false);
        getViewModel().showSaveSuccessMessage();
        getViewModel().showSaveButtonSaveIcon();
        getFormEditorApp().setFormDefinition(data.formDefinition);
        getViewModel().addStructureRootElementSelection();
        getFormEditorApp().setCurrentlySelectedFormElement(getRootFormElement());
        getViewModel().setStructureRootElementTitle();
        getViewModel().setStageHeadline();
        getViewModel().renderAbstractStageArea();
        getViewModel().renewStructure();
        getViewModel().renderPagination();
        getViewModel().renderInspectorEditors();
    });
    /**
     * @subscribe core/ajax/saveFormDefinition/error
     */
    getPublisherSubscriber().subscribe('core/ajax/saveFormDefinition/error', (topic, [data]) => {
        getViewModel().showSaveButtonSaveIcon();
        getViewModel().showSaveErrorMessage({ message: data.message });
    });
    /**
     * @subscribe core/ajax/renderFormDefinitionPage/success
     */
    getPublisherSubscriber().subscribe('core/ajax/renderFormDefinitionPage/success', (topic, [htmldata, pageIndex] // eslint-disable-line @typescript-eslint/no-unused-vars
    ) => {
        getViewModel().renderPreviewStageArea(htmldata);
    });
    /**
     * @subscribe core/ajax/saveFormDefinition/error
     */
    getPublisherSubscriber().subscribe('core/ajax/error', (topic, [jqXHR, textStatus, errorThrown]) => {
        if (jqXHR.status !== 0) {
            getViewModel().showErrorFlashMessage(textStatus, errorThrown);
            getViewModel().renderPreviewStageArea(jqXHR.responseText);
        }
    });
    /* *********************************************************
     * Header
     * ********************************************************/
    /**
     * @subscribe view/header/button/save/clicked
     */
    getPublisherSubscriber().subscribe('view/header/button/save/clicked', () => {
        if (getFormEditorApp().validationResultsHasErrors(getFormEditorApp().validateFormElementRecursive(getRootFormElement(), true))) {
            getViewModel().showValidationErrorsModal();
        }
        else {
            getViewModel().showSaveButtonSpinnerIcon();
            getFormEditorApp().saveFormDefinition();
        }
    });
    /**
     * @subscribe view/header/formSettings/clicked
     */
    getPublisherSubscriber().subscribe('view/header/formSettings/clicked', () => {
        getViewModel().setPreviewMode(false);
        getViewModel().addStructureRootElementSelection();
        getFormEditorApp().setCurrentlySelectedFormElement(getRootFormElement());
        getViewModel().renderAbstractStageArea();
        getViewModel().renewStructure();
        getViewModel().renderPagination();
        getViewModel().showInspectorSidebar();
        getViewModel().renderInspectorEditors();
    });
    /**
     * @subscribe view/header/button/newPage/clicked
     */
    getPublisherSubscriber().subscribe('view/header/button/newPage/clicked', (topic, [targetEvent]) => {
        if (getFormEditorApp().isRootFormElementSelected()) {
            getViewModel().selectPageBatch(0);
        }
        getViewModel().showInsertPagesModal(targetEvent);
    });
    /**
     * @subscribe view/header/button/close/clicked
     */
    getPublisherSubscriber().subscribe('view/header/button/close/clicked', () => {
        getViewModel().showCloseConfirmationModal();
    });
    /**
     * @subscribe view/undoButton/clicked
     */
    getPublisherSubscriber().subscribe('view/undoButton/clicked', () => {
        getViewModel().disableButton($(getHelper().getDomElementDataIdentifierSelector('buttonHeaderUndo')));
        getViewModel().disableButton($(getHelper().getDomElementDataIdentifierSelector('buttonHeaderRedo')));
        getFormEditorApp().undoApplicationState();
        if (getViewModel().getPreviewMode()) {
            getFormEditorApp().renderCurrentFormPage();
        }
        else {
            getViewModel().renderAbstractStageArea();
        }
        getFormEditorApp().setUnsavedContent(true);
        getViewModel().renewStructure();
        getViewModel().renderPagination();
        getViewModel().renderInspectorEditors();
    });
    /**
     * @subscribe view/redoButton/clicked
     */
    getPublisherSubscriber().subscribe('view/redoButton/clicked', () => {
        getViewModel().disableButton($(getHelper().getDomElementDataIdentifierSelector('buttonHeaderUndo')));
        getViewModel().disableButton($(getHelper().getDomElementDataIdentifierSelector('buttonHeaderRedo')));
        getFormEditorApp().redoApplicationState();
        if (getViewModel().getPreviewMode()) {
            getFormEditorApp().renderCurrentFormPage();
        }
        else {
            getViewModel().renderAbstractStageArea();
        }
        getFormEditorApp().setUnsavedContent(true);
        getViewModel().renewStructure();
        getViewModel().renderPagination();
        getViewModel().renderInspectorEditors();
    });
    /* *********************************************************
     * Stage
     * ********************************************************/
    /**
     * @subscribe view/stage/element/clicked
     */
    getPublisherSubscriber().subscribe('view/stage/element/clicked', (topic, [formElementIdentifierPath]) => {
        if (getCurrentlySelectedFormElement().get('__identifierPath') !== formElementIdentifierPath) {
            getFormEditorApp().setCurrentlySelectedFormElement(formElementIdentifierPath);
            getViewModel().renewStructure();
            getViewModel().refreshSelectedElementItemsBatch();
            getViewModel().addAbstractViewValidationResults();
            getViewModel().renderInspectorEditors();
        }
    });
    /**
     * @subscribe view/stage/abstract/elementToolbar/button/newElement/clicked
     */
    getPublisherSubscriber().subscribe('view/stage/abstract/elementToolbar/button/newElement/clicked', (topic, [targetEvent, modalConfiguration]) => {
        if (getFormEditorApp().isRootFormElementSelected()) {
            getViewModel().selectPageBatch(0);
        }
        getViewModel().showInsertElementsModal(targetEvent, modalConfiguration);
    });
    /**
     * @subscribe view/newElementButton/clicked
     */
    getPublisherSubscriber().subscribe('view/stage/abstract/button/newElement/clicked', (topic, [targetEvent, modalConfiguration]) => {
        if (getFormEditorApp().isRootFormElementSelected()) {
            getViewModel().selectPageBatch(0);
        }
        getViewModel().showInsertElementsModal(targetEvent, modalConfiguration || undefined);
    });
    /**
     * @subscribe view/stage/abstract/dnd/start
     */
    getPublisherSubscriber().subscribe('view/stage/abstract/dnd/start', (topic, [draggedFormElementDomElement, draggedFormPlaceholderDomElement]) => {
        getViewModel().onAbstractViewDndStartBatch(draggedFormElementDomElement, draggedFormPlaceholderDomElement);
    });
    /**
     * @subscribe view/stage/abstract/dnd/stop
     */
    getPublisherSubscriber().subscribe('view/stage/abstract/dnd/stop', (topic, [draggedFormElementIdentifierPath]) => {
        getFormEditorApp().setCurrentlySelectedFormElement(draggedFormElementIdentifierPath);
        getViewModel().renewStructure();
        getViewModel().setPreviewMode(false);
        getViewModel().renderAbstractStageArea(false, false);
        getViewModel().refreshSelectedElementItemsBatch();
        getViewModel().addAbstractViewValidationResults();
        getViewModel().renderInspectorEditors();
    });
    /**
     * @subscribe view/stage/abstract/dnd/change
     */
    getPublisherSubscriber().subscribe('view/stage/abstract/dnd/change', (topic, [placeholderDomElement, parentFormElementIdentifierPath, enclosingCompositeFormElement]) => {
        getViewModel().onAbstractViewDndChangeBatch(placeholderDomElement, parentFormElementIdentifierPath, enclosingCompositeFormElement);
    });
    /**
     * @subscribe view/stage/abstract/dnd/update
     */
    getPublisherSubscriber().subscribe('view/stage/abstract/dnd/update', (topic, [movedDomElement, movedFormElementIdentifierPath, previousFormElementIdentifierPath, nextFormElementIdentifierPath]) => {
        getViewModel().onAbstractViewDndUpdateBatch(movedDomElement, movedFormElementIdentifierPath, previousFormElementIdentifierPath, nextFormElementIdentifierPath);
    });
    /**
     * @subscribe view/viewModeButton/abstract/clicked
     */
    getPublisherSubscriber().subscribe('view/viewModeButton/abstract/clicked', () => {
        if (getViewModel().getPreviewMode()) {
            getViewModel().setPreviewMode(false);
            getViewModel().renderAbstractStageArea();
        }
    });
    /**
     * @subscribe view/viewModeButton/preview/clicked
     */
    getPublisherSubscriber().subscribe('view/viewModeButton/preview/clicked', () => {
        if (!getViewModel().getPreviewMode()) {
            getViewModel().setPreviewMode(true);
            getFormEditorApp().renderCurrentFormPage();
        }
    });
    /**
     * @subscribe view/paginationPrevious/clicked
     */
    getPublisherSubscriber().subscribe('view/paginationPrevious/clicked', () => {
        getViewModel().selectPageBatch(getFormEditorApp().getCurrentlySelectedPageIndex() - 1);
        if (getViewModel().getPreviewMode()) {
            getFormEditorApp().renderCurrentFormPage();
        }
        else {
            getViewModel().renderAbstractStageArea();
        }
    });
    /**
     * @subscribe view/paginationNext/clicked
     */
    getPublisherSubscriber().subscribe('view/paginationNext/clicked', () => {
        getViewModel().selectPageBatch(getFormEditorApp().getCurrentlySelectedPageIndex() + 1);
        if (getViewModel().getPreviewMode()) {
            getFormEditorApp().renderCurrentFormPage();
        }
        else {
            getViewModel().renderAbstractStageArea();
        }
    });
    /**
     * @subscribe view/stage/abstract/render/postProcess
     */
    getPublisherSubscriber().subscribe('view/stage/abstract/render/postProcess', () => {
        getViewModel().renderUndoRedo();
    });
    /**
     * @subscribe view/stage/preview/render/postProcess
     */
    getPublisherSubscriber().subscribe('view/stage/preview/render/postProcess', () => {
        getViewModel().renderUndoRedo();
    });
    /* *********************************************************
     * Structure
     * ********************************************************/
    /**
     * @subscribe view/tree/node/clicked
     */
    getPublisherSubscriber().subscribe('view/tree/node/clicked', (topic, [formElementIdentifierPath]) => {
        let oldPageIndex;
        if (getCurrentlySelectedFormElement().get('__identifierPath') !== formElementIdentifierPath) {
            oldPageIndex = getFormEditorApp().getCurrentlySelectedPageIndex();
            getFormEditorApp().setCurrentlySelectedFormElement(formElementIdentifierPath);
            getViewModel().setPreviewMode(false);
            if (oldPageIndex !== getFormEditorApp().getCurrentlySelectedPageIndex()) {
                getViewModel().renderAbstractStageArea();
            }
            else {
                getViewModel().renderAbstractStageArea(false);
            }
            getViewModel().renderPagination();
            getViewModel().renderInspectorEditors();
        }
    });
    /**
     * @subscribe view/tree/node/clicked
     */
    getPublisherSubscriber().subscribe('view/tree/node/changed', (topic, [formElementIdentifierPath, newLabel]) => {
        const formElement = getFormEditorApp().getFormElementByIdentifierPath(formElementIdentifierPath);
        formElement.set('label', newLabel);
        getViewModel().getStructure().setTreeNodeTitle(null, formElement);
        if (getCurrentlySelectedFormElement().get('__identifierPath') === formElementIdentifierPath) {
            getViewModel().renderInspectorEditors(formElementIdentifierPath, false);
        }
    });
    /**
     * @subscribe view/structure/root/selected
     */
    getPublisherSubscriber().subscribe('view/structure/root/selected', () => {
        if (!getFormEditorApp().isRootFormElementSelected()) {
            getViewModel().addStructureRootElementSelection();
            getFormEditorApp().setCurrentlySelectedFormElement(getRootFormElement());
            getViewModel().setPreviewMode(false);
            getViewModel().renderAbstractStageArea();
            getViewModel().renewStructure();
            getViewModel().renderPagination();
            getViewModel().renderInspectorEditors();
        }
    });
    /**
     * @subscribe view/header/button/newPage/clicked
     */
    getPublisherSubscriber().subscribe('view/structure/button/newPage/clicked', (topic, [targetEvent]) => {
        if (getFormEditorApp().isRootFormElementSelected()) {
            getViewModel().selectPageBatch(0);
        }
        getViewModel().showInsertPagesModal(targetEvent);
    });
    /**
     * @subscribe view/tree/dnd/stop
     */
    getPublisherSubscriber().subscribe('view/tree/dnd/stop', (topic, [draggedFormElementIdentifierPath]) => {
        getFormEditorApp().setCurrentlySelectedFormElement(draggedFormElementIdentifierPath);
        getViewModel().renewStructure();
        getViewModel().renderPagination();
        getViewModel().setPreviewMode(false);
        getViewModel().renderAbstractStageArea();
        getViewModel().renderInspectorEditors();
    });
    /**
     * @subscribe view/tree/dnd/change
     */
    getPublisherSubscriber().subscribe('view/tree/dnd/change', (topic, [placeholderDomElement, parentFormElementIdentifierPath, enclosingCompositeFormElement]) => {
        getViewModel().onStructureDndChangeBatch(placeholderDomElement, parentFormElementIdentifierPath, enclosingCompositeFormElement);
    });
    /**
     * @subscribe view/tree/dnd/update
     */
    getPublisherSubscriber().subscribe('view/tree/dnd/update', (topic, [movedDomElement, movedFormElementIdentifierPath, previousFormElementIdentifierPath, nextFormElementIdentifierPath]) => {
        getViewModel().onStructureDndUpdateBatch(movedDomElement, movedFormElementIdentifierPath, previousFormElementIdentifierPath, nextFormElementIdentifierPath);
    });
    /**
     * @subscribe view/structure/renew/postProcess
     */
    getPublisherSubscriber().subscribe('view/structure/renew/postProcess', () => {
        getViewModel().addStructureValidationResults();
    });
    /* *********************************************************
     * Inspector
     * ********************************************************/
    /**
     * @subscribe view/inspector/removeCollectionElement/perform
     */
    getPublisherSubscriber().subscribe('view/inspector/removeCollectionElement/perform', (topic, [collectionElementIdentifier, collectionName, formElement]) => {
        getViewModel().removePropertyCollectionElement(collectionElementIdentifier, collectionName, formElement || undefined);
    });
    /**
     * @subscribe view/inspector/collectionElement/selected
     */
    getPublisherSubscriber().subscribe('view/inspector/collectionElement/new/selected', (topic, [collectionElementIdentifier, collectionName,]) => {
        getViewModel().createAndAddPropertyCollectionElement(collectionElementIdentifier, collectionName);
    });
    /**
     * @subscribe view/inspector/collectionElement/selected
     */
    getPublisherSubscriber().subscribe('view/inspector/collectionElement/existing/selected', (topic, [collectionElementIdentifier, collectionName,]) => {
        getViewModel().renderInspectorCollectionElementEditors(collectionName, collectionElementIdentifier);
    });
    /**
     * @subscribe view/inspector/collectionElements/dnd/update
     * @throws 1477407673
     */
    getPublisherSubscriber().subscribe('view/inspector/collectionElements/dnd/update', (topic, [movedCollectionElementIdentifier, previousCollectionElementIdentifier, nextCollectionElementIdentifier, collectionName]) => {
        if (nextCollectionElementIdentifier) {
            getViewModel().movePropertyCollectionElement(movedCollectionElementIdentifier, 'before', nextCollectionElementIdentifier, collectionName);
        }
        else if (previousCollectionElementIdentifier) {
            getViewModel().movePropertyCollectionElement(movedCollectionElementIdentifier, 'after', previousCollectionElementIdentifier, collectionName);
        }
        else {
            assert(false, 'Next element or previous element need to be set.', 1477407673);
        }
    });
    /* *********************************************************
     * Form element
     * ********************************************************/
    /**
     * @subscribe core/formElement/somePropertyChanged
     */
    getPublisherSubscriber().subscribe('core/formElement/somePropertyChanged', (topic, [propertyPath, value, // eslint-disable-line @typescript-eslint/no-unused-vars
    oldValue, // eslint-disable-line @typescript-eslint/no-unused-vars
    formElementIdentifierPath]) => {
        if ('renderables' !== propertyPath) {
            if (!getFormEditorApp().isRootFormElementSelected() && 'label' === propertyPath) {
                getViewModel().getStructure().setTreeNodeTitle();
            }
            else if (!getFormEditorApp().getUtility().isUndefinedOrNull(formElementIdentifierPath) && getRootFormElement().get('__identifierPath') === formElementIdentifierPath) {
                getViewModel().setStructureRootElementTitle();
                getViewModel().setStageHeadline();
            }
            if (getViewModel().getPreviewMode()) {
                getFormEditorApp().renderCurrentFormPage();
            }
            else {
                getViewModel().renderAbstractStageArea(false, false);
            }
            getViewModel().addStructureValidationResults();
        }
        getFormEditorApp().setUnsavedContent(true);
    });
    /**
     * @subscribe view/formElement/removed
     */
    getPublisherSubscriber().subscribe('view/formElement/removed', (topic, [parentFormElement]) => {
        getFormEditorApp().setCurrentlySelectedFormElement(parentFormElement);
        getViewModel().renewStructure();
        getViewModel().renderAbstractStageArea();
        getViewModel().renderPagination();
        getViewModel().renderInspectorEditors();
    });
    /**
     * @subscribe view/formElement/inserted
     */
    getPublisherSubscriber().subscribe('view/formElement/inserted', (topic, [newFormElement]) => {
        getFormEditorApp().setCurrentlySelectedFormElement(newFormElement);
        getViewModel().renewStructure();
        getViewModel().renderAbstractStageArea();
        getViewModel().renderPagination();
        getViewModel().renderInspectorEditors();
    });
    /**
     * @subscribe view/collectionElement/new/added
     */
    getPublisherSubscriber().subscribe('view/collectionElement/new/added', () => {
        getViewModel().renderInspectorEditors();
    });
    /**
     * @subscribe view/collectionElement/moved
     */
    getPublisherSubscriber().subscribe('view/collectionElement/moved', () => {
        getViewModel().renderInspectorEditors(undefined, false);
    });
    /**
     * @subscribe view/collectionElement/removed
     */
    getPublisherSubscriber().subscribe('view/collectionElement/removed', () => {
        getViewModel().renderInspectorEditors(undefined, false);
    });
    /**
     * @subscribe view/insertElements/perform/bottom
     */
    getPublisherSubscriber().subscribe('view/insertElements/perform/bottom', (topic, [formElementType]) => {
        const lastRenderable = getFormEditorApp().getLastTopLevelElementOnCurrentPage();
        if (!lastRenderable) {
            getViewModel().createAndAddFormElement(formElementType, getFormEditorApp().getCurrentlySelectedPage());
        }
        else {
            if (!getFormEditorApp().getFormElementDefinition(lastRenderable, '_isTopLevelFormElement')
                && getFormEditorApp().getFormElementDefinition(lastRenderable, '_isCompositeFormElement')) {
                getViewModel().createAndAddFormElement(formElementType, getFormEditorApp().getCurrentlySelectedPage());
            }
            else {
                getViewModel().createAndAddFormElement(formElementType, lastRenderable);
            }
        }
    });
    /**
     * @publish view/formElement/inserted
     * @subscribe view/insertElements/perform/after
     */
    getPublisherSubscriber().subscribe('view/insertElements/perform/after', (topic, [formElementType]) => {
        let newFormElement;
        newFormElement = getViewModel().createAndAddFormElement(formElementType, undefined, true);
        newFormElement = getViewModel().moveFormElement(newFormElement, 'after', getFormEditorApp().getCurrentlySelectedFormElement());
        getPublisherSubscriber().publish('view/formElement/inserted', [newFormElement]);
    });
    /**
     * @subscribe view/insertElements/perform/inside
     */
    getPublisherSubscriber().subscribe('view/insertElements/perform/inside', (topic, [formElementType]) => {
        getViewModel().createAndAddFormElement(formElementType);
    });
    /**
     * @subscribe view/insertElements/perform/after
     */
    getPublisherSubscriber().subscribe('view/insertPages/perform', (topic, [formElementType]) => {
        getViewModel().createAndAddFormElement(formElementType);
    });
    /* *********************************************************
     * Modals
     * ********************************************************/
    /**
     * @subscribe view/modal/close/perform
     */
    getPublisherSubscriber().subscribe('view/modal/close/perform', () => {
        getFormEditorApp().setUnsavedContent(false);
        getViewModel().closeEditor();
    });
    /**
     * @subscribe view/modal/removeFormElement/perform
     */
    getPublisherSubscriber().subscribe('view/modal/removeFormElement/perform', (topic, [formElement]) => {
        getViewModel().removeFormElement(formElement);
    });
    /**
     * @subscribe view/modal/removeCollectionElement/perform
     */
    getPublisherSubscriber().subscribe('view/modal/removeCollectionElement/perform', (topic, [collectionElementIdentifier, collectionName, formElement,]) => {
        getViewModel().removePropertyCollectionElement(collectionElementIdentifier, collectionName, formElement);
    });
    /**
     * @subscribe view/modal/validationErrors/element/clicked
     */
    getPublisherSubscriber().subscribe('view/modal/validationErrors/element/clicked', (topic, [formElementIdentifierPath]) => {
        let oldPageIndex;
        if (getCurrentlySelectedFormElement().get('__identifierPath') !== formElementIdentifierPath) {
            oldPageIndex = getFormEditorApp().getCurrentlySelectedPageIndex();
            getFormEditorApp().setCurrentlySelectedFormElement(formElementIdentifierPath);
            if (getViewModel().getPreviewMode()) {
                getViewModel().setPreviewMode(false);
            }
            if (oldPageIndex !== getFormEditorApp().getCurrentlySelectedPageIndex()) {
                getViewModel().renderAbstractStageArea();
            }
            else {
                getViewModel().renderAbstractStageArea(false);
            }
            getViewModel().renderPagination();
            getViewModel().renderInspectorEditors();
        }
    });
}
export function bootstrap(_formEditorApp, _viewModel) {
    formEditorApp = _formEditorApp;
    viewModel = _viewModel;
    Helper.bootstrap(formEditorApp);
    subscribeEvents();
}
