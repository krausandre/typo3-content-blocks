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
import '@typo3/make/content-block-list';
import '@typo3/make/content-block-editor';
import '@typo3/backend/element/spinner-element';
/*import { customElement, property } from 'lit/decorators';*/

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-gui-module></content-block-gui-module>
 */
@customElement('content-block-gui-module')
export class ContentBlockGuiModule extends LitElement {

  @property()
    status?: string;

  protected render(): TemplateResult {
    if (this.status === 'list') {
      return html`<content-block-list></content-block-list>`;
    } else if (this.status === 'editor') {
      return html`<content-block-editor></content-block-editor>`;
    } else {
      return html`<spinner-element></spinner-element>`;
    }

  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
