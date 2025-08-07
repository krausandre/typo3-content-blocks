var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators';
let WrapGroupElement = class WrapGroupElement extends LitElement {
    constructor() {
        super(...arguments);
        this.wrapId = null;
        this.values = null;
    }
    createRenderRoot() {
        // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
        return this;
    }
    render() {
        return html `
      <div class="form-multigroup-wrap">
        <div class="form-multigroup-item">
          <div class="input-group">
            <input id="${this.wrapId}_wrap_start" class="form-control t3js-emconf-wrapfield" data-target="#${this.wrapId}" value="${this.values[0].trim()}"/>
          </div>
        </div>
        <div class="form-multigroup-item">
          <div class="input-group">
            <input id="${this.wrapId}_wrap_end" class="form-control t3js-emconf-wrapfield" data-target="#${this.wrapId}" value="${this.values[0].trim()}"/>
          </div>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], WrapGroupElement.prototype, "wrapId", void 0);
__decorate([
    property({ type: Array })
], WrapGroupElement.prototype, "values", void 0);
WrapGroupElement = __decorate([
    customElement('typo3-install-wrap-group')
], WrapGroupElement);
