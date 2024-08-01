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
import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import ModuleMenu from"@typo3/backend/module-menu.js";import Viewport from"@typo3/backend/viewport.js";import RegularEvent from"@typo3/core/event/regular-event.js";import{ModuleStateStorage}from"@typo3/backend/storage/module-state-storage.js";var Identifiers,Classes;!function(e){e.topbarHeaderSelector=".t3js-topbar-header",e.containerSelector="#typo3-cms-workspaces-backend-toolbaritems-workspaceselectortoolbaritem",e.activeMenuItemLinkSelector=".t3js-workspaces-switchlink.active",e.menuItemLinkSelector=".t3js-workspaces-switchlink",e.toolbarItemSelector=".dropdown-toggle"}(Identifiers||(Identifiers={})),function(e){e.workspaceBodyClass="typo3-in-workspace",e.workspacesTitleInToolbarClass="toolbar-item-name"}(Classes||(Classes={}));class WorkspacesMenu{constructor(){Viewport.Topbar.Toolbar.registerEvent((()=>{this.initializeEvents(),WorkspacesMenu.updateBackendContext()})),new RegularEvent("typo3:datahandler:process",(e=>{const t=e.detail.payload;"sys_workspace"===t.table&&"delete"===t.action&&!1===t.hasErrors&&Viewport.Topbar.refresh()})).bindTo(document)}static refreshPageTree(){document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh"))}static getWorkspaceState(){const e=document.querySelector([Identifiers.containerSelector,Identifiers.activeMenuItemLinkSelector].join(" "));if(null===e)return null;const t=parseInt(e.dataset.workspaceid||"0",10);return{id:t,title:e.innerText.trim(),inWorkspace:0!==t}}static updateTopBar(e){const t=document.querySelector(Identifiers.containerSelector);if(t.querySelector(Identifiers.containerSelector+" ."+Classes.workspacesTitleInToolbarClass)?.remove(),e.inWorkspace&&e.title){const r=document.createElement("span");r.classList.add(Classes.workspacesTitleInToolbarClass),r.textContent=e.title,t.querySelector(Identifiers.toolbarItemSelector).append(r)}}static updateBackendContext(e=null){if(e??(e=WorkspacesMenu.getWorkspaceState()),null===e)return;document.querySelector(Identifiers.topbarHeaderSelector).classList.toggle(Classes.workspaceBodyClass,e.inWorkspace),e.inWorkspace&&!e.title&&(e.title=TYPO3.lang["Workspaces.workspaceTitle"]),WorkspacesMenu.updateTopBar(e)}performWorkspaceSwitch(e,t){const r=document.querySelector(Identifiers.containerSelector);r.querySelector(Identifiers.activeMenuItemLinkSelector).classList.remove("active"),r.querySelector(Identifiers.menuItemLinkSelector+'[data-workspaceid="'+e+'"]')?.classList.add("active"),WorkspacesMenu.updateBackendContext({id:e,title:t,inWorkspace:0!==e})}initializeEvents(){const e=document.querySelector(Identifiers.containerSelector);new RegularEvent("click",((e,t)=>{e.preventDefault(),this.switchWorkspace(parseInt(t.dataset.workspaceid,10))})).delegateTo(e,Identifiers.menuItemLinkSelector)}switchWorkspace(e){new AjaxRequest(TYPO3.settings.ajaxUrls.workspace_switch).post({workspaceId:e,pageId:ModuleStateStorage.current("web").identifier}).then((async t=>{const r=await t.resolve();r.workspaceId||(r.workspaceId=0),this.performWorkspaceSwitch(r.workspaceId,r.title||"");const o=ModuleMenu.App.getCurrentModule();if(r.pageId){let e=TYPO3.Backend.ContentContainer.getUrl();e+=(e.includes("?")?"&":"?")+"id="+r.pageId,Viewport.ContentContainer.setUrl(e)}else"workspaces_admin"===o?ModuleMenu.App.showModule(o,"workspace="+e):o.startsWith("web_")?ModuleMenu.App.reloadFrames():r.pageModule&&ModuleMenu.App.showModule(r.pageModule);WorkspacesMenu.refreshPageTree(),ModuleMenu.App.refreshMenu()}))}}const workspacesMenu=new WorkspacesMenu;TYPO3.WorkspacesMenu=workspacesMenu;export default workspacesMenu;