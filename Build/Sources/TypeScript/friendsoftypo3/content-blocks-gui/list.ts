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
import Modal from '@typo3/backend/modal.js';
import { lll } from '@typo3/core/lit-helper';
import { SeverityEnum } from '@typo3/backend/enum/severity';

class ContentBlockList {

  constructor() {
    console.log('[ContentBlockList] Constructor called');
    this.init();
  }
  protected init() {
    const downloadButtons = document.querySelectorAll('#content-blocks .content-block-download');
    downloadButtons.forEach((downloadButton) => {
      downloadButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.downloadAction(downloadButton.getAttribute('data-name'));
      });
    });

    // add delete event listener
    document.querySelectorAll('#content-blocks .content-block-delete').forEach((deleteButton) => {
      deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleRemove(deleteButton.getAttribute('href'));
      });
    });

    // add duplicate event listener
    const duplicateButtons = document.querySelectorAll('#content-blocks .content-block-duplicate');
    duplicateButtons.forEach((duplicateButton) => {
      duplicateButton.addEventListener('click', (event) => {
        event.preventDefault();
        const sourceName = duplicateButton.getAttribute('data-name');
        const sourceExtension = duplicateButton.getAttribute('data-extension');
        const duplicateUrl = duplicateButton.getAttribute('href');
        this.handleDuplicate(sourceName, sourceExtension, duplicateUrl);
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

  protected handleRemove(url: string)
  {
    const modal = Modal.confirm(
      lll('make.remove.confirm.title'),
      lll('make.remove.confirm.message'),
      SeverityEnum.warning, [
        {
          text: lll('make.remove.button.close'),
          active: true,
          btnClass: 'btn-default',
          name: 'cancel',
        },
        {
          text: lll('make.remove.button.ok'),
          btnClass: 'btn-warning remove-button',
          name: 'delete',
        },
      ]
    );

    modal.addEventListener('button.clicked', (e: Event): void => {
      const target = e.target as HTMLButtonElement;
      if (target.getAttribute('name') === 'delete') {
        window.location.href = url;
      }
      modal.hideModal();
    });
  }

  protected handleDuplicate(sourceName: string, sourceExtension: string, duplicateUrl: string): void
  {
    // Parse source name to extract vendor and name
    const nameParts = sourceName.split('/');
    const sourceVendor = nameParts[0] || '';
    const sourceBlockName = nameParts[1] || '';

    // Create content as a DOM element
    const content = document.createElement('div');
    content.innerHTML = `
      <form id="duplicate-content-block-form">
        <div class="form-group mb-3">
          <label for="duplicate-extension" class="form-label">Extension</label>
          <input type="text" class="form-control" id="duplicate-extension" name="extension" value="${sourceExtension}" required>
          <div class="form-text">The extension where the duplicated content block will be stored</div>
        </div>
        <div class="form-group mb-3">
          <label for="duplicate-vendor" class="form-label">Vendor Name</label>
          <input type="text" class="form-control" id="duplicate-vendor" name="vendor" value="${sourceVendor}" required pattern="[a-z0-9\\-]+">
          <div class="form-text">Lowercase letters, numbers, and hyphens only</div>
        </div>
        <div class="form-group mb-3">
          <label for="duplicate-name" class="form-label">Content Block Name</label>
          <input type="text" class="form-control" id="duplicate-name" name="name" value="${sourceBlockName}-copy" required pattern="[a-z0-9\\-]+">
          <div class="form-text">Lowercase letters, numbers, and hyphens only</div>
          <div id="duplicate-name-error" class="text-danger d-none">The new name must be different from the original</div>
        </div>
      </form>
    `;

    const modal = Modal.advanced({
      title: 'Duplicate Content Block',
      content: content,
      severity: SeverityEnum.info,
      size: Modal.sizes.medium,
      buttons: [
        {
          text: 'Cancel',
          active: true,
          btnClass: 'btn-default',
          name: 'cancel',
          trigger: () => {
            modal.hideModal();
          }
        },
        {
          text: 'Duplicate',
          btnClass: 'btn-primary',
          name: 'duplicate',
          trigger: () => {
            if (this.validateAndSubmitDuplicate(sourceName, sourceVendor, sourceBlockName, duplicateUrl, modal)) {
              modal.hideModal();
            }
          }
        }
      ]
    });
  }

  protected validateAndSubmitDuplicate(sourceName: string, sourceVendor: string, sourceBlockName: string, duplicateUrl: string, modal: any): boolean
  {
    // Search within the modal element
    const form = modal.querySelector('#duplicate-content-block-form') as HTMLFormElement;
    if (!form) {
      return false;
    }

    const extension = modal.querySelector('#duplicate-extension') as HTMLInputElement;
    const vendor = modal.querySelector('#duplicate-vendor') as HTMLInputElement;
    const name = modal.querySelector('#duplicate-name') as HTMLInputElement;
    const errorDiv = modal.querySelector('#duplicate-name-error') as HTMLElement;
    const nameInput = modal.querySelector('#duplicate-name') as HTMLInputElement;

    const extensionValue = extension?.value;
    const vendorValue = vendor?.value;
    const nameValue = name?.value;

    if (!extensionValue || !vendorValue || !nameValue) {
      console.error('[ContentBlockList] Missing form values');
      return false;
    }

    // Validate pattern
    const pattern = /^[a-z0-9\-]+$/;
    if (!pattern.test(vendorValue) || !pattern.test(nameValue)) {
      console.error('[ContentBlockList] Invalid pattern');
      if (!form.checkValidity()) {
        form.reportValidity();
      }
      return false;
    }

    // Check if the new name is the same as the old name
    if (vendorValue === sourceVendor && nameValue === sourceBlockName) {
      // Show error message
      if (errorDiv) {
        errorDiv.classList.remove('d-none');
      }
      if (nameInput) {
        nameInput.classList.add('is-invalid');
        nameInput.focus();
      }
      return false;
    }

    // Hide error message if it was shown
    if (errorDiv) {
      errorDiv.classList.add('d-none');
    }
    if (nameInput) {
      nameInput.classList.remove('is-invalid');
    }

    // Build URL with query parameters
    const url = new URL(duplicateUrl, window.location.origin);
    url.searchParams.append('targetExtension', extensionValue);
    url.searchParams.append('targetVendor', vendorValue);
    url.searchParams.append('targetName', nameValue);

    // Navigate to the backend route (PHP will handle redirect)
    window.location.href = url.toString();

    return true;
  }
}

export default new ContentBlockList();
