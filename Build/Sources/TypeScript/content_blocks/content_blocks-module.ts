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
//import '@typo3/backend/multi-step-wizard';
import Severity from '@typo3/backend/severity';
import {ContentBlocksChooseNameElement} from '@typo3/content-blocks/element/content_blocks-choose-name-element';
import {html} from 'lit';
import {default as Modal, ModalElement} from '@typo3/backend/modal';
import {default as MultiStepWizard} from '@typo3/backend/multi-step-wizard';

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
    console.log(1, document)
    let a = new ContentBlocksChooseNameElement();
    MultiStepWizard.addSlide(
      'new-1',
      // @todo import {lll} from '@typo3/core/lit-helper';
      TYPO3.lang['contentblocks.wizard.new.slide1.title'],
      '', //a.outerHTML,
      Severity.info,
      TYPO3.lang['contentblocks.wizard.new.slide1.progressLabel'],
      (slide: JQuery, settings: any, identifier: string) => {
        console.log(2, document)
        console.log(3, slide)
        // let a = new ContentBlocksChooseNameElement();
        // MultiStepWizard.lockNextStep();
        MultiStepWizard.lockPrevStep();
        slide.html(
          // This wizard is part of the "top" frame – thus we need to import our used components here (for not having to load them globally).
          // `
          // <script type="module"
          //   src="${TYPO3.settings.urls['EXT:content_blocks/Resources/Public/JavaScript/element/choose-name-element.js']}"></script>
          // ` +
          // ... and for the same reason we are passing TYPO3.lang entries into the "top" context here.
          // (I am unsure if this is less workaroundy than loading it globally in the backend)
          `
          <div class="mb-3">` +
          `
            <script type="module" src="@typo3/content-blocks/element/content_blocks-choose-name-element.js"></script>
            <typo3-content_blocks-choose-name
                typo3-lang-title="${TYPO3.lang['contentblocks.contentblock.title']}"
                typo3-lang-title-description="${TYPO3.lang['contentblocks.contentblock.title.description']}"
                typo3-lang-description="${TYPO3.lang['contentblocks.contentblock.description']}"
                typo3-lang-vendor="${TYPO3.lang['contentblocks.contentblock.vendor']}"
                typo3-lang-vendor-description="${TYPO3.lang['contentblocks.contentblock.vendor.description']}"
                typo3-lang-packagename="${TYPO3.lang['contentblocks.contentblock.packagename']}"
                typo3-lang-packagename-description="${TYPO3.lang['contentblocks.contentblock.packagename.description']}"
            ></typo3-content_blocks-choose-name>
            ` +
             `
          </div>
          `
        )
        // slide.get(0).appendChild(a)
      }
    )

    // MultiStepWizard.addSlide(
    //   'new-2',
    //   TYPO3.lang['contentblocks.wizard.new.slide2.title'],
    //   '',
    //   Severity.info,
    //   TYPO3.lang['contentblocks.wizard.new.slide2.progressLabel'],
    //   (slide: any) => {
    //     MultiStepWizard.unlockNextStep();
    //     // MultiStepWizard.lockPrevStep();
    //     slide.html(
    //       `
    //       <label for="t3-contentblocks-description" class="form-label">
    //         ${TYPO3.lang['contentblocks.contentblock.description']}
    //       </label>
    //       <textarea class="form-control" id="t3-contentblocks-description" rows="3"
    //         aria-describedby="t3-contentblocks-help-description"
    //       ></textarea>
    //       <div id="t3-contentblocks-help-packagename" class="form-text">
    //         ${TYPO3.lang['contentblocks.contentblock.description.description']}
    //       </div>
    //       `
    //     )
    //   },
    // )

    MultiStepWizard.addFinalProcessingSlide(
      () => {
        // @todo: There's probably an API to navigate
        // top.location = MainController.urls.contentBlocks.edit
        const router = document.querySelector('typo3-backend-module-router');
        router.setAttribute('endpoint', MainController.urls.contentBlocks.edit)
      }
    ).then(
      () => MultiStepWizard.show()
    )
  }
}

export default new ContentBlocksModule()
