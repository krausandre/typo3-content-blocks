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

import { html, LitElement, TemplateResult, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators';
import '@typo3/backend/element/icon-element';
import '@typo3/make/content-blocks/editor/left-pane-content-block-settings';
import '@typo3/make/content-blocks/editor/left-pane-components';
import '@typo3/make/content-blocks/editor/left-pane-basics';
import { ContentBlocksYaml } from '@typo3/make/content-blocks/interface/content-block-definition';
import { GroupDefinition } from '@typo3/make/content-blocks/interface/group-definition';
import { ExtensionDefinition } from '@typo3/make/content-blocks/interface/extension-definition';

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-left-pain></content-block-editor-left-pain>
 */
@customElement('content-block-editor-left-pane')
export class ContentBlockEditorLeftPane extends LitElement {

  static styles = css`
    .left-pane-tabs-container {

    }
  `;

  @property()
    activeTab: string = 'settings';
  @property()
    groups: Array<GroupDefinition>;
  @property()
    extensions: Array<ExtensionDefinition>;
  @property()
    contentBlockYaml: ContentBlocksYaml;

  protected render(): TemplateResult {
    const isShowSettings = this.activeTab === 'settings';
    const isShowComponents = this.activeTab === 'components';
    const isShowBasics = this.activeTab === 'basics';

    return html`
      <div role="tabpanel">
        <ul class="nav nav-tabs t3js-tabs" role="tablist" id="tabs-content-elements" data-store-last-tab="1">
          <li role="presentation" class="t3js-tabmenu-item">
            <a href="#"
               @click="${() => {this.setActiveTab('settings');}}"
               title=""
               aria-selected="${isShowSettings ? 'true' : 'false'}"
               class="${isShowSettings ? 'active' : nothing}"
            >
              Settings
            </a>
          </li>
          <li role="presentation" class="t3js-tabmenu-item ">
            <a
              href="#"
              @click="${() => {this.setActiveTab('components');}}"
              title=""
              aria-selected="${isShowComponents ? 'true' : 'false'}"
              class="${isShowComponents ? 'active' : nothing}"
            >
              Components
            </a>
          </li>
          <li role="presentation" class="t3js-tabmenu-item ">
            <a href="#"
               @click="${() => {this.setActiveTab('basics');}}"
               title=""
               aria-selected="${isShowBasics ? 'true' : 'false'}"
               class="${isShowBasics ? 'active' : nothing}"
            >
              Basics
            </a>
          </li>
        </ul>
        <div class="tab-content">
          <div role="tabpanel" class="tab-pane active" id="content-elements-1">
            <div class="panel panel-tab">
              <div class="panel-body">
                ${this.renderTab()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  protected renderTab(): TemplateResult {
    switch (this.activeTab) {
      case 'settings':
        return html`<editor-left-pane-content-block-settings .contentBlockYaml="${this.contentBlockYaml}" .groups="${this.groups}" .extensions="${this.extensions}"></editor-left-pane-content-block-settings>`;
      case 'components':
        return html`<editor-left-pane-components></editor-left-pane-components>`;
      case 'basics':
        return html`<editor-left-pane-basics></editor-left-pane-basics>`;
      default:
        return html`Unknown tab: ${this.activeTab}`;
    }
  }

  private setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
