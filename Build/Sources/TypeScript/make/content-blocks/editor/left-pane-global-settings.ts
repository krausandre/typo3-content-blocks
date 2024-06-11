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

import { html, LitElement, TemplateResult, css } from 'lit';
import { customElement } from 'lit/decorators';
import '@typo3/backend/element/icon-element';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <editor-left-pane-global-settings></editor-left-pane-global-settings>
 */
@customElement('editor-left-pane-global-settings')
export class EditorLeftPaneGlobalSettings extends LitElement {
  static styles = css``;

  protected render(): TemplateResult {
    return html`
      <p>Global Settings: this is the Lit Element.</p>
    `;
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
