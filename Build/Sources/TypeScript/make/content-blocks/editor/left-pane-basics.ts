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
// import '@typo3/backend/element/info-box';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <editor-left-pane-basics></editor-left-pane-basics>
 */
@customElement('editor-left-pane-basics')
export class EditorLeftPaneBasics extends LitElement {
  static styles = css``;

  protected render(): TemplateResult {
    // return html`
    //   <typo3-infobox severity="2" subject="Oooops an error occured!" content="No basics are available"></typo3-infobox>
    // `;
    return html`
      <div>
        <h2>Basics</h2>
      </div>
    `;
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
