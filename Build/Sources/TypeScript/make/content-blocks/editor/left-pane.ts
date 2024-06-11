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

/**
 * Module: @typo3/module/web/ContentBlocksGui
 *
 * @example
 * <content-block-editor-left-pain></content-block-editor-left-pain>
 */
@customElement('content-block-editor-left-pane')
export class LeftPane extends LitElement {

  static styles = css`
    .left-pane-tabs-container {
      .tab-headers ul {
        margin: 0;
        padding: 0;
        display: flex;
        border-bottom: 2px solid var(--typo3-component-border-color);
      }

      .tab-headers ul li {
        list-style: none;
        padding: 1rem 1.25rem;
        position: relative;
        cursor: pointer;
      }

      .tab-headers ul li.active {
        color: var(--typo3-component-active-color);
        background: var(--typo3-component-active-bg);
        font-weight: bold;
      }

      .tab-headers ul li.active:after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        height: 2px;
        width: 100%;
        background: var(--typo3-component-active-border-color);
      }

      .active-tab, #tab-headers {
        width: 100%;
      }

      .active-tab {
        padding: 0.75rem;
      }
    }

  `;

  @property()
    activeTab: string = 'settings';


  protected render(): TemplateResult {
    const showSettings = this.activeTab === 'settings';
    const showComponents = this.activeTab === 'components';
    const showBasics = this.activeTab === 'basics';

    return html`
      <p>I am the Left pane</p>
      <div class="left-pane-tabs-container">
        <div class="tabs-headers">
          <ul>
            <li class="${showSettings ? html `active` : nothing}" @click="${() => { this.setActiveTab('settings'); }}">
              Global settings
            </li>
            <li class="${showComponents ? html `active` : nothing}" @click="${() => { this.setActiveTab('components'); }}">
              Components
            </li>
            <li class="${showBasics ? html `active` : nothing}" @click=${() => {this.setActiveTab('basics')}}>
              Basics
            </li>
          </ul>
        </div>
        <div class="active-tab">
          ${this.renderTab()}
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
        return html`Todo: Implement settings tab`;
      case 'components':
        return html`Todo: Implement components tab`;
      case 'basics':
        return html`@todo: do we need basics?`;
      default: return html`Unknown tab: ${this.activeTab}`;
    }
  }

  private setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
