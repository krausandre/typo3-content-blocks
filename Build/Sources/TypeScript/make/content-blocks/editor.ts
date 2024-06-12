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
import '@typo3/make/content-blocks/editor/left-pane';
import '@typo3/make/content-blocks/editor/middle-pane';
import '@typo3/make/content-blocks/editor/right-pane';
import MultiStepWizard from '@typo3/backend/multi-step-wizard';
import Severity from '@typo3/backend/severity';

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
  @property()
    mode?: string;
  @property()
    data?: any;
  @property()
    extensions?: any;
  @property()
    groups?: any;
  @property()
    fieldconfig?: any;

  values = {
    'identifier': 'text1',
    'type': 'Textarea',
    'default': 'default text',
    'placeholder': 'placeholder text',
    'required': false,
    'enableRichtext': true,
    'richtextConfiguration': 'full',
    'rows': 5,
  };

  protected render(): TemplateResult {
    this.data = JSON.parse(this.data);
    this.fieldconfig = JSON.parse(this.fieldconfig);
    const textarea = JSON.stringify(this.fieldconfig.textarea);
    if (this.mode === 'copy') {
      this._initMultiStepWizard();
    }
    return html`
      <div class="row">
        <div class="col-4">
          <content-block-editor-left-pane .contentBlockYaml="${this.data.yaml}" groups="${this.groups}" extensions="${this.extensions}"></content-block-editor-left-pane>
        </div>
        <div class="col-4">
          <content-block-editor-middle-pane></content-block-editor-middle-pane>
        </div>
        <div class="col-4">
          <content-block-editor-right-pane .fieldconfig="${textarea}" .values="${this.values}"></content-block-editor-right-pane>
        </div>
      </div>
      <button @click="${() => { this._dispatchBackEvent(); }}" type="button" class="btn btn-primary">Back
      </button>
    `;
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  private _initMultiStepWizard() {
    const contentBlockData = this.data;
    MultiStepWizard.addSlide('step-1', 'Step 1', '', Severity.notice, 'Step 1', async function (slide, settings) {
      console.log(settings);
      contentBlockData.name = 'Test';
      MultiStepWizard.unlockNextStep();
      slide.html('<h2>Select vendor</h2><p><select><option value="1">Sample</option></select></p>');
    });
    MultiStepWizard.addSlide('step-2', 'Step 2', '', Severity.notice, 'Step 2', async function (slide, settings) {
      console.log(settings);
      slide.html('Test 2');
      MultiStepWizard.unlockPrevStep();
    });
    MultiStepWizard.show();
  }

  private _dispatchBackEvent() {
    this.dispatchEvent(new CustomEvent('contentBlockBack', {}));
  }
}
