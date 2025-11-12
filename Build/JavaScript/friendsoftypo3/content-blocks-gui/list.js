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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import AjaxRequest from '@typo3/core/ajax/ajax-request.js';
import Modal from '@typo3/backend/modal.js';
import { lll } from '@typo3/core/lit-helper.js';
import { SeverityEnum } from '@typo3/backend/enum/severity.js';
import '@typo3/backend/element/icon-element.js';
/**
 * Content Block List Component
 *
 * @example
 * <content-block-list></content-block-list>
 */
let ContentBlockList = class ContentBlockList extends LitElement {
    constructor() {
        super(...arguments);
        this.activeTab = 'content-element';
        this.searchTerm = '';
        this.items = [];
        this.counts = {};
        this.isLoading = false;
        this.sortField = 'name';
        this.sortDirection = 'asc';
        this.debounceTimeout = null;
    }
    connectedCallback() {
        super.connectedCallback();
        // Load initial state from URL
        this.loadStateFromUrl();
        // Load initial data
        this.loadContentBlocks(this.activeTab);
    }
    createRenderRoot() {
        // Don't use Shadow DOM to allow Bootstrap CSS styling
        return this;
    }
    render() {
        return html `
      <div class="content-block-list-view">
        <!-- Search Bar -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="form-group">
              <input
                type="search"
                class="form-control"
                placeholder="Search content blocks (min. 3 characters)..."
                .value="${this.searchTerm}"
                @input="${this.handleSearchInput}"
              />
              ${this.searchTerm.length > 0 && this.searchTerm.length < 3 ? html `
                <small class="form-text text-muted">Enter at least 3 characters to search</small>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3" role="tablist">
          ${this.renderTab('content-element', 'Content Elements')}
          ${this.renderTab('page-type', 'Page Types')}
          ${this.renderTab('record-type', 'Record Types')}
          ${this.renderTab('basic', 'Basics')}
        </ul>

        <!-- Loading State -->
        ${this.isLoading ? html `
          <div class="alert alert-info">
            <typo3-backend-icon identifier="spinner-circle" size="small"></typo3-backend-icon>
            Loading...
          </div>
        ` : ''}

        <!-- Content -->
        ${!this.isLoading ? this.renderContent() : ''}
      </div>
    `;
    }
    renderTab(type, label) {
        const count = this.counts[type] || 0;
        const isActive = this.activeTab === type;
        return html `
      <li class="nav-item" role="presentation">
        <button
          class="nav-link ${isActive ? 'active' : ''}"
          @click="${() => this.switchTab(type)}"
          role="tab"
          aria-selected="${isActive}">
          ${label}
          <span class="badge bg-primary ms-2" style="color: white;">${count}</span>
        </button>
      </li>
    `;
    }
    renderContent() {
        const filteredItems = this.getFilteredAndSortedItems();
        if (filteredItems.length === 0) {
            return this.renderEmptyState();
        }
        return html `
      <div class="list-table-container">
        <div class="table-fit">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th></th>
                <th class="sortable" @click="${() => this.handleSort('name')}" style="cursor: pointer;">
                  Content Block name
                  ${this.sortField === 'name' ? html `
                    <span class="text-primary">${this.sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  ` : ''}
                </th>
                <th class="sortable" @click="${() => this.handleSort('label')}" style="cursor: pointer;">
                  Label
                  ${this.sortField === 'label' ? html `
                    <span class="text-primary">${this.sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  ` : ''}
                </th>
                <th class="sortable" @click="${() => this.handleSort('extension')}" style="cursor: pointer;">
                  Extension
                  ${this.sortField === 'extension' ? html `
                    <span class="text-primary">${this.sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                  ` : ''}
                </th>
                ${this.activeTab !== 'basic' ? html `<th>References</th>` : ''}
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${filteredItems.map(item => this.renderRow(item))}
            </tbody>
          </table>
        </div>
      </div>
    `;
    }
    renderRow(item) {
        return html `
      <tr>
        <td class="col-icon">
          ${item.icon ? html `
            <typo3-backend-icon identifier="${item.icon}" size="small"></typo3-backend-icon>
          ` : html `
            <typo3-backend-icon identifier="content-extension" size="small"></typo3-backend-icon>
          `}
        </td>
        <td class="col">
          ${item.editUrl ? html `
            <a href="${item.editUrl}" title="Edit content block: ${item.name}">${item.name}</a>
          ` : item.name}
        </td>
        <td class="col">
          ${item.editUrl ? html `
            <a href="${item.editUrl}" title="Edit content block: ${item.name}">${item.label}</a>
          ` : item.label}
        </td>
        <td><code>${item.extension}</code></td>
        ${this.activeTab !== 'basic' ? html `
          <td>
            <span class="badge badge-default">
              ${item.usages || 0} References
            </span>
          </td>
        ` : ''}
        <td class="col-control">
          <div class="btn-group" role="group">
            ${item.editUrl ? html `
              <a class="btn btn-default" href="${item.editUrl}" title="Edit this content block">
                <typo3-backend-icon identifier="actions-open"></typo3-backend-icon>
              </a>
            ` : ''}
            ${item.duplicateUrl ? html `
              <button class="btn btn-default"
                      title="Duplicate this content block"
                      @click="${() => this.handleDuplicate(item)}">
                <typo3-backend-icon identifier="actions-duplicate"></typo3-backend-icon>
              </button>
            ` : ''}
            <button class="btn btn-default"
                    title="Download this content block"
                    @click="${() => this.handleDownload(item.name)}">
              <typo3-backend-icon identifier="actions-download"></typo3-backend-icon>
            </button>
            ${item.deleteUrl ? html `
              <button class="btn btn-default"
                      title="Delete this content block"
                      @click="${() => this.handleDelete(item.deleteUrl)}">
                <typo3-backend-icon identifier="actions-delete"></typo3-backend-icon>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
    }
    renderEmptyState() {
        if (this.searchTerm.length > 0) {
            return html `
        <div class="alert alert-warning">
          No results found for "${this.searchTerm}"
        </div>
      `;
        }
        return html `
      <div class="alert alert-info">
        No content blocks available
      </div>
    `;
    }
    getFilteredAndSortedItems() {
        let filtered = this.items;
        // Apply search filter (min 3 characters)
        if (this.searchTerm.length >= 3) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(item => item.name.toLowerCase().includes(searchLower) ||
                item.label.toLowerCase().includes(searchLower) ||
                item.extension.toLowerCase().includes(searchLower));
        }
        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a[this.sortField] || '';
            const bValue = b[this.sortField] || '';
            const comparison = aValue.localeCompare(bValue);
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        return filtered;
    }
    async switchTab(type) {
        if (type === this.activeTab) {
            return;
        }
        this.activeTab = type;
        this.updateUrl();
        await this.loadContentBlocks(type);
    }
    async loadContentBlocks(type) {
        this.isLoading = true;
        try {
            const ajaxUrl = TYPO3.settings.ajaxUrls.content_blocks_gui_list_by_type;
            const response = await new AjaxRequest(ajaxUrl)
                .withQueryArguments({ type })
                .get();
            const data = await response.resolve();
            this.items = data.items;
            this.counts = data.counts;
        }
        catch (error) {
            console.error('Failed to load content blocks:', error);
            this.items = [];
        }
        finally {
            this.isLoading = false;
        }
    }
    handleSearchInput(event) {
        const input = event.target;
        this.searchTerm = input.value;
        // Debounce the filtering
        if (this.debounceTimeout !== null) {
            clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = window.setTimeout(() => {
            this.updateUrl();
            this.requestUpdate();
        }, 300);
    }
    handleSort(field) {
        if (this.sortField === field) {
            // Toggle direction if same field
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        }
        else {
            // New field, default to ascending
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.updateUrl();
        this.requestUpdate();
    }
    updateUrl() {
        const params = new URLSearchParams();
        params.set('type', this.activeTab);
        if (this.searchTerm.length >= 3) {
            params.set('search', this.searchTerm);
        }
        if (this.sortField !== 'name' || this.sortDirection !== 'asc') {
            params.set('sort', `${this.sortField}:${this.sortDirection}`);
        }
        const url = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', url);
    }
    loadStateFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        if (type) {
            this.activeTab = type;
        }
        const search = params.get('search');
        if (search) {
            this.searchTerm = search;
        }
        const sort = params.get('sort');
        if (sort) {
            const [field, direction] = sort.split(':');
            this.sortField = field;
            this.sortDirection = direction || 'asc';
        }
    }
    handleDownload(name) {
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
    handleDelete(url) {
        const modal = Modal.confirm(lll('make.remove.confirm.title'), lll('make.remove.confirm.message'), SeverityEnum.warning, [
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
        ]);
        modal.addEventListener('button.clicked', (e) => {
            const target = e.target;
            if (target.getAttribute('name') === 'delete') {
                window.location.href = url;
            }
            modal.hideModal();
        });
    }
    handleDuplicate(item) {
        // Parse source name to extract vendor and name
        const nameParts = item.name.split('/');
        const sourceVendor = nameParts[0] || '';
        const sourceBlockName = nameParts[1] || '';
        // Create content as a DOM element
        const content = document.createElement('div');
        content.innerHTML = `
      <form id="duplicate-content-block-form">
        <div class="form-group mb-3">
          <label for="duplicate-extension" class="form-label">Extension</label>
          <input type="text" class="form-control" id="duplicate-extension" name="extension" value="${item.extension}" required>
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
                        if (this.validateAndSubmitDuplicate(item.name, sourceVendor, sourceBlockName, item.duplicateUrl, modal)) {
                            modal.hideModal();
                        }
                    }
                }
            ]
        });
    }
    validateAndSubmitDuplicate(sourceName, sourceVendor, sourceBlockName, duplicateUrl, modal) {
        // Search within the modal element
        const form = modal.querySelector('#duplicate-content-block-form');
        if (!form) {
            return false;
        }
        const extension = modal.querySelector('#duplicate-extension');
        const vendor = modal.querySelector('#duplicate-vendor');
        const name = modal.querySelector('#duplicate-name');
        const errorDiv = modal.querySelector('#duplicate-name-error');
        const nameInput = modal.querySelector('#duplicate-name');
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
};
__decorate([
    state()
], ContentBlockList.prototype, "activeTab", void 0);
__decorate([
    state()
], ContentBlockList.prototype, "searchTerm", void 0);
__decorate([
    state()
], ContentBlockList.prototype, "items", void 0);
__decorate([
    state()
], ContentBlockList.prototype, "counts", void 0);
__decorate([
    state()
], ContentBlockList.prototype, "isLoading", void 0);
__decorate([
    state()
], ContentBlockList.prototype, "sortField", void 0);
__decorate([
    state()
], ContentBlockList.prototype, "sortDirection", void 0);
ContentBlockList = __decorate([
    customElement('content-block-list')
], ContentBlockList);
export { ContentBlockList };
