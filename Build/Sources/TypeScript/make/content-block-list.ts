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
/*import { customElement, property } from 'lit/decorators';*/

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-list></content-block-list>
 */
@customElement('content-block-list')
export class ContentBlockList extends LitElement {

  @property()
    name?: string;

  icon: string = 'actions-question-circle';

  protected render(): TemplateResult {
    return html`
      <p>I am the Lit: ${ this.name }</p>

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
          <tr
            data-for="item in filteredItems"
            data-key="item.name"
          >
            <td>
              <typo3-backend-icon identifier="${this.icon}" size="medium"></typo3-backend-icon>
              <!-- Icon :identifier="iconListStore.getIconByIdentifier(item.name)" size="medium" --->
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.label }}</td>
            <td>{{ item.extension }}</td>
            <td>{{ item.usages }}</td>
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
                @click="copy(item.name)"
              >
                <typo3-backend-icon identifier="actions-duplicate" size="medium"></typo3-backend-icon>
                Duplicate
              </button>
              <button
                type="button"
                class="btn btn-info me-2"
                @click="download(item.name)"
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
        </table>
      </div>
    `;
  }
  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
