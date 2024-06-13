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
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import '@typo3/make/content-blocks/editor/draggable-field-type';
import { FieldTypeSetting } from '@typo3/make/content-blocks/interface/field-type-setting';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <editor-left-pane-components></editor-left-pane-components>
 */
@customElement('editor-left-pane-components')
export class EditorLeftPaneComponents extends LitElement {
  static styles = css``;

  @property()
    fieldTypes?: Array<FieldTypeSetting> = [
      { icon: 'form-textarea', type: 'Textarea', properties : [ { name: 'test', dataType: 'text' } ] },
      { icon: 'actions-refresh', type: 'Collection', properties : [ { name: 'test', dataType: 'text' } ] },
      { icon: 'form-checkbox', type: 'Checkbox', properties : [ { name: 'test', dataType: 'text' } ] },
    ];

  protected render(): TemplateResult {
    return html`
      <p>Components...</p>
      <ul>
        ${this.fieldTypes.map( (item) => html`
              <li>
                <draggable-field-type .fieldTypeSetting="${item}"></draggable-field-type>
              </li>` )}
      </ul>
    `;
  }
  protected test(e: CustomEvent): void {
    console.log('test' + e.detail.type);
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
