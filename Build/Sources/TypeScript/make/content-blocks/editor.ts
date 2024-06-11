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

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor></content-block-editor>
 */
@customElement('content-block-editor')
export class ContentBlockEditor extends LitElement {

  @property()
    contentBlockName?: string;

  constructor() {
    super();
    console.log('ContentBlockEditor constructor');
    console.log(this.contentBlockName);
    if(this.contentBlockName !== undefined && this.contentBlockName !== '') {
      console.log('ContentBlockEditor contentBlockName is set');
    }
  }

  protected render(): TemplateResult {
    return html`
      <p>I am the Editor.</p>
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
    return this;
  }

  private _dispatchBackEvent() {
    this.dispatchEvent(new CustomEvent('contentBlockBack', {}));
  }
}
