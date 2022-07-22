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
import {createRef, Ref, ref} from 'lit/directives/ref';
import '@typo3/backend/element/spinner-element';
import '@typo3/backend/element/icon-element';

@customElement('typo3-content_blocks-choose-name')
export class ContentBlocksChooseNameElement extends LitElement {
  @property({attribute: 'typo3-lang-title'}) typo3LangTitle: string
    = TYPO3.lang['contentblocks.contentblock.title'] ?? undefined;
  @property({attribute: 'typo3-lang-title-description'}) typo3LangTitleDescription: string
    = TYPO3.lang['contentblocks.contentblock.title.description'] ?? undefined;
  @property({attribute: 'typo3-lang-description'}) typo3LangDescription: string
    = TYPO3.lang['contentblocks.contentblock.description'] ?? undefined;
  @property({attribute: 'typo3-lang-vendor'}) typo3LangVendor: string
    = TYPO3.lang['contentblocks.contentblock.vendor'] ?? undefined;
  @property({attribute: 'typo3-lang-vendor-description'}) typo3LangVendorDescription: string
    = TYPO3.lang['contentblocks.contentblock.vendor.description'];
  @property({attribute: 'typo3-lang-packagename'}) typo3LangPackagename: string
    = TYPO3.lang['contentblocks.contentblock.packagename'];
  @property({attribute: 'typo3-lang-packagename-description'}) typo3LangPackagenameDescription: string
    = TYPO3.lang['contentblocks.contentblock.packagename.description'];
  name: string;
  vendor: string;
  packageName: string;
  private _titleInputRef: Ref<HTMLInputElement> = createRef();
  private _vendorInputRef: Ref<HTMLInputElement> = createRef();
  private _packageNameInputRef: Ref<HTMLInputElement> = createRef();

  createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadow DOM for Bootstrap CSS to be applied
    return this;
  }

  protected render(): TemplateResult {
    return html`
      <form class="needs-validation" novalidate>
        <label for="t3-contentblock-title" class="form-label">
          ${this.typo3LangTitle}
        </label>
        <input class="form-control" id="t3-contentblock-title"
          aria-describedby="t3-contentblock-help-title"
          required
          @keydown=${this._onTitleChange}
          @change=${this._onTitleChange}
          @change="${this.updateProperties}"
          ${ref(this._titleInputRef)}
        >
        <div id="t3-contentblocks-help-title" class="form-text">
          ${this.typo3LangTitleDescription}
        </div>

        <div class="row">
          <div class="col">
            <label for="t3-contentblocks-vendor" class="form-label">
              ${this.typo3LangVendor}
            </label>
            <input class="form-control" id="t3-contentblocks-vendor"
              aria-describedby="t3-contentblocks-help-vendor"
              required
              @change="${this.updateProperties}"
              ${ref(this._vendorInputRef)}
            >
            <div id="t3-contentblocks-help-vendor" class="form-text">
              ${this.typo3LangVendorDescription}
            </div>
          </div>
          <div class="col">
            <label for="t3-contentblocks-packagename" class="form-label">
              ${this.typo3LangPackagename}
            </label>
            <input class="form-control" id="t3-contentblocks-packagename"
              aria-describedby="t3-contentblocks-help-packagename"
              required
              @change="${this.updateProperties}"
              ${ref(this._packageNameInputRef)}
            >
            <div id="t3-contentblocks-help-packagename" class="form-text">
              ${this.typo3LangPackagenameDescription}
            </div>
          </div>
        </div>
      </form>
    `;
  }

  private _onTitleChange(ev: Event) {
    const text = (<HTMLInputElement>ev.target).value;
    const proposedPackagename = text.toLowerCase()
      // @todo: try to implement transliterations like ö => oe etc.
      // @todo: also make sure it is a valid composer package name (not starting or ending with "-" etc.)
      .replace(/\W+/g, '-')

    this._packageNameInputRef.value!.value = proposedPackagename
  };

  private updateProperties(ev: Event) {
    this.title = this._titleInputRef.value!.value
    this.vendor = this._vendorInputRef.value!.value
    this.packageName = this._packageNameInputRef.value!.value
  }
}


