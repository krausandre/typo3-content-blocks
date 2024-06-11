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
import '@typo3/make/content-blocks/editor/left-pane';
import '@typo3/make/content-blocks/editor/middle-pane';
import '@typo3/make/content-blocks/editor/right-pane';
import AjaxRequest from '@typo3/core/ajax/ajax-request';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor></content-block-editor>
 */
@customElement('content-block-editor')
export class ContentBlockEditor extends LitElement {

  @property()
    contentBlockData: any;
  name?: string;
  loading?: boolean;


  constructor() {
    super();
    this.name = '';
    this.loading = false;
    this.contentBlockData = {
      name: '',
      yaml: {},
      icon: {},
      iconHideInMenu: {},
      hostExtension: '',
      extPath: ''
    }
  }
  protected render(): TemplateResult {
    if (this.loading) {
      return this.renderLoader();
    }
    return html`
      <div class="row">
        <div class="col-4">
          <content-block-editor-left-pane></content-block-editor-left-pane>
        </div>
        <div class="col-4">
          <content-block-editor-middle-pane></content-block-editor-middle-pane>
        </div>
        <div class="col-4">
          <content-block-editor-right-pane></content-block-editor-right-pane>
        </div>
      </div>
      <button @click="${() => { this._dispatchBackEvent(); }}" type="button" class="btn btn-primary">Back</button>
    `;
  }
  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    // @todo maybe create a reactive controller for this? (https://lit.dev/docs/composition/controllers/#using-a-controller)
    this._fetchContentBlockData();

    return this;
  }

  protected renderLoader(): TemplateResult
  {
    return html`
      <div class="loader">
          <typo3-backend-icon identifier="spinner-circle" size="medium"></typo3-backend-icon>
      </div>
      `;
  }

  private _fetchContentBlockData() {
    this.loading = true;
    new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_get_cb).post({
      name: this.name
    })
      .then(async (response) => {
        const data = await response.resolve();
        this.contentBlockData = data.body;
        this.loading = false;
      })
      .catch((error) => {
        console.error(error);
        this.loading = false;
      });
  }
  private _dispatchBackEvent() {
    this.dispatchEvent(new CustomEvent('contentBlockBack', {}));
  }
}
