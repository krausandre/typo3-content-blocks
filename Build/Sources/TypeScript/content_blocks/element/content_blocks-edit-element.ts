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
import {customElement, property, state} from 'lit/decorators';
import {MainController} from '@typo3/content-blocks/controller/main-controller';
import {until} from 'lit/directives/until.js';
import '@typo3/backend/element/spinner-element';
import '@typo3/backend/element/icon-element';
import '@typo3/content-blocks/element/content_blocks-edit-inspector-element';
import {IContentBlock, IContentBlockField, IContentBlocksDictionary} from '@typo3/content-blocks/types';

@customElement('typo3-content_blocks-edit')
export class ContentBlocksEditElement extends LitElement {
  @property() cType: string;

  @state() private _activeField?: IContentBlockField;
  private _controller: MainController = MainController.instance(this);

  createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadow DOM for Bootstrap CSS to be applied
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    this._controller.loadContentBlock(this.cType)
  }

  protected render(): TemplateResult {
    // @todo: need to understand eslint:files indentation rules for ${...} here...
    return html`
      <main>
${
  until(
    this._contentBlockFields(),
    html`
        <tr>
          <td colspan=99>
            <typo3-backend-spinner></typo3-backend-spinner>
          </td>
        </tr>
      `
  )
}
      </main>
      <aside role="region" aria-labelledby="t3-contentblocks-inspector-label">
        <h2 id="t3-contentblocks-inspector-label">xlf:Inspector</h2>
        <typo3-content_blocks-edit-inspector
          cType="${this.cType}"
          field-identifier="${this._activeField?.identifier}"
        ></typo3-content_blocks-edit-inspector>
      </aside>
    `;
  }

  private async _contentBlockFields(): Promise<TemplateResult> {
    const contentBlock: IContentBlock = this._controller.currentContentBlock

    if (!contentBlock)  {
      return html``
    }

    return html`
      <h2>${contentBlock.static.title}</h2>
      <p>
        Path: <code>${contentBlock.path}</code>
      </p>
      <p>
        cType: <code>${contentBlock.static.cType}</code>
      </p>
      <fieldset>
        <legend>Fields</legend>
  ${Object.entries(contentBlock.fields).map(
    ([k, field]): TemplateResult => html`
      <a href="" @click="${(ev: Event) => {this._activeField = field; ev.preventDefault();}}">
        <div class="card ${this._activeField === field? 'border-primary': ''} mb-3">
          <h5 class="card-header">todo: field title (from xlf)</h5>
          <div class="card-body">
            <h5 class="card-title">${field.type}</h5>
            <p class="card-text">
              <code>${field.identifier}</code>
            </p>
          </div>
        </div>
      </a>
    `
  )}
      </fieldset>
    `
  }
}
