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
import { ScaffoldIdentifierEnum } from './enum/viewport/scaffold-identifier';
import { flushModuleCache, ModuleSelector, ModuleUtility } from '@typo3/backend/module';
import PersistentStorage from './storage/persistent';
import Viewport from './viewport';
import ClientRequest from './event/client-request';
import TriggerRequest from './event/trigger-request';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import RegularEvent from '@typo3/core/event/regular-event';
import { ModuleStateStorage } from './storage/module-state-storage';
import { selector } from '@typo3/core/literals';
import DocumentService from '@typo3/core/document-service';
import { Collapse } from 'bootstrap';
import { KeyTypesEnum } from '@typo3/backend/enum/key-types';
var ModuleMenuSelector;
(function (ModuleMenuSelector) {
    ModuleMenuSelector["menu"] = "[data-modulemenu]";
    ModuleMenuSelector["item"] = "[data-modulemenu-identifier]";
    ModuleMenuSelector["collapsible"] = "[data-modulemenu-collapsible=\"true\"]";
})(ModuleMenuSelector || (ModuleMenuSelector = {}));
/**
 * Class to render the module menu and handle the BE navigation
 * Module: @typo3/backend/module-menu
 */
class ModuleMenu {
    constructor() {
        this.loadedModule = null;
        DocumentService.ready().then(() => {
            this.initialize();
        });
    }
    static getModuleMenuItemFromElement(element) {
        const item = {
            identifier: element.dataset.modulemenuIdentifier,
            level: element.parentElement.dataset.modulemenuLevel ? parseInt(element.parentElement.dataset.modulemenuLevel, 10) : null,
            collapsible: element.dataset.modulemenuCollapsible === 'true',
            expanded: element.attributes.getNamedItem('aria-expanded')?.value === 'true',
            element: element,
        };
        return item;
    }
    /**
     * Fetches all module menu elements in the local storage that should be collapsed
     *
     * @returns {Object}
     */
    static getCollapsedMainMenuItems() {
        if (PersistentStorage.isset('modulemenu')) {
            return JSON.parse(PersistentStorage.get('modulemenu'));
        }
        else {
            return {};
        }
    }
    /**
     * Adds a module menu item to the local storage
     *
     * @param {string} item
     */
    static addCollapsedMainMenuItem(item) {
        const existingItems = ModuleMenu.getCollapsedMainMenuItems();
        existingItems[item] = true;
        PersistentStorage.set('modulemenu', JSON.stringify(existingItems));
    }
    /**
     * Removes a module menu item from the local storage
     *
     * @param {string} item
     */
    static removeCollapseMainMenuItem(item) {
        const existingItems = this.getCollapsedMainMenuItems();
        delete existingItems[item];
        PersistentStorage.set('modulemenu', JSON.stringify(existingItems));
    }
    /**
     * Prepends previously saved record id to the url params
     *
     * @param {Object} moduleData
     * @param {string} params query string parameters for module url
     * @return {string}
     */
    static includeId(moduleData, params) {
        if (!moduleData.navigationComponentId) {
            return params;
        }
        // get id
        let section = '';
        if (moduleData.navigationComponentId === '@typo3/backend/tree/page-tree-element') {
            section = 'web';
        }
        else {
            section = moduleData.name.split('_')[0];
        }
        const moduleStateStorage = ModuleStateStorage.current(section);
        if (moduleStateStorage.identifier) {
            params = 'id=' + encodeURIComponent(moduleStateStorage.identifier) + '&' + params;
        }
        return params;
    }
    static toggleMenu(collapse) {
        const scaffold = document.querySelector(ScaffoldIdentifierEnum.scaffold);
        const expandedClass = 'scaffold-modulemenu-expanded';
        if (typeof collapse === 'undefined') {
            collapse = scaffold.classList.contains(expandedClass);
        }
        scaffold.classList.toggle(expandedClass, !collapse);
        if (!collapse) {
            scaffold.classList.remove('scaffold-toolbar-expanded');
        }
        // Persist collapsed state in the UC of the current user
        PersistentStorage.set('BackendComponents.States.typo3-module-menu', {
            collapsed: collapse,
        });
    }
    static toggleModuleGroup(element, expand) {
        const menuItem = ModuleMenu.getModuleMenuItemFromElement(element);
        const moduleGroup = menuItem.element.closest('.modulemenu-group');
        const moduleGroupContainer = moduleGroup.querySelector('.modulemenu-group-container');
        const collapseInstance = Collapse.getOrCreateInstance(moduleGroupContainer, {
            toggle: false // Do not auto-toggle on init.
        });
        if (expand === undefined) {
            // No intended state given: toggle state.
            expand = !menuItem.expanded;
        }
        else if (expand === menuItem.expanded) {
            // Intended state is already reached.
            return;
        }
        if (!expand) {
            ModuleMenu.addCollapsedMainMenuItem(menuItem.identifier);
            collapseInstance.hide();
        }
        else {
            ModuleMenu.removeCollapseMainMenuItem(menuItem.identifier);
            collapseInstance.show();
        }
        moduleGroup.classList.toggle('modulemenu-group-collapsed', !expand);
        moduleGroup.classList.toggle('modulemenu-group-expanded', expand);
        element.setAttribute('aria-expanded', (expand).toString());
    }
    static highlightModule(identifier) {
        // Handle modulemenu
        const menu = document.querySelector(ModuleMenuSelector.menu);
        menu.querySelectorAll(ModuleMenuSelector.item).forEach((element) => {
            element.classList.remove('modulemenu-action-active');
            element.removeAttribute('aria-current');
        });
        // Handle toolbar
        //
        // This is a workaround, to ensure the toolbar module links are handled.
        // There is no dedicated module rendering in the toolbar, so we rely on this
        // workaround until this changes. Even the code matches the handling of
        // module-menu-items we keep this separate to show the problem here.
        const toolbar = document.querySelector('.t3js-scaffold-toolbar');
        toolbar.querySelectorAll(ModuleSelector.link + '.dropdown-item').forEach((element) => {
            element.classList.remove('active');
            element.removeAttribute('aria-current');
        });
        const module = ModuleUtility.getFromName(identifier);
        this.highlightModuleMenuItem(module, true);
    }
    static highlightModuleMenuItem(module, current = true) {
        // Handle modulemenu
        const menu = document.querySelector(ModuleMenuSelector.menu);
        const menuElements = menu.querySelectorAll(ModuleMenuSelector.item + selector `[data-modulemenu-identifier="${module.name}"]`);
        menuElements.forEach((element) => {
            element.classList.add('modulemenu-action-active');
            if (current) {
                element.setAttribute('aria-current', 'location');
            }
        });
        // Handle toolbar
        //
        // This is a workaround, to ensure the toolbar module links are handled.
        // There is no dedicated module rendering in the toolbar, so we rely on this
        // workaround until this changes. Even the code matches the handling of
        // module-menu-items we keep this separate to show the problem here.
        const toolbar = document.querySelector('.t3js-scaffold-toolbar');
        const toolbarElements = toolbar.querySelectorAll(ModuleSelector.link + selector `[data-moduleroute-identifier="${module.name}"].dropdown-item`);
        toolbarElements.forEach((element) => {
            element.classList.add('active');
            if (current) {
                element.setAttribute('aria-current', 'location');
            }
        });
        if (menuElements.length > 0 || toolbarElements.length > 0) {
            current = false;
        }
        if (module.parent !== '') {
            this.highlightModuleMenuItem(ModuleUtility.getFromName(module.parent), current);
        }
    }
    static getPreviousItem(item) {
        const previousParent = item.parentElement.previousElementSibling; // previous <li>
        if (previousParent === null) {
            return ModuleMenu.getLastItem(item);
        }
        return previousParent.firstElementChild; // the <element>
    }
    static getNextItem(item) {
        const nextParent = item.parentElement.nextElementSibling; // next <li>
        if (nextParent === null) {
            return ModuleMenu.getFirstItem(item);
        }
        return nextParent.firstElementChild; // the <element>
    }
    static getFirstItem(item) {
        // from <element> up to <ul> and down to <element> of first <li>
        return item.parentElement.parentElement.firstElementChild.firstElementChild;
    }
    static getLastItem(item) {
        // from <element> up to <ul> and down to <element> of first <li>
        return item.parentElement.parentElement.lastElementChild.firstElementChild;
    }
    static getParentItem(item) {
        // from <element> up to <ul> and the <li> above and down down its <element>
        return item.parentElement.parentElement.parentElement.firstElementChild;
    }
    static getFirstChildItem(item) {
        // the first <li> of the <ul> following the <element>, then down down its <element>
        return item.nextElementSibling.firstElementChild.firstElementChild;
    }
    /**
     * Refresh the HTML by fetching the menu again
     */
    refreshMenu() {
        return new AjaxRequest(TYPO3.settings.ajaxUrls.modulemenu).get().then(async (response) => {
            const result = await response.resolve();
            document.getElementById('modulemenu').outerHTML = result.menu;
            flushModuleCache();
            this.initializeModuleMenuEvents();
            if (this.loadedModule) {
                ModuleMenu.highlightModule(this.loadedModule);
            }
        });
    }
    getCurrentModule() {
        return this.loadedModule;
    }
    /**
     * Reloads the frames
     *
     * Hint: This method can't be static (yet), as this must be bound to the ModuleMenu instance.
     */
    reloadFrames() {
        Viewport.ContentContainer.refresh();
    }
    /**
     * Event handler called after clicking on the module menu item
     */
    showModule(name, params, event = null) {
        params = params || '';
        const moduleData = ModuleUtility.getFromName(name);
        return this.loadModuleComponents(moduleData, params, new ClientRequest('typo3.showModule', event));
    }
    initialize() {
        if (document.querySelector(ModuleMenuSelector.menu) === null) {
            return;
        }
        this.initializeModuleMenuEvents();
        Viewport.Topbar.Toolbar.registerEvent(() => {
            // Only initialize top bar events when top bar exists.
            // E.g. install tool has no top bar
            if (document.querySelector('.t3js-scaffold-toolbar')) {
                this.initializeTopBarEvents();
            }
        });
    }
    /**
     * Implement the complete keyboard navigation of the menus
     */
    keyboardNavigation(event, target) {
        const menuItem = ModuleMenu.getModuleMenuItemFromElement(target);
        let item = null;
        switch (event.key) {
            case KeyTypesEnum.UP:
                item = ModuleMenu.getPreviousItem(menuItem.element);
                break;
            case KeyTypesEnum.DOWN:
                item = ModuleMenu.getNextItem(menuItem.element);
                break;
            case KeyTypesEnum.LEFT:
                if (menuItem.collapsible) {
                    ModuleMenu.toggleModuleGroup(menuItem.element, false);
                }
                if (menuItem.level > 1) {
                    item = ModuleMenu.getParentItem(menuItem.element);
                }
                break;
            case KeyTypesEnum.RIGHT:
                if (menuItem.collapsible) {
                    ModuleMenu.toggleModuleGroup(menuItem.element, true);
                    item = ModuleMenu.getFirstChildItem(menuItem.element);
                }
                break;
            case KeyTypesEnum.HOME:
                if (event.ctrlKey && menuItem.level > 1) {
                    item = document.querySelector(ModuleMenuSelector.menu + ' ' + ModuleMenuSelector.item);
                    break;
                }
                item = ModuleMenu.getFirstItem(menuItem.element);
                break;
            case KeyTypesEnum.END:
                if (event.ctrlKey && menuItem.level > 1) {
                    item = ModuleMenu.getLastItem(document.querySelector(ModuleMenuSelector.menu + ' ' + ModuleMenuSelector.item));
                }
                else {
                    item = ModuleMenu.getLastItem(menuItem.element);
                }
                break;
            case KeyTypesEnum.SPACE:
            case KeyTypesEnum.ENTER:
                // we do not want the click handler to run, need to prevent default immediately
                event.preventDefault();
                if (event.repeat) {
                    // Ignore repeated event invocation
                    break;
                }
                if (menuItem.collapsible) {
                    // Always select the first element of sub-menu on ENTER/SPACE. Open sub-menu if necessary.
                    ModuleMenu.toggleModuleGroup(menuItem.element, true);
                    item = ModuleMenu.getFirstChildItem(menuItem.element);
                }
                else {
                    menuItem.element.click();
                }
                break;
            case KeyTypesEnum.ESCAPE:
                // Close sub-menu on ESCAPE either from inside sub-menu or when trigger-button is focused.
                if (menuItem.level > 1) {
                    item = ModuleMenu.getParentItem(menuItem.element);
                }
                else if (menuItem.level === 1 && menuItem.collapsible) {
                    item = menuItem.element;
                }
                if (item !== null) {
                    ModuleMenu.toggleModuleGroup(item, false);
                }
                break;
            default:
                item = null;
        }
        if (item !== null) {
            // Disable additional scrolling e.g. triggered by arrow-keypress.
            event.preventDefault();
            item.focus();
        }
    }
    initializeModuleMenuEvents() {
        const moduleMenu = document.querySelector(ModuleMenuSelector.menu);
        new RegularEvent('keydown', this.keyboardNavigation)
            .delegateTo(moduleMenu, ModuleMenuSelector.item);
        new RegularEvent('click', (event, target) => {
            event.preventDefault();
            const moduleRoute = ModuleUtility.getRouteFromElement(target);
            this.showModule(moduleRoute.identifier, moduleRoute.params, event);
        }).delegateTo(moduleMenu, ModuleSelector.link);
        new RegularEvent('click', (event, target) => {
            event.preventDefault();
            ModuleMenu.toggleModuleGroup(target);
        }).delegateTo(moduleMenu, ModuleMenuSelector.collapsible);
        new RegularEvent('shown.bs.collapse', (event, target) => {
            // Wait for collapsible to become fully visible, then scroll module-group into view if necessary.
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }).delegateTo(moduleMenu, '.modulemenu-group');
    }
    /**
     * Initialize events for label toggle and help menu
     */
    initializeTopBarEvents() {
        const toolbar = document.querySelector('.t3js-scaffold-toolbar');
        new RegularEvent('click', (event, target) => {
            event.preventDefault();
            const moduleRoute = ModuleUtility.getRouteFromElement(target);
            this.showModule(moduleRoute.identifier, moduleRoute.params, event);
        }).delegateTo(toolbar, ModuleSelector.link);
        new RegularEvent('click', (e) => {
            e.preventDefault();
            ModuleMenu.toggleMenu();
        }).bindTo(document.querySelector('.t3js-topbar-button-modulemenu'));
        new RegularEvent('click', (e) => {
            e.preventDefault();
            ModuleMenu.toggleMenu(true);
        }).bindTo(document.querySelector('.t3js-scaffold-content-overlay'));
        const moduleLoadListener = (evt) => {
            const moduleName = evt.detail.module;
            if (!moduleName || this.loadedModule === moduleName) {
                return;
            }
            const moduleData = ModuleUtility.getFromName(moduleName);
            if (!moduleData.link) {
                return;
            }
            ModuleMenu.highlightModule(moduleName);
            this.loadedModule = moduleName;
            // Synchronise navigation container if module is a standalone module (linked via ModuleMenu).
            // Do not hide navigation for intermediate modules like record_edit, which may be used
            // with our without a navigation component, depending on the context.
            if (moduleData.navigationComponentId) {
                Viewport.NavigationContainer.showComponent(moduleData.navigationComponentId);
            }
            else {
                Viewport.NavigationContainer.hide();
            }
        };
        document.addEventListener('typo3-module-load', moduleLoadListener);
        document.addEventListener('typo3-module-loaded', moduleLoadListener);
    }
    /**
     * Shows requested module (e.g. list/page)
     */
    loadModuleComponents(moduleData, params, interactionRequest) {
        const moduleName = moduleData.name;
        // Allow other components e.g. Formengine to cancel switching between modules
        // (e.g. you have unsaved changes in the form)
        const promise = Viewport.ContentContainer.beforeSetUrl(interactionRequest);
        promise.then(() => {
            if (moduleData.navigationComponentId) {
                Viewport.NavigationContainer.showComponent(moduleData.navigationComponentId);
            }
            else {
                Viewport.NavigationContainer.hide();
            }
            ModuleMenu.highlightModule(moduleName);
            this.loadedModule = moduleName;
            params = ModuleMenu.includeId(moduleData, params);
            this.openInContentContainer(moduleName, moduleData.link, params, new TriggerRequest('typo3.loadModuleComponents', interactionRequest));
        });
        return promise;
    }
    openInContentContainer(module, url, params, interactionRequest) {
        const urlToLoad = url + (params ? (url.includes('?') ? '&' : '?') + params : '');
        return Viewport.ContentContainer.setUrl(urlToLoad, new TriggerRequest('typo3.openInContentFrame', interactionRequest), module);
    }
}
let moduleMenuApp = top?.TYPO3?.ModuleMenu;
if (!moduleMenuApp) {
    moduleMenuApp = {
        App: new ModuleMenu(),
    };
    if (top.TYPO3 !== undefined) {
        top.TYPO3.ModuleMenu = moduleMenuApp;
    }
}
export default moduleMenuApp;
