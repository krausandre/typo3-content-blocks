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

import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
/*import { customElement, property } from 'lit/decorators';*/


export enum ContentBlockListActionEvent {
  contentBlockDownload = 'typo3:make:content-block:download',
  contentBlockEdit = 'typo3:make:content-block:edit',
  contentBlockCopy = 'typo3:make:content-block:copy',
  contentBlockDelete = 'typo3:make:content-block:delete',
}

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-list></content-block-list>
 */
@customElement('content-block-list')
export class List extends LitElement {

  @property()
    contentBlocks: any[] = [];
  basics: any[] = [];
  icon: string = 'actions-question-circle';
  loading?: boolean;

  constructor() {
    super();
    this.loadContentBlocks();
  }

  protected render(): TemplateResult {
    return html`
      <div class="list-table-container" :class="props.title">
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
          ${this.contentBlocks.map((item) =>
    html`
              <tr>
                <td>
                  <typo3-backend-icon identifier="${this.icon}" size="medium"></typo3-backend-icon>
                </td>
                <td>${ item.name }</td>
                <td>${ item.label }</td>
                <td>${ item.extension }</td>
                <td>${ item.usages }</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-default me-2"
                    @click="edit(item.name)"
                    data-if="item.editable"
                  >
                    <typo3-backend-icon identifier="actions-open" size="medium"></typo3-backend-icon>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn btn-default me-2"
                    @click="${this._dispatchEditEvent}"
                  >
                    <typo3-backend-icon identifier="actions-duplicate" size="medium"></typo3-backend-icon>
                    Duplicate
                  </button>
                  <button
                    type="button"
                    class="btn btn-info me-2"
                    @click="${() => { this._downloadAction(item.name); }}"
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
            `
  )}
        </table>
      </div>
    `;
  }

  protected loadContentBlocks(): void {
    this.loading = true;
    new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_list_cb).post({})
      .then(async (response) => {
        const data = await response.resolve();
        this.contentBlocks = Object.keys(data.body.contentBlocks).map(key => data.body.contentBlocks[key])
        this.basics = Object.keys(data.body.basics).map(key => data.body.basics[key])
        this.loading = false;
      })
      .catch((error) => {
        console.error(error);
        this.loading = false;
      });
  }

  protected _downloadAction(name: string): void {
    console.log('downloadAction');
    console.log(name);
    new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb)
      .post({ name: name }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/zip'
        }
      })
      .then(async (response) => {
        const responseData = await response.dereference();
        const contentDisposition = responseData.headers.get('content-disposition');
        let filename = name + '.zip';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch.length > 1) {
            filename = filenameMatch[1];
          }
        }

        // Entferne mögliche Anführungszeichen am Ende des Dateinamens
        filename = filename.replace(/"+$/, '');

        // Erstelle eine URL für den Blob und triggere den Download
        // @ts-expect-error unknown type
        const url = window.URL.createObjectURL(new Blob(responseData.body, { type: 'application/zip' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); // Setze den ursprünglichen Dateinamen

        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  protected _dispatchEditEvent(name: string): void {
    console.log('dispatchEditEvent');
    console.log(name);
    this.dispatchEvent(new CustomEvent('contentBlockEdit', {
      // bubbles: true,
      // composed: true,
      detail: {
        name: name
      }
    }));
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
