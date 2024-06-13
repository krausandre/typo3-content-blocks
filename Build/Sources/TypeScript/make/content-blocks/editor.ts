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
import { FieldTypeSetting } from '@typo3/make/content-blocks/interface/field-type-setting';
import { ContentBlockDefinition } from '@typo3/make/content-blocks/interface/content-block-definition';
import { GroupDefinition } from '@typo3/make/content-blocks/interface/group-definition';
import { ExtensionDefinition } from '@typo3/make/content-blocks/interface/extension-definition';

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
    data?: string;
  @property()
    extensions?: string;
  @property()
    groups?: string;
  @property()
    fieldconfig?: string;

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

  init = false;
  cbDefinition: ContentBlockDefinition;
  fieldTypeList: Array<FieldTypeSetting>;
  groupList: Array<GroupDefinition>;
  extensionList: Array<ExtensionDefinition>;


  protected render(): TemplateResult {
    this.initData();
    const textarea = this.fieldTypeList.filter((fieldType) => fieldType.type === 'Textarea')[0];

    if (this.mode === 'copy') {
      this._initMultiStepWizard();
    }
    return html`
      <div class="row">
        <div class="col-4">
          <content-block-editor-left-pane
            .contentBlockYaml="${this.cbDefinition.yaml}"
            .groups="${this.groupList}"
            .extensions="${this.extensionList}"
            @fetchDragEnd="${this.fetchDragEndListener}"
          >
          </content-block-editor-left-pane>
        </div>
        <div class="col-4">
          <content-block-editor-middle-pane  @fetchDragEnd="${this.fetchDragEndListener}"></content-block-editor-middle-pane>
        </div>
        <div class="col-4">
          <content-block-editor-right-pane .schema="${textarea}" .values="${this.values}"></content-block-editor-right-pane>
        </div>
      </div>
      <button @click="${() => { this._dispatchBackEvent(); }}" type="button" class="btn btn-primary">Back
      </button>
    `;
  }

  protected initData(): void {
    if (this.init) {
      return;
    }
    this.cbDefinition = JSON.parse(this.data);
    this.fieldTypeList = JSON.parse(this.fieldconfig);
    this.groupList = JSON.parse(this.groups);
    this.extensionList = JSON.parse(this.extensions);
    this.init = true;
  }

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  protected fetchDragEndListener(event: CustomEvent) {
    console.log(event.detail);
  }

  private _initMultiStepWizard() {
    // const contentBlockData = this.data;
    MultiStepWizard.addSlide('step-1', 'Step 1', '', Severity.notice, 'Step 1', async function (slide, settings) {
      console.log(settings);
      // contentBlockData.name = 'Test';
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
