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
var __decorate=function(t,e,o,n){var c,i=arguments.length,s=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(c=t[a])&&(s=(i<3?c(s):i>3?c(e,o,s):c(e,o))||s);return i>3&&s&&Object.defineProperty(e,o,s),s};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";export var ContentBlockListActionEvent;!function(t){t.contentBlockDownload="typo3:make:content-block:download",t.contentBlockEdit="typo3:make:content-block:edit",t.contentBlockCopy="typo3:make:content-block:copy",t.contentBlockDelete="typo3:make:content-block:delete"}(ContentBlockListActionEvent||(ContentBlockListActionEvent={}));let ContentBlockList=class extends LitElement{constructor(){super(),this.contentBlocks=[],this.basics=[],this.icon="actions-question-circle",this.loadContentBlocks()}render(){return html`
      <div class="list-table-container props.title">
        <h2>{{ getTableTitle }}</h2>
        <input
          type="text"
          class="form-control mb-1"
          placeholder="Search ..."
          data-model="searchQuery"
        />
        <table class="cb-list-table">
          <thead>
          <tr>
            <th scope="col" class="col-1"></th>
            <th scope="col" class="col-2">Name</th>
            <th scope="col" class="col-2">Label</th>
            <th scope="col" class="col-2">Extension</th>
            <th scope="col" class="col-1">Usages</th>
            <th scope="col" class="col-4">Actions</th>
          </tr>
          </thead>
          ${this.contentBlocks.map((t=>html`
              <tr>
                <td>
                  <typo3-backend-icon identifier="${this.icon}" size="medium"></typo3-backend-icon>
                </td>
                <td>${t.name}</td>
                <td>${t.label}</td>
                <td>${t.extension}</td>
                <td>${t.usages}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-default me-2"
                    @click="${()=>{this._dispatchEditEvent(t.name)}}"
                  >
                    <typo3-backend-icon identifier="actions-open" size="medium"></typo3-backend-icon>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn btn-default me-2"
                  >
                    <typo3-backend-icon identifier="actions-duplicate" size="medium"></typo3-backend-icon>
                    Duplicate
                  </button>
                  <button
                    type="button"
                    class="btn btn-info me-2"
                    @click="${()=>{this._downloadAction(t.name)}}"
                  >
                    <typo3-backend-icon identifier="actions-download" size="medium"></typo3-backend-icon>
                    Download
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger me-2"
                    @click="showDeleteConfirmation(item.name)"
                    data-if="item.deletable AND item.usages grater 1"
                  >
                    <typo3-backend-icon identifier="actions-delete" size="medium"></typo3-backend-icon>
                    Delete
                  </button>
                </td>
              </tr>
            `))}
        </table>
      </div>
    `}loadContentBlocks(){this.loading=!0,new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_list_cb).post({}).then((async t=>{const e=await t.resolve();this.contentBlocks=Object.keys(e.body.contentBlocks).map((t=>e.body.contentBlocks[t])),this.basics=Object.keys(e.body.basics).map((t=>e.body.basics[t])),this.loading=!1})).catch((t=>{console.error(t),this.loading=!1}))}_downloadAction(t){new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb).post({name:t},{headers:{"Content-Type":"application/json",Accept:"application/zip"}}).then((async e=>{const o=e.raw(),n=await o.blob(),c=o.headers.get("content-disposition");let i=t+".zip";if(c){const t=c.match(/filename="?([^"]+)"?/);t&&t.length>1&&(i=t[1])}i=i.replace(/"+$/,"");const s=window.URL.createObjectURL(n),a=document.createElement("a");a.href=s,a.setAttribute("download",i),document.body.appendChild(a),a.click()})).catch((t=>{console.error(t)}))}_dispatchEditEvent(t){this.dispatchEvent(new CustomEvent("contentBlockEdit",{detail:{contentBlockName:t}}))}createRenderRoot(){return this}};__decorate([property()],ContentBlockList.prototype,"contentBlocks",void 0),ContentBlockList=__decorate([customElement("content-block-list")],ContentBlockList);export{ContentBlockList};