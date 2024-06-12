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

import AjaxRequest from '@typo3/core/ajax/ajax-request';

class ContentBlockList {

  constructor() {
    this.init();
  }
  protected init() {
    document.querySelectorAll('.cb-list-table .downloadBtn').forEach((downloadButton) => {
      downloadButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.downloadAction(downloadButton.getAttribute('data-name'));
      });
    });
  }
  protected downloadAction(name: string): void {
    new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb)
      .post({ name: name }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/zip'
        }
      })
      .then(async (response) => {
        const responseData = response.raw();
        const blob = await responseData.blob();
        const contentDisposition = responseData.headers.get('content-disposition');
        let filename = name + '.zip';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch.length > 1) {
            filename = filenameMatch[1];
          }
        }

        filename = filename.replace(/"+$/, '');

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);

        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

export default new ContentBlockList();
