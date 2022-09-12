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
import {customElement, property} from 'lit/decorators';
import {inspectorContentBlockTemplate} from '@typo3/content-blocks/element/templates/inspector-contentblock';
import {MainController} from '@typo3/content-blocks/controller/main-controller';
import '@typo3/backend/element/spinner-element';
import '@typo3/backend/element/icon-element';

@customElement('typo3-content_blocks-edit-inspector')
export class ContentBlocksEditInspectorElement extends LitElement {
  @property() cType: string;
  @property({attribute: 'field-identifier'}) fieldIdentifier: string;

  private _controller: MainController = MainController.instance(this);

  createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadow DOM for Bootstrap CSS to be applied
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  protected render(): TemplateResult {
    const field = this._controller.currentContentBlock?.fields[this.fieldIdentifier] ?? null;
    if (!field) {
      return html`
        <typo3-content_blocks-choose-name
        ></typo3-content_blocks-choose-name>
      `;
    }

    return html`
      <h2>${field.identifier}</h2>
      ${field.type}
      <code>${JSON.stringify(field.properties)}</code>
    `;
  }
}
