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
import '@typo3/make/editor/content-block-editor-left-pain';
import '@typo3/make/editor/content-block-editor-middle-pain';
import '@typo3/make/editor/content-block-editor-right-pain';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor></content-block-editor>
 */
@customElement('content-block-editor')
export class ContentBlockEditor extends LitElement {

  @property()
    name?: string;

  protected render(): TemplateResult {
    return html`
      <p>I am the Editor</p>
      <content-block-editor-left-pain></content-block-editor-left-pain>
      <content-block-editor-middle-pain></content-block-editor-middle-pain>
      <content-block-editor-right-pain></content-block-editor-right-pain>
    `;
  }
  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
