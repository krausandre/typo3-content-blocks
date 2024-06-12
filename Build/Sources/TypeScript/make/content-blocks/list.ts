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
import { lll } from '@typo3/core/lit-helper';
import Modal from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-list></content-block-list>
 */
@customElement('content-block-list')
export class ContentBlockList extends LitElement {

  @property()
    contentBlocks: any[] = [];
  basics: any[] = [];
  icon: string = 'actions-question-circle';
  loading?: boolean;
  contentBlockData?: any;

  constructor() {
    super();
    this.loadContentBlocks();
  }

  protected render(): TemplateResult {
    return html`
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
                    ?disabled="${!item.editable}"
                    @click="${() => { this._dispatchEditEvent(item.name); }}"
                  >
                    <typo3-backend-icon identifier="actions-open" size="medium"></typo3-backend-icon>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn btn-default me-2"
                    @click="${() => { this._dispatchCopyEvent(item.name); }}"
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
                    ?disabled="${!item.deletable}"
                    @click="${() => { this._handleRemove(item.name); }}"
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

  protected async _loadContentBlockData(name: string) {
    this.loading = true;
    await new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_get_cb).post({
      name: name
    })
      .then(async (response) => {
        const data = await response.resolve();
        this.contentBlockData = data.body;
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
  }

  protected _downloadAction(name: string): void {
    new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb)
      .post({ name: name }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/zip'
        }
      })
      .then(async (response) => {
        const responseData = response.raw();
        const blob = await responseData.blob();
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
        const url = window.URL.createObjectURL(blob);
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
    this._loadContentBlockData(name)
      .then(() => {
        this.dispatchEvent(new CustomEvent('contentBlockEdit', {
          detail: {
            name: name,
            data: this.contentBlockData
          }
        }));
      }).catch(error => {
        console.error(error);
      });
  }

  protected _dispatchCopyEvent(name: string): void {
    this._loadContentBlockData(name)
      .then(() => {
        this.dispatchEvent(new CustomEvent('contentBlockCopy', {
          detail: {
            name: name,
            data: this.contentBlockData
          }
        }));
      }).catch(error => {
        console.error(error);
      });
  }
  protected _deleteAction(name: string) {
    new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_delete_cb)
      .post({
        name: name
      })
      .then(async (response) => {
        const responseData = await response.resolve();
        console.log(responseData);
        this.contentBlocks = this.contentBlocks.filter(item => item.name !== name);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  protected _handleRemove(name: string)
  {
    const modal = Modal.confirm(
      lll('make.remove.confirm.title'),
      lll('make.remove.confirm.message'),
      SeverityEnum.warning, [
        {
          text: lll('make.remove.button.close'),
          active: true,
          btnClass: 'btn-default',
          name: 'cancel',
        },
        {
          text: lll('make.remove.button.ok'),
          btnClass: 'btn-warning',
          name: 'delete',
        },
      ]
    );

    modal.addEventListener('button.clicked', (e: Event): void => {
      const target = e.target as HTMLButtonElement;
      if (target.getAttribute('name') === 'delete') {
        this._deleteAction(name);
      }
      modal.hideModal();
    });
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
