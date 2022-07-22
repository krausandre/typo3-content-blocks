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

import {ReactiveController, ReactiveControllerHost} from 'lit'
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import {
  IContentBlock, IContentBlockField,
  IContentBlockPromisesDictionary,
  IContentBlocksDictionary
} from '@typo3/content-blocks/types';

/**
 * Module: @typo3/content-blocks/controller/main-controller
 * @exports @typo3/content-blocks/controller/main-controller
 */

export class MainController implements ReactiveController {
  static urls = {
    ajax: {
      contentBlock: {
        get: TYPO3.settings.ajaxUrls['tools_contentblocks/ajax/contentBlock/get/json'],
      },
      contentBlocks: {
        list: TYPO3.settings.ajaxUrls['tools_contentblocks/ajax/contentBlocks/list/json'],
      }
    },
    contentBlocks: {
      edit: TYPO3.settings.urls['contentblocks/contentBlock/edit'],
    },
  }
  currentContentBlock?: IContentBlock;

  private static _instance?: MainController
  private _hosts: ReactiveControllerHost[] = []
  private _contentBlocks: Promise<IContentBlocksDictionary>;
  private _contentBlock: IContentBlockPromisesDictionary = {};

  static instance(
    host?: ReactiveControllerHost
  ) {
    if (this._instance == null) {
      this._instance = new MainController()
    }

    if (host) {
      this._instance._hosts.push(host)
      host.addController(this._instance)
    }

    return this._instance
  }

  async contentBlocks(): Promise<IContentBlocksDictionary> {
    if (this._contentBlocks) {
      return this._contentBlocks
    }

    const url = MainController.urls.ajax.contentBlocks.list
    try {
      const request = new AjaxRequest(url)
      const response = request.get()
      this._contentBlocks = response.then(r => r.resolve())
      return this._contentBlocks
    } catch {
      throw new Error(`todo:: fetch errör ${url}`)
    }
  }

  loadContentBlock(cType: string) {
    const url = MainController.urls.ajax.contentBlock.get + '&cType=' + encodeURIComponent(cType)
    try {
      const request = new AjaxRequest(url)
      request.get().then(
        response => {
          response.resolve('json').then(
            (data: IContentBlock) => {
              // @todo
              this.currentContentBlock = data
              this.requestUpdate()
            }
          )
        }
      )
    } catch {
      throw new Error(`todo:: fetch errör ${url}`)
    }
  }

  hostConnected() {
    // should be used for listeners etc. Shadow DOM is ready.
  }

  protected requestUpdate() {
    this._hosts.forEach(
      h => h.requestUpdate()
    )
  }
}
