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
import { customElement, property, state } from 'lit/decorators';
import { html, LitElement, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import RegularEvent from '@typo3/core/event/regular-event';
import { lll } from '@typo3/core/lit-helper';
var CspReportAttribute;
(function (CspReportAttribute) {
    CspReportAttribute["fixable"] = "fixable";
    CspReportAttribute["irrelevant"] = "irrelevant";
    CspReportAttribute["suspicious"] = "suspicious";
})(CspReportAttribute || (CspReportAttribute = {}));
let CspReports = class CspReports extends LitElement {
    constructor() {
        super(...arguments);
        this.selectedScope = null;
        this.reports = [];
        this.selectedReport = null;
        this.suggestions = [];
    }
    connectedCallback() {
        super.connectedCallback();
        this.fetchReports();
        this.peripheralEvent = new RegularEvent('click', (evt, target) => {
            if (target.dataset.cspReportsHandler === 'refresh') {
                evt.preventDefault();
                this.fetchReports();
            }
        });
        this.peripheralEvent.delegateTo(document, '[data-csp-reports-handler]');
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.peripheralEvent?.release();
    }
    createRenderRoot() {
        return this;
    }
    render() {
        return html `
      <div class="infolist-container infolist-overlay">
        <div class="infolist">
          <div class="infolist-header">
            ${this.renderNavigation()}
          </div>
        </div>
      </div>

      <div class="infolist-container">
        <div class="infolist">
          <div class="infolist-content">
            <div class="table-fit mb-0">
              <table class="table table-striped">
                <thead>
                <tr>
                  <th>${lll('label.created') || 'Created'}</th>
                  <th>${lll('label.scope') || 'Scope'}</th>
                  <th>${lll('label.violation') || 'Violation'}</th>
                  <th>${lll('label.uri') || 'URI'}</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                ${this.reports.length === 0 ? html `
                  <tr><td colspan="5">${lll('label.label.noEntriesAvailable') || 'No entries available.'}</td></tr>
                ` : nothing}
                ${this.reports.map((report) => html `
                  <tr class=${classMap({ 'table-info': this.selectedReport === report })} data-mutation-group=${report.mutationHashes.join('-')}
                      @click=${() => this.selectReport(report)}>
                    <td>${report.created}</td>
                    <td>${report.scope}</td>
                    <td>
                      <span class="badge badge-warning">${report.count}</span>
                      ${report.details.effectiveDirective}
                    </td>
                    <td>${this.shortenUri(report.details.blockedUri)}</td>
                    <td>${report.attributes.join(', ')}</td>
                  </tr>
                `)}
                </tbody>
              </table>
            </div>
          </div>
          <div class="infolist-info${this.selectedReport ? ' infolist-info-showrecord' : ''}">
            ${this.renderGuide()}
            ${this.renderSelectedReport()}
          </div>
        </div>
      </div>
    `;
    }
    renderNavigation() {
        return html `
      <div class="btn-toolbar">
        <button type="button" class="btn btn-default dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" title="${lll('label.scope') || 'Scope'}">
          ${null === this.selectedScope ? lll('label.all') || 'ALL' : this.selectedScope}
        </button>
        <ul class="dropdown-menu">
          <button class="dropdown-item dropdown-item-spaced" title="${lll('label.all') || 'ALL'}" @click=${() => this.selectScope(null)}>
            <span class="${null === this.selectedScope ? 'text-primary' : ''}">
              <typo3-backend-icon identifier="${null === this.selectedScope ? 'actions-dot' : 'empty-empty'}" size="small"></typo3-backend-icon>
            </span>
            ${lll('label.all') || 'ALL'}
          </button>
          ${this.scopes.map((scope) => html `
            <li>
              <button class="dropdown-item dropdown-item-spaced" title="${scope}" @click=${() => this.selectScope(scope)}>
                <span class="${scope === this.selectedScope ? 'text-primary' : ''}">
                  <typo3-backend-icon identifier="${scope === this.selectedScope ? 'actions-dot' : 'empty-empty'}" size="small"></typo3-backend-icon>
                </span>
                ${scope}
              </button>
            </li>`)}
        </ul>
        <button type="button" class="btn btn-danger" title="${lll('label.removeAll') || 'Remove all'}" @click=${() => this.invokeDeleteReportsAction()}>
          ${lll('label.removeAll') || 'Remove all'}
          ${this.selectedScope !== null ? html `"${this.selectedScope}"` : nothing}
        </button>
      </div>`;
    }
    renderGuide() {
        return html `${!this.selectedReport ? html `
      <div class="infolist-info-norecord">
        <div class="card mb-0">
          <div class="card-body">
            <p>${lll('label.guide.no_record_selected') || 'Select a row to see more information.'}</p>
          </div>
        </div>
      </div>
    ` : nothing}`;
    }
    renderSelectedReport() {
        const report = this.selectedReport;
        return html `${report ? html `
      <div class="infolist-info-record">
        <div class="card mb-0">
          <div class="card-header">
            <h3>${lll('label.details') || 'Details'}</h3>
          </div>
          <div class="card-body">
            <dl>
              <dt>${lll('label.directive') || 'Directive'} / ${lll('label.disposition') || 'Disposition'}</dt>
              <dd>${report.details.effectiveDirective} / ${report.details.disposition}</dd>

              <dt>${lll('label.document_uri') || 'Document URI'}</dt>
              <dd>${report.details.documentUri} ${this.renderCodeLocation(report)}</dd>

              ${report.details.sourceFile && report.details.sourceFile !== report.details.documentUri ? html `
                <dt>${lll('label.source_file') || 'Source File'}</dt>
                <dd>${report.details.sourceFile}</dd>
              ` : nothing}

              <dt>${lll('label.blocked_uri') || 'Blocked URI'}</dt>
              <dd>${report.details.blockedUri}</dd>

              ${report.details.scriptSample ? html `
                <dt>${lll('label.sample') || 'Sample'}</dt>
                <dd><code>${report.details.scriptSample}</code></dd>
              ` : nothing}

              ${report.meta.agent ? html `
                <dt>${lll('label.user_agent') || 'User Agent'}</dt>
                <dd><code>${report.meta.agent}</code></dd>
              ` : nothing}

              <dt>${lll('label.uuid') || 'UUID'}</dt>
              <dd><code>${report.uuid}</code></dd>

              <dt>${lll('label.summary') || 'Summary'}</dt>
              <dd><code>${report.summary}</code></dd>
            </dl>
          </div>
          ${this.suggestions.length > 0 ? html `
            <div class="card-header">
              <h3>${lll('label.suggestions') || 'Suggestions'}</h3>
            </div>
          ` : nothing}
          ${this.suggestions.map((suggestion) => html `
            <div class="card-body">
              <h4>${suggestion.label || suggestion.identifier}</h4>
              ${suggestion.collection.mutations.map((mutation) => html `
                <p>
                  <i>${mutation.mode}</i>
                  <code>${mutation.directive}: ${mutation.sources.join(' ')}</code>
                </p>
              `)}
              <button class="btn btn-primary" @click=${() => this.invokeMutateReportAction(report, suggestion)}>
                <typo3-backend-icon identifier="actions-check" size="small"></typo3-backend-icon>
                ${lll('button.apply') || 'Apply'}
              </button>
            </div>
          `)}

          <div class="card-footer">
            <button class="btn btn-default" @click=${() => this.selectReport(null)}>
              <typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon>
              ${lll('button.close') || 'Close'}
            </button>
            <button class="btn btn-default" @click=${() => this.invokeMuteReportAction(report)}>
              <typo3-backend-icon identifier="actions-ban" size="small"></typo3-backend-icon>
              ${lll('button.mute') || 'Mute'}
            </button>
            <button class="btn btn-default" @click=${() => this.invokeDeleteReportAction(report)}>
              <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
              ${lll('button.delete') || 'Delete'}
            </button>
          </div>
        </div>
      </div>
    ` : nothing}`;
    }
    renderCodeLocation(report) {
        if (!report.details.lineNumber) {
            return nothing;
        }
        const parts = [report.details.lineNumber];
        if (report.details.columnNumber) {
            parts.push(report.details.columnNumber);
        }
        return html `(${parts.join(':')})`;
    }
    selectReport(report) {
        this.suggestions = [];
        if (report !== null && this.selectedReport !== report) {
            this.selectedReport = report;
            this.invokeHandleReportAction(report)
                .then((suggestions) => this.suggestions = suggestions);
        }
        else {
            this.selectedReport = null;
        }
    }
    selectScope(scope) {
        this.selectedScope = scope;
        this.fetchReports();
    }
    fetchReports() {
        this.invokeFetchReportsAction().then((reports) => this.reports = reports);
    }
    /*
     * Remote API calls
     */
    filterReports(...uuids) {
        if (uuids.includes(this.selectedReport?.uuid)) {
            this.selectedReport = null;
        }
        this.reports = this.reports.filter((report) => !uuids.includes(report.uuid));
    }
    invokeFetchReportsAction() {
        return (new AjaxRequest(this.controlUri))
            .post({ action: 'fetchReports', scope: this.selectedScope || '' })
            .then((response) => response.resolve('application/json'));
    }
    invokeHandleReportAction(report) {
        return (new AjaxRequest(this.controlUri))
            .post({ action: 'handleReport', uuid: report.uuid })
            .then((response) => response.resolve('application/json'));
    }
    invokeMutateReportAction(report, suggestion) {
        const summaries = this.reports
            .filter((other) => other.mutationHashes.includes(suggestion.hash))
            .map((other) => other.summary);
        return (new AjaxRequest(this.controlUri))
            .post({ action: 'mutateReport', scope: report.scope, hmac: suggestion.hmac, suggestion, summaries })
            .then((response) => response.resolve('application/json'))
            .then((response) => this.filterReports(...response.uuids));
    }
    invokeMuteReportAction(report) {
        (new AjaxRequest(this.controlUri))
            .post({ action: 'muteReport', summaries: [report.summary] })
            .then((response) => response.resolve('application/json'))
            .then((response) => this.filterReports(...response.uuids));
    }
    invokeDeleteReportAction(report) {
        (new AjaxRequest(this.controlUri))
            .post({ action: 'deleteReport', summaries: [report.summary] })
            .then((response) => response.resolve('application/json'))
            .then((response) => this.filterReports(...response.uuids));
    }
    invokeDeleteReportsAction() {
        (new AjaxRequest(this.controlUri))
            .post({ action: 'deleteReports', scope: this.selectedScope || '' })
            .then((response) => response.resolve('application/json'))
            .then(() => this.fetchReports())
            .then(() => this.selectReport(null));
    }
    /*
     * Helper methods
     */
    shortenUri(value) {
        if (value === 'inline') {
            return value;
        }
        try {
            const uri = new URL(value);
            return uri.hostname;
        }
        catch {
            return value;
        }
    }
};
__decorate([
    property({ type: Array })
], CspReports.prototype, "scopes", void 0);
__decorate([
    property({ type: String })
], CspReports.prototype, "controlUri", void 0);
__decorate([
    state()
], CspReports.prototype, "selectedScope", void 0);
__decorate([
    state()
], CspReports.prototype, "reports", void 0);
__decorate([
    state()
], CspReports.prototype, "selectedReport", void 0);
__decorate([
    state()
], CspReports.prototype, "suggestions", void 0);
CspReports = __decorate([
    customElement('typo3-backend-security-csp-reports')
], CspReports);
export { CspReports };
