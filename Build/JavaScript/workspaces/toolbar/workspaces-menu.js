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
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import ModuleMenu from '@typo3/backend/module-menu';
import Viewport from '@typo3/backend/viewport';
import RegularEvent from '@typo3/core/event/regular-event';
import { ModuleStateStorage } from '@typo3/backend/storage/module-state-storage';
var Identifiers;
(function (Identifiers) {
    Identifiers["scaffoldSelector"] = ".t3js-scaffold";
    Identifiers["containerSelector"] = "#typo3-cms-workspaces-backend-toolbaritems-workspaceselectortoolbaritem";
    Identifiers["activeMenuItemLinkSelector"] = ".t3js-workspaces-switchlink.active";
    Identifiers["menuItemLinkSelector"] = ".t3js-workspaces-switchlink";
    Identifiers["toolbarItemSelector"] = ".dropdown-toggle";
})(Identifiers || (Identifiers = {}));
var Classes;
(function (Classes) {
    Classes["workspaceBodyClass"] = "scaffold-in-workspace";
    Classes["workspacesTitleInToolbarClass"] = "toolbar-item-name";
})(Classes || (Classes = {}));
/**
 * Module: @typo3/workspaces/toolbar/workspaces-menu
 * toolbar menu for the workspaces functionality to switch between the workspaces
 * and jump to the workspaces module
 */
class WorkspacesMenu {
    constructor() {
        Viewport.Topbar.Toolbar.registerEvent(() => {
            this.initializeEvents();
            WorkspacesMenu.updateBackendContext();
        });
        new RegularEvent('typo3:datahandler:process', (e) => {
            const payload = e.detail.payload;
            if (payload.table === 'sys_workspace' && payload.action === 'delete' && payload.hasErrors === false) {
                Viewport.Topbar.refresh();
            }
        }).bindTo(document);
    }
    /**
     * Refresh the page tree
     */
    static refreshPageTree() {
        document.dispatchEvent(new CustomEvent('typo3:pagetree:refresh'));
    }
    /**
     * Get workspace state from the current active menu item
     */
    static getWorkspaceState() {
        const selectedWorkspaceLink = document.querySelector([Identifiers.containerSelector, Identifiers.activeMenuItemLinkSelector].join(' '));
        if (selectedWorkspaceLink === null) {
            return null;
        }
        const workspaceId = parseInt(selectedWorkspaceLink.dataset.workspaceid || '0', 10);
        return {
            id: workspaceId,
            title: selectedWorkspaceLink.innerText.trim(),
            inWorkspace: workspaceId !== 0
        };
    }
    /**
     * Adds the workspace title to the toolbar next to the username
     * and adds the check icon to the currently active menu items.
     *
     * @param {WorkspaceState} workspaceState
     */
    static updateTopBar(workspaceState) {
        const toolbarItemContainer = document.querySelector(Identifiers.containerSelector);
        // Remove the workspace title in toolbar
        toolbarItemContainer.querySelector(Identifiers.containerSelector + ' .' + Classes.workspacesTitleInToolbarClass)?.remove();
        // If we are in a workspace, add the corresponding title to the toolbar - if available
        if (workspaceState.inWorkspace && workspaceState.title) {
            const titleElement = document.createElement('span');
            titleElement.classList.add(Classes.workspacesTitleInToolbarClass);
            titleElement.textContent = workspaceState.title;
            toolbarItemContainer.querySelector(Identifiers.toolbarItemSelector).append(titleElement);
        }
    }
    /**
     * Updates backend context, especially the topbar
     */
    static updateBackendContext(workspaceState = null) {
        workspaceState ??= WorkspacesMenu.getWorkspaceState();
        if (workspaceState === null) {
            // If still no workspace state, return
            return;
        }
        const topbar = document.querySelector(Identifiers.scaffoldSelector);
        topbar.classList.toggle(Classes.workspaceBodyClass, workspaceState.inWorkspace);
        if (workspaceState.inWorkspace && !workspaceState.title) {
            workspaceState.title = TYPO3.lang['Workspaces.workspaceTitle'];
        }
        WorkspacesMenu.updateTopBar(workspaceState);
    }
    /**
     * Changes the data in the module menu and the updates the backend context
     */
    performWorkspaceSwitch(id, title) {
        const toolbarItemContainer = document.querySelector(Identifiers.containerSelector);
        // remove "active" class
        toolbarItemContainer.querySelector(Identifiers.activeMenuItemLinkSelector).classList.remove('active');
        // add "active" class to currently selected workspace
        toolbarItemContainer.querySelector(Identifiers.menuItemLinkSelector + '[data-workspaceid="' + id + '"]')?.classList.add('active');
        // Initiate backend context update
        WorkspacesMenu.updateBackendContext({ id: id, title: title, inWorkspace: id !== 0 });
    }
    initializeEvents() {
        const toolbarItemContainer = document.querySelector(Identifiers.containerSelector);
        new RegularEvent('click', (e, menuItem) => {
            e.preventDefault();
            this.switchWorkspace(parseInt(menuItem.dataset.workspaceid, 10));
        }).delegateTo(toolbarItemContainer, Identifiers.menuItemLinkSelector);
    }
    switchWorkspace(workspaceId) {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.workspace_switch)).post({
            workspaceId: workspaceId,
            pageId: ModuleStateStorage.current('web').identifier
        }).then(async (response) => {
            const data = await response.resolve();
            if (!data.workspaceId) {
                data.workspaceId = 0;
            }
            this.performWorkspaceSwitch(data.workspaceId, data.title || '');
            const currentModule = ModuleMenu.App.getCurrentModule();
            // If a user has no view permission for the requested page, the first allowed page id from its rootline is
            // returned which gets appended to the URL
            if (data.pageId) {
                let url = TYPO3.Backend.ContentContainer.getUrl();
                url += (!url.includes('?') ? '?' : '&') + 'id=' + data.pageId;
                Viewport.ContentContainer.setUrl(url);
            }
            else if (currentModule === 'workspaces_admin') {
                // Reload the workspace module and override the workspace id
                ModuleMenu.App.showModule(currentModule, 'workspace=' + workspaceId);
            }
            else if (currentModule?.startsWith('web_')) {
                // when in web module reload, otherwise send the user to the page module
                ModuleMenu.App.reloadFrames();
            }
            else if (data.pageModule) {
                ModuleMenu.App.showModule(data.pageModule);
            }
            // Refresh the pagetree if visible
            WorkspacesMenu.refreshPageTree();
            // reload the module menu
            ModuleMenu.App.refreshMenu();
        });
    }
}
const workspacesMenu = new WorkspacesMenu();
// expose the module in a global object
TYPO3.WorkspacesMenu = workspacesMenu;
export default workspacesMenu;
