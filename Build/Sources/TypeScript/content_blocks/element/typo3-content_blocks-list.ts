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

import {html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators';
import {MainController} from '@typo3/content-blocks/controller/main-controller';
import {until} from 'lit/directives/until.js';
import '@typo3/backend/element/spinner-element';
import '@typo3/backend/element/icon-element';
import {IContentBlocksDictionary} from '@typo3/content-blocks/types';

@customElement('typo3-content_blocks-list')
export class ContentBlocksList extends LitElement {
  private _controller: MainController = MainController.instance(this);

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  protected render(): TemplateResult {
    return html`
      <div class="table-fit">
        <table id="content_blocks-list" class="table table-striped table-hover">
          <thead>
          <tr>
            <th></th>
            <th>
              XLF:name
            </th>
            <th>
              XLF:location
            </th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          ${until(this._contentBlocksTableRows(), html`
            <tr>
              <td colspan=99>
                <typo3-backend-spinner></typo3-backend-spinner>
              </td>
            </tr>`)}
          </tbody>
        </table>
      </div>
    `;
  }

  private async _contentBlocksTableRows() {
    const contentBlocks: IContentBlocksDictionary = await this._controller.contentBlocks()

    return Object.entries(contentBlocks).map(
      ([k, v]): TemplateResult => html`
        <tr>
          <td class="col-icon">
              <span title="id=TODO:" data-bs-toggle="tooltip" data-bs-placement="right">
                <typo3-backend-icon identifier="actions-question" size="small"></typo3-backend-icon>
              </span>
          </td>
          <td class="col-title">
            <a href="" title="TODO_XLF:edit">
              ${v.key}
            </a>
          </td>
          <td>
            <code>${v.path}</code>
          </td>
          <td class="col-control">
            <a href="" data-identifier="showReferences">
              <span class="badge badge-info">
                xxx
                xlf:references
              </span>
            </a>
          </td>
          <td>
            <div class="btn-group" role="group">
              <a href=""
                title="XLF:edit"
                class="btn btn-default form-record-open">
                <typo3-backend-icon identifier="actions-open" size="small"></typo3-backend-icon>
              </a>
            </div>
            <div class="btn-group dropdown position-static">
              <a href=""
                class="btn btn-default dropdown-toggle dropdown-toggle-no-chevron"
                data-bs-toggle="dropdown" data-bs-boundary="window" aria-expanded="false">
                <typo3-backend-icon identifier="actions-menu-alternative" size="small"></typo3-backend-icon>
                <typo3-backend-icon identifier="actions-caret-down"></typo3-backend-icon>
              </a>
              <ul class="dropdown-menu dropdown-list">
                <li>
                  <a href="#" class="dropdown-item"
                    data-bs-original-title="xlf:duplicate"
                    data-identifier="duplicateForm"
                  >
                    <typo3-backend-icon identifier="actions-duplicate" size="small"></typo3-backend-icon>
                    XLF:duplicate
                  </a>
                </li>
                <li>
                  <a href="#" class="dropdown-item">
                    <typo3-backend-icon identifier="actions-eye-link" size="small"></typo3-backend-icon>
                    XLF:show_references
                  </a>
                </li>
                <li>
                  <a href="#" class="dropdown-item"
                    data-bs-original-title="xlf:delete_form"
                    data-identifier="removeForm"
                  >
                    <typo3-backend-icon identifier="actions-edit-delete" size="small"></typo3-backend-icon>
                    XLF:delete
                  </a>
                </li>
              </ul>
            </div>
          </td>
          <td></td>
        </tr>
      `
    )
  }
}
