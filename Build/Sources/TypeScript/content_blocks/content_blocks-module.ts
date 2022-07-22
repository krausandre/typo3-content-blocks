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

import {MainController} from '@typo3/content-blocks/controller/main-controller';
import '@typo3/content-blocks/element/content_blocks-edit-element';
import '@typo3/content-blocks/element/content_blocks-list-element';
import '@typo3/content-blocks/element/content_blocks-choose-name-element';
import '@typo3/backend/multi-step-wizard';
import Severity from '@typo3/backend/severity';

/**
 * Module: @typo3/content-blocks/content_blocks-module
 * @exports @typo3/content-blocks/content_blocks-module
 */

class ContentBlocksModule {
  private controller: MainController = MainController.instance()
  private docHeaderCreateNewBtn: HTMLButtonElement = document.querySelector(
    '[data-identifier="contentblocks.action.create"]'
  )

  constructor() {
    this.docHeaderCreateNewBtn.onclick = this.onCreateNewContentBlockClicked
  }

  private onCreateNewContentBlockClicked(ev: Event) {
    ev.preventDefault()

    TYPO3.MultiStepWizard.addSlide(
      'new-1',
      TYPO3.lang['contentblocks.wizard.new.slide1.title'],
      '',
      Severity.info,
      TYPO3.lang['contentblocks.wizard.new.slide1.progressLabel'],
      (slide: JQuery, settings: any, identifier: string) => {
        // TYPO3.MultiStepWizard.lockNextStep();
        TYPO3.MultiStepWizard.lockPrevStep();
        slide.html(
          // This wizard is part of the "top" frame - thus we need to import the LitElement here.
          // @todo: properly generate this asset path
          `
          <script type="module"
            src="/typo3/sysext/content_blocks/Resources/Public/JavaScript/element/content_blocks-choose-name-element.js"></script>
          `
          // ... and for the same reason we are passing TYPO3.lang entries into the "top" context here.
          // (I am unsure if this is less workaroundy than loading it globally in the backend)
          + `
          <div class="mb-3">
            <typo3-content_blocks-choose-name
                typo3-lang-title="${TYPO3.lang['contentblocks.contentblock.title']}"
                typo3-lang-title-description="${TYPO3.lang['contentblocks.contentblock.title.description']}"
                typo3-lang-description="${TYPO3.lang['contentblocks.contentblock.description']}"
                typo3-lang-vendor="${TYPO3.lang['contentblocks.contentblock.vendor']}"
                typo3-lang-vendor-description="${TYPO3.lang['contentblocks.contentblock.vendor.description']}"
                typo3-lang-packagename="${TYPO3.lang['contentblocks.contentblock.packagename']}"
                typo3-lang-packagename-description="${TYPO3.lang['contentblocks.contentblock.packagename.description']}"
            ></typo3-content_blocks-choose-name>
          </div>
          `
        )
      }
    )

    TYPO3.MultiStepWizard.addSlide(
      'new-2',
      TYPO3.lang['contentblocks.wizard.new.slide2.title'],
      '',
      Severity.info,
      TYPO3.lang['contentblocks.wizard.new.slide2.progressLabel'],
      (slide: any) => {
        TYPO3.MultiStepWizard.unlockNextStep();
        // TYPO3.MultiStepWizard.lockPrevStep();
        slide.html(
          `
          <label for="t3-contentblocks-description" class="form-label">
            ${TYPO3.lang['contentblocks.contentblock.description']}
          </label>
          <textarea class="form-control" id="t3-contentblocks-description" rows="3"
            aria-describedby="t3-contentblocks-help-description"
          ></textarea>
          <div id="t3-contentblocks-help-packagename" class="form-text">
            ${TYPO3.lang['contentblocks.contentblock.description.description']}
          </div>
          `
        )
      },
    )

    TYPO3.MultiStepWizard.addFinalProcessingSlide(
      () => {
        // @todo: There's probably an API to navigate
        top.location = MainController.urls.contentBlocks.edit
      }
    ).then(
      () => TYPO3.MultiStepWizard.show()
    )
  }
}

export default new ContentBlocksModule()
