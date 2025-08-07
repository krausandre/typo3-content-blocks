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
import Notification from '@typo3/backend/notification';
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
import { selector } from '@typo3/core/literals';
export var MultiRecordSelectionSelectors;
(function (MultiRecordSelectionSelectors) {
    MultiRecordSelectionSelectors["actionsSelector"] = ".t3js-multi-record-selection-actions";
    MultiRecordSelectionSelectors["checkboxSelector"] = ".t3js-multi-record-selection-check";
    MultiRecordSelectionSelectors["checkboxActionsSelector"] = ".t3js-multi-record-selection-check-actions";
    MultiRecordSelectionSelectors["checkboxActionsToggleSelector"] = ".t3js-multi-record-selection-check-actions-toggle";
    MultiRecordSelectionSelectors["elementSelector"] = "[data-multi-record-selection-element]";
})(MultiRecordSelectionSelectors || (MultiRecordSelectionSelectors = {}));
var Buttons;
(function (Buttons) {
    Buttons["actionButton"] = "button[data-multi-record-selection-action]";
    Buttons["checkboxActionButton"] = "button[data-multi-record-selection-check-action]";
})(Buttons || (Buttons = {}));
var CheckboxActions;
(function (CheckboxActions) {
    CheckboxActions["checkAll"] = "check-all";
    CheckboxActions["checkNone"] = "check-none";
    CheckboxActions["toggle"] = "toggle";
})(CheckboxActions || (CheckboxActions = {}));
var CheckboxState;
(function (CheckboxState) {
    CheckboxState["any"] = "";
    CheckboxState["checked"] = ":checked";
    CheckboxState["unchecked"] = ":not(:checked)";
})(CheckboxState || (CheckboxState = {}));
/**
 * Module: @typo3/backend/multi-record-selection
 */
class MultiRecordSelection {
    static { this.activeClass = 'active'; }
    constructor() {
        this.lastChecked = null;
        DocumentService.ready().then(() => {
            MultiRecordSelection.restoreTemporaryState();
            this.registerActions();
            this.registerActionsEventHandlers();
            this.registerCheckboxActions();
            this.registerCheckboxKeyboardActions();
            this.registerCheckboxTableRowSelectionAction();
            this.registerToggleCheckboxActions();
            this.registerDispatchCheckboxStateChangedEvent();
            this.registerCheckboxStateChangedEventHandler();
        });
    }
    static getCheckboxes(state = CheckboxState.any, identifier = '') {
        return document.querySelectorAll(MultiRecordSelection.getCombinedSelector(MultiRecordSelectionSelectors.checkboxSelector + state, identifier));
    }
    static getCombinedSelector(query, identifier) {
        return identifier !== '' ? [selector `[data-multi-record-selection-identifier="${identifier}"]`, query].join(' ') : query;
    }
    static getIdentifier(element) {
        return element.closest('[data-multi-record-selection-identifier]')?.dataset.multiRecordSelectionIdentifier || '';
    }
    static changeCheckboxState(checkbox, check) {
        if (checkbox.disabled || checkbox.checked === check || checkbox.dataset.manuallyChanged) {
            // Return in case the checkbox is disabled, the state did not change or another component has already changed it
            return;
        }
        checkbox.checked = check;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
    /**
     * This restores (initializes) a temporary state, which is required in case
     * the user returns to the listing using the browsers' history back feature,
     * which will not result in a new request.
     */
    static restoreTemporaryState() {
        const checked = MultiRecordSelection.getCheckboxes(CheckboxState.checked);
        // In case nothing is checked we don't have to do anything here
        if (!checked.length) {
            return;
        }
        // Highlight each checked checkbox and toggle the corresponding actions. Since
        // the evaluation for toggling actions does a lot of things, we don't want to
        // perform this for every checked checkbox. Therefore we store the identifiers,
        // which were already evaluated and do not call the evaluation for them again.
        let actionsToggled = false;
        const identifiers = [];
        checked.forEach((checkbox) => {
            checkbox.closest(MultiRecordSelectionSelectors.elementSelector)?.classList.add(MultiRecordSelection.activeClass);
            const identifier = MultiRecordSelection.getIdentifier(checkbox);
            if (identifier !== '' && !identifiers.includes(identifier)) {
                identifiers.push(identifier);
                actionsToggled = true;
                MultiRecordSelection.toggleActionsState(identifier);
            }
        });
        // If none of the checked checkboxes contain an identifier, call the toggling one time anyways.
        if (!actionsToggled) {
            MultiRecordSelection.toggleActionsState();
        }
    }
    /**
     * Toggles the state of the actions, depending on the
     * currently selected elements and their nature.
     */
    static toggleActionsState(identifier = '') {
        const actionContainers = document.querySelectorAll(MultiRecordSelection.getCombinedSelector(MultiRecordSelectionSelectors.actionsSelector, identifier));
        if (!actionContainers.length) {
            // Early return in case no action containers are defined
            return;
        }
        if (!MultiRecordSelection.getCheckboxes(CheckboxState.checked, identifier).length) {
            // In case no checkbox is checked, hide all action containers and return
            actionContainers.forEach((container) => MultiRecordSelection.changeActionContainerVisibility(container, false));
            return;
        }
        // Remove hidden state of all action containers, since checked checkboxes exist
        actionContainers.forEach((container) => MultiRecordSelection.changeActionContainerVisibility(container));
        const actions = document.querySelectorAll([MultiRecordSelection.getCombinedSelector(MultiRecordSelectionSelectors.actionsSelector, identifier), Buttons.actionButton].join(' '));
        if (!actions.length) {
            // Early return in case no action is defined
            return;
        }
        actions.forEach((action) => {
            if (!action.dataset.multiRecordSelectionActionConfig) {
                // In case the action does not define any configuration, no toggling is possible
                return;
            }
            const configuration = JSON.parse(action.dataset.multiRecordSelectionActionConfig);
            if (!configuration.idField) {
                // Return in case the idField (where to find the id on selected elements) is not defined
                return;
            }
            // Start the evaluation by disabling the action
            action.disabled = true;
            // Get all currently checked elements
            const checked = MultiRecordSelection.getCheckboxes(CheckboxState.checked, identifier);
            for (let i = 0; i < checked.length; i++) {
                // Evaluate each checked element if it contains the specified idField
                if (checked[i].closest(MultiRecordSelectionSelectors.elementSelector)?.dataset[configuration.idField]) {
                    // If a checked element contains the idField, remove the "disabled"
                    // state and end the search since the action can be performed.
                    action.disabled = false;
                    break;
                }
            }
        });
    }
    /**
     * This primarily just adds/removes the "hidden" class of the container. In case
     * the container is in a panel, it also toggles the other panel heading elements.
     * Note: This only works in case the container is not in the wrapper class, which
     * should only be used for containers, outside of a panel.
     *
     * @param {HTMLElement} container The container to change the visibility for
     * @param {boolean} visible Whether the container should be visible or not
     */
    static changeActionContainerVisibility(container, visible = true) {
        const panelElements = container.closest('.multi-record-selection-panel')?.children;
        if (visible) {
            if (panelElements) {
                for (let i = 0; i < panelElements.length; i++) {
                    panelElements[i].classList.add('hidden');
                }
            }
            container.classList.remove('hidden');
        }
        else {
            if (panelElements) {
                for (let i = 0; i < panelElements.length; i++) {
                    panelElements[i].classList.remove('hidden');
                }
            }
            container.classList.add('hidden');
        }
    }
    /**
     * The manually changed attribute can be set by components, using
     * this module while implementing custom logic to change checkbox
     * state. To not cancel each others action, all actions in this
     * module respect this attribute before changing checkbox state.
     * Therefore, this method is called prior to every action in
     * this module, which changes checkbox states. Otherwise old
     * state would may led to misbehaviour.
     */
    static unsetManuallyChangedAttribute(identifier) {
        MultiRecordSelection.getCheckboxes(CheckboxState.any, identifier).forEach((checkbox) => {
            checkbox.removeAttribute('data-manually-changed');
        });
    }
    registerActions() {
        new RegularEvent('click', (e, target) => {
            if (!target.dataset.multiRecordSelectionAction) {
                // Return if we don't deal with a valid action
            }
            const identifier = MultiRecordSelection.getIdentifier(target);
            const configuration = JSON.parse((target.dataset.multiRecordSelectionActionConfig || '{}'));
            const checked = MultiRecordSelection.getCheckboxes(CheckboxState.checked, identifier);
            if (!checked.length) {
                // Return in case there is currently no element checked to perform the action on.
                return;
            }
            // This component does not implement any specific action itself, but just dispatches
            // an event so the implementing components can react on the triggered action. To decrease
            // selections in those components, most of the information are passed within the custom event.
            // Those are e.g. the checked checkboxes, the instance identifier and the action configuration.
            target.dispatchEvent(new CustomEvent('multiRecordSelection:action:' + target.dataset.multiRecordSelectionAction, {
                detail: { identifier: identifier, checkboxes: checked, configuration: configuration },
                bubbles: true,
                cancelable: false
            }));
        }).delegateTo(document, [MultiRecordSelectionSelectors.actionsSelector, Buttons.actionButton].join(' '));
    }
    /**
     * Other components can dispatch the "multiRecordSelection:actions"
     * events to influence the display depending on their custom logic.
     */
    registerActionsEventHandlers() {
        new RegularEvent('multiRecordSelection:actions:show', (e) => {
            const identifier = e.detail?.identifier || '';
            const actionContainers = document.querySelectorAll(MultiRecordSelection.getCombinedSelector(MultiRecordSelectionSelectors.actionsSelector, identifier));
            actionContainers.forEach((container) => MultiRecordSelection.changeActionContainerVisibility(container));
        }).bindTo(document);
        new RegularEvent('multiRecordSelection:actions:hide', (e) => {
            const identifier = e.detail?.identifier || '';
            const actionContainers = document.querySelectorAll(MultiRecordSelection.getCombinedSelector(MultiRecordSelectionSelectors.actionsSelector, identifier));
            actionContainers.forEach((container) => MultiRecordSelection.changeActionContainerVisibility(container, false));
        }).bindTo(document);
        new RegularEvent('multiRecordSelection:checkboxes:check', (e) => {
            const identifier = e.detail?.identifier || '';
            MultiRecordSelection.getCheckboxes(CheckboxState.any, identifier).forEach((checkbox) => MultiRecordSelection.changeCheckboxState(checkbox, true));
        }).bindTo(document);
        new RegularEvent('multiRecordSelection:checkboxes:uncheck', (e) => {
            const identifier = e.detail?.identifier || '';
            MultiRecordSelection.getCheckboxes(CheckboxState.any, identifier).forEach((checkbox) => MultiRecordSelection.changeCheckboxState(checkbox, false));
        }).bindTo(document);
    }
    registerCheckboxActions() {
        new RegularEvent('click', (e, target) => {
            e.preventDefault();
            if (!target.dataset.multiRecordSelectionCheckAction) {
                // Return if we don't deal with a valid action
                return;
            }
            const identifier = MultiRecordSelection.getIdentifier(target);
            const checkboxes = MultiRecordSelection.getCheckboxes(CheckboxState.any, identifier);
            if (!checkboxes.length) {
                // Return in case there are no checkboxes (elements) to perform the action on.
                return;
            }
            // Unset manually changed attribute so we can be sure, in case this is
            // set on a checkbox, while executing the requested action, the checkbox
            // was already changed by another component.
            MultiRecordSelection.unsetManuallyChangedAttribute(identifier);
            // Perform requested action
            switch (target.dataset.multiRecordSelectionCheckAction) {
                case CheckboxActions.checkAll:
                    checkboxes.forEach((checkbox) => {
                        MultiRecordSelection.changeCheckboxState(checkbox, true);
                    });
                    break;
                case CheckboxActions.checkNone:
                    checkboxes.forEach((checkbox) => {
                        MultiRecordSelection.changeCheckboxState(checkbox, false);
                    });
                    break;
                case CheckboxActions.toggle:
                    checkboxes.forEach((checkbox) => {
                        MultiRecordSelection.changeCheckboxState(checkbox, !checkbox.checked);
                    });
                    break;
                default:
                    // Unknown action
                    Notification.warning('Unknown checkbox action');
            }
            // To prevent possible side effects we simply clean up and unset the attribute here again
            MultiRecordSelection.unsetManuallyChangedAttribute(identifier);
        }).delegateTo(document, [MultiRecordSelectionSelectors.checkboxActionsSelector, Buttons.checkboxActionButton].join(' '));
    }
    registerCheckboxKeyboardActions() {
        new RegularEvent('click', (e, target) => this.handleCheckboxKeyboardActions(e, target))
            .delegateTo(document, MultiRecordSelectionSelectors.checkboxSelector);
    }
    registerCheckboxTableRowSelectionAction() {
        new RegularEvent('click', (e, target) => {
            const eventTargetTagName = e.target.tagName;
            if (eventTargetTagName !== 'TH' && eventTargetTagName !== 'TD') {
                // Only change checkbox state if the target is the row itself
                return;
            }
            const checkbox = target.querySelector(MultiRecordSelectionSelectors.checkboxSelector);
            if (checkbox === null) {
                // Return in case the table row does not contain a checkbox, handled by this component
                return;
            }
            // Note: Since we only change the state of one checkbox, we don't have to unset the
            // manually changed flag and also do not need to evaluate any instance identifier.
            MultiRecordSelection.changeCheckboxState(checkbox, !checkbox.checked);
            // After changing the target checkbox state, let's check if a keyboard action
            // should be performed as well. We also prevent the keyboard actions from unsetting
            // any state, e.g. the "manually changed flag", as this might have been set by any
            // component triggered by the above checkbox state change operation.
            this.handleCheckboxKeyboardActions(e, checkbox, false);
        }).delegateTo(document, MultiRecordSelectionSelectors.elementSelector);
        // In case row selection is enabled and a keyboard "shortcut" is used, prevent text selection on the rows
        new RegularEvent('mousedown', (e) => (e.shiftKey || e.altKey || e.ctrlKey) && e.preventDefault())
            .delegateTo(document, MultiRecordSelectionSelectors.elementSelector);
    }
    registerDispatchCheckboxStateChangedEvent() {
        new RegularEvent('change', (e, target) => {
            target.dispatchEvent(new CustomEvent('multiRecordSelection:checkbox:state:changed', {
                detail: { identifier: MultiRecordSelection.getIdentifier(target) }, bubbles: true, cancelable: false
            }));
        }).delegateTo(document, MultiRecordSelectionSelectors.checkboxSelector);
    }
    registerCheckboxStateChangedEventHandler() {
        new RegularEvent('multiRecordSelection:checkbox:state:changed', (e) => {
            const checkbox = e.target;
            const identifier = e.detail?.identifier || '';
            if (checkbox.checked) {
                checkbox.closest(MultiRecordSelectionSelectors.elementSelector).classList.add(MultiRecordSelection.activeClass);
            }
            else {
                checkbox.closest(MultiRecordSelectionSelectors.elementSelector).classList.remove(MultiRecordSelection.activeClass);
            }
            // Toggle actions for changed checkbox state
            MultiRecordSelection.toggleActionsState(identifier);
        }).bindTo(document);
    }
    registerToggleCheckboxActions() {
        new RegularEvent('click', (e, target) => {
            const identifier = MultiRecordSelection.getIdentifier(target);
            const checkAll = document.querySelector([
                MultiRecordSelection.getCombinedSelector(MultiRecordSelectionSelectors.checkboxActionsSelector, identifier),
                'button[data-multi-record-selection-check-action="' + CheckboxActions.checkAll + '"]'
            ].join(' '));
            if (checkAll !== null) {
                checkAll.disabled = !MultiRecordSelection.getCheckboxes(CheckboxState.unchecked, identifier).length;
            }
            const checkNone = document.querySelector([
                MultiRecordSelection.getCombinedSelector(MultiRecordSelectionSelectors.checkboxActionsSelector, identifier),
                'button[data-multi-record-selection-check-action="' + CheckboxActions.checkNone + '"]'
            ].join(' '));
            if (checkNone !== null) {
                checkNone.disabled = !MultiRecordSelection.getCheckboxes(CheckboxState.checked, identifier).length;
            }
            const toggle = document.querySelector([
                MultiRecordSelection.getCombinedSelector(MultiRecordSelectionSelectors.checkboxActionsSelector, identifier),
                'button[data-multi-record-selection-check-action="' + CheckboxActions.toggle + '"]'
            ].join(' '));
            if (toggle !== null) {
                toggle.disabled = !MultiRecordSelection.getCheckboxes(CheckboxState.any, identifier).length;
            }
        }).delegateTo(document, MultiRecordSelectionSelectors.checkboxActionsToggleSelector);
    }
    handleCheckboxKeyboardActions(e, target, cleanUpState = true) {
        const identifier = MultiRecordSelection.getIdentifier(target);
        // If lastChecked is not set, does no longer exist in visible DOM (e.g. because the list is paginated
        // and lastChecked is on a prev/next page), is not in the same table as current target (according to
        // the identifier) or no shortcut is used at all, add the current target as lastChecked and return.
        if (!this.lastChecked
            || !document.body.contains(this.lastChecked)
            || MultiRecordSelection.getIdentifier(this.lastChecked) !== identifier
            || (!e.shiftKey && !e.altKey && !e.ctrlKey)) {
            this.lastChecked = target;
            return;
        }
        if (cleanUpState) {
            // In case clean up is *NOT* prevented, unset manually changed attribute.
            // Usually clean up will be prevented by actions, which have already
            // performed checkbox change operations.
            MultiRecordSelection.unsetManuallyChangedAttribute(identifier);
        }
        // With the shift key, it's possible to check / uncheck a range of checkboxes
        if (e.shiftKey) {
            // To easily calculate the start and end position we need checkboxes as an array
            const checkboxes = Array.from(MultiRecordSelection.getCheckboxes(CheckboxState.any, identifier));
            // The current target is the start position
            const start = checkboxes.indexOf(target);
            // The last manually clicked / checked checkbox is the end
            const end = checkboxes.indexOf(this.lastChecked);
            // Get the checkboxes which should be changed (we use min() and max() to allow ranges in both directions)
            const checkboxesToChange = checkboxes.slice(Math.min(start, end), Math.max(start, end) + 1);
            checkboxesToChange.forEach((checkbox) => {
                // Change the state of each checkbox in question. Do not change the current target since we
                // use it's current checked state, making both "check all" and "uncheck all" possible.
                if (checkbox !== target) {
                    MultiRecordSelection.changeCheckboxState(checkbox, target.checked);
                }
            });
        }
        // We can now store the current target as lastChecked so it can be used in the next run
        this.lastChecked = target;
        // With the alt or ctrl key, it's possible to toggle the current selection
        if (e.altKey || e.ctrlKey) {
            MultiRecordSelection.getCheckboxes(CheckboxState.any, identifier).forEach((checkbox) => {
                // Toggle all checkboxes except the current target as this was already done by clicking on it
                if (checkbox !== target) {
                    MultiRecordSelection.changeCheckboxState(checkbox, !checkbox.checked);
                }
            });
        }
        // To prevent possible side effects we simply clean up and unset the attribute here again
        MultiRecordSelection.unsetManuallyChangedAttribute(identifier);
    }
}
export default new MultiRecordSelection();
