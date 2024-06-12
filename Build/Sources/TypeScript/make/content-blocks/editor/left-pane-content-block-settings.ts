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
import { ContentBlocksYaml } from '@typo3/make/content-blocks/interface/content-block-definition';


/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <editor-left-pane-content-block-settings></editor-left-pane-content-block-settings>
 */
@customElement('editor-left-pane-content-block-settings')
export class EditorLeftPaneContentBlockSettings extends LitElement {
  static styles = css``;

  @property()
    groups: any;
  @property()
    extensions: any;
  @property()
    contentBlockYaml: ContentBlocksYaml;

  protected render(): TemplateResult {
    this.groups = JSON.parse(this.groups);
    this.groups = Object.keys(this.groups).map(key => this.groups[key]);
    this.extensions = JSON.parse(this.extensions);
    this.extensions = Object.keys(this.extensions).map(key => this.extensions[key]);
    return html`
      <div class="form-group">
        <label for="extension" class="form-label">Extension</label>
        <select class="form-control" id="extension">
          <option value="0">Choose...</option>
          ${this.extensions.map((extension: any) => html`
            <option value="${extension.package}">${extension.extension}</option>
          `)}
        </select>
      </div>
      <div class="form-group">
        <label for="vendor" class="form-label">Vendor</label>
        <input type="text" id="vendor" class="form-control" value=${this.contentBlockYaml.name} />
      </div>
      <div class="form-group">
        <label for="name" class="form-label">Name</label>
        <input type="text" id="name" class="form-control" value=${this.contentBlockYaml.name} />
      </div>
      <div class="form-group">
        <label for="title" class="form-label">Title</label>
        <input type="text" id="title" class="form-control" value="${this.contentBlockYaml.title}" />
      </div>
      <div class="form-group">
        <input type="checkbox" id="prefix" class="form-check-input" ?checked=${this.contentBlockYaml.prefixFields} />
        <label for="prefix" class="form-check-label">Prefix fields?</label>
      </div>
      <div class="form-group">
        <label for="prefix-type" class="form-label">Prefix type</label>
        <select class="form-control" id="prefix-type">
          <option value="">Choose...</option>
          <option value="full" ?selected="${this.contentBlockYaml.prefixType === 'full'}" >Full</option>
          <option value="vendor" ?selected="${this.contentBlockYaml.prefixType === 'vendor'}" >Vendor</option>
        </select>
      </div>
      <div class="form-group">
        <label for="vendor-prefix" class="form-label">Vendor prefix</label>
        <input type="text" id="vendor-prefix" class="form-control" value="${this.contentBlockYaml.vendorPrefix}" />
      </div>
      <div class="form-group">
        <label for="priority" class="form-label">Priority</label>
        <input type="number" id="priority" class="form-control" value="${this.contentBlockYaml.priority}" />
      </div>
      <div class="form-group">
        <label for="group" class="form-label">Group</label>
        <select class="form-control" id="group">
          <option value="">Choose...</option>
          ${this.groups.map((group: any) => html`
            <option value="${group.key}">${group.label}</option>
          `)}
        </select>
      </div>
      <div class="form-group">
        <a href="#" class="btn btn-success">
          <span class="t3js-icon icon icon-size-small icon-state-default icon-apps-filetree-folder-default" data-identifier="apps-filetree-folder-default" aria-hidden="true">
            <typo3-backend-icon identifier="actions-save" size="small"></typo3-backend-icon>
          </span>  Save
        </a>
      </div>
    `;
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
}
