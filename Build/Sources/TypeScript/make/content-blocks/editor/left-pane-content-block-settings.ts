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
 * <editor-left-pane-content-block-settings></editor-left-pane-content-block-settings>
 */
@customElement('editor-left-pane-content-block-settings')
export class EditorLeftPaneContentBlockSettings extends LitElement {
  static styles = css``;

  protected render(): TemplateResult {
    return html`
      <p>Content Block Settings</p>
      <div class="form-group">
        <label for="extension">Extension</label>
        <select class="form-control" id="extension">
          <option value="0">Choose...</option>
          <option value="1">Extension 1</option>
          <option value="2">Extension 2</option>
        </select>
      </div>
      <div class="form-group">
        <label for="vendor">Vendor</label>
        <input type="text" id="vendor" class="form-control" />
      </div>
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" class="form-control" />
      </div>
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" class="form-control" />
      </div>
      <div class="form-group">
        <label for="prefix">Prefix fields?</label>
        <input type="checkbox" id="prefix" class="form-control" />
      </div>
      <div class="form-group">
        <label for="prefix-type">Prefix type</label>
        <select class="form-control" id="prefix-type">
          <option value="">Choose...</option>
          <option value="full">Full</option>
          <option value="vendor">Vendor</option>
        </select>
      </div>
      <div class="form-group">
        <label for="vendor-prefix">Vendor prefix</label>
        <input type="text" id="vendor-prefix" class="form-control" />
      </div>
      <div class="form-group">
        <label for="priority">Priority</label>
        <input type="number" id="priority" class="form-control" />
      </div>
      <div class="form-group">
        <label for="group">Group</label>
        <select class="form-control" id="group">
          <option value="">Choose...</option>
          <option value="group1">Group 1</option>
          <option value="group2">Group 2</option>
        </select>
      </div>
      <div class="form-group">
        <button>Save</button>
      </div>
    `;
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
