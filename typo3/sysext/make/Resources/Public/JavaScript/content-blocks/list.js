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
var __decorate=function(t,e,o,n){var c,a=arguments.length,s=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var l=t.length-1;l>=0;l--)(c=t[l])&&(s=(a<3?c(s):a>3?c(e,o,s):c(e,o))||s);return a>3&&s&&Object.defineProperty(e,o,s),s};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import{lll}from"@typo3/core/lit-helper.js";import Modal from"@typo3/backend/modal.js";import{SeverityEnum}from"@typo3/backend/enum/severity.js";let ContentBlockList=class extends LitElement{constructor(){super(),this.contentBlocks=[],this.basics=[],this.icon="actions-question-circle",this.loadContentBlocks()}render(){return html`
      <div class="list-table-container props.title">
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
                    ?disabled="${!t.editable}"
                    @click="${()=>{this._dispatchEditEvent(t.name)}}"
                  >
                    <typo3-backend-icon identifier="actions-open" size="medium"></typo3-backend-icon>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn btn-default me-2"
                    @click="${()=>{this._dispatchCopyEvent(t.name)}}"
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
                    ?disabled="${!t.deletable}"
                    @click="${()=>{this._handleRemove(t.name)}}"
                  >
                    <typo3-backend-icon identifier="actions-delete" size="medium"></typo3-backend-icon>
                    Delete
                  </button>
                </td>
              </tr>
            `))}
        </table>
      </div>
    `}loadContentBlocks(){this.loading=!0,new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_list_cb).post({}).then((async t=>{const e=await t.resolve();this.contentBlocks=Object.keys(e.body.contentBlocks).map((t=>e.body.contentBlocks[t])),this.basics=Object.keys(e.body.basics).map((t=>e.body.basics[t])),this.loading=!1})).catch((t=>{console.error(t),this.loading=!1}))}async _loadContentBlockData(t){this.loading=!0,await new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_get_cb).post({name:t}).then((async t=>{const e=await t.resolve();this.contentBlockData=e.body})).catch((t=>(console.error(t),null)))}_downloadAction(t){new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb).post({name:t},{headers:{"Content-Type":"application/json",Accept:"application/zip"}}).then((async e=>{const o=e.raw(),n=await o.blob(),c=o.headers.get("content-disposition");let a=t+".zip";if(c){const t=c.match(/filename="?([^"]+)"?/);t&&t.length>1&&(a=t[1])}a=a.replace(/"+$/,"");const s=window.URL.createObjectURL(n),l=document.createElement("a");l.href=s,l.setAttribute("download",a),document.body.appendChild(l),l.click()})).catch((t=>{console.error(t)}))}_dispatchEditEvent(t){this._loadContentBlockData(t).then((()=>{this.dispatchEvent(new CustomEvent("contentBlockEdit",{detail:{name:t,data:this.contentBlockData}}))})).catch((t=>{console.error(t)}))}_dispatchCopyEvent(t){this._loadContentBlockData(t).then((()=>{this.dispatchEvent(new CustomEvent("contentBlockCopy",{detail:{name:t,data:this.contentBlockData}}))})).catch((t=>{console.error(t)}))}_deleteAction(t){new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_delete_cb).post({name:t}).then((async e=>{const o=await e.resolve();console.log(o),this.contentBlocks=this.contentBlocks.filter((e=>e.name!==t))})).catch((t=>{console.error(t)}))}_handleRemove(t){console.log(TYPO3.lang);const e=Modal.confirm(lll("make.remove.confirm.title"),lll("make.remove.confirm.message"),SeverityEnum.warning,[{text:lll("make.remove.button.close"),active:!0,btnClass:"btn-default",name:"cancel"},{text:lll("make.remove.button.ok"),btnClass:"btn-warning",name:"delete"}]);e.addEventListener("button.clicked",(o=>{"delete"===o.target.getAttribute("name")&&this._deleteAction(t),e.hideModal()}))}createRenderRoot(){return this}};__decorate([property()],ContentBlockList.prototype,"contentBlocks",void 0),ContentBlockList=__decorate([customElement("content-block-list")],ContentBlockList);export{ContentBlockList};