var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators';
let OffsetGroupElement = class OffsetGroupElement extends LitElement {
    constructor() {
        super(...arguments);
        this.offsetId = null;
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
            <div class="input-group-text">x</div>
            <input id="${this.offsetId}_offset_x" class="form-control t3js-emconf-offsetfield" data-target="#${this.offsetId}" value="${this.values[0]?.trim()}"/>
          </div>
        </div>
        <div class="form-multigroup-item">
          <div class="input-group">
            <div class="input-group-text">y</div>
            <input id="${this.offsetId}_offset_y" class="form-control t3js-emconf-offsetfield" data-target="#${this.offsetId}" value="${this.values[1]?.trim()}"/>
          </div>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], OffsetGroupElement.prototype, "offsetId", void 0);
__decorate([
    property({ type: Array })
], OffsetGroupElement.prototype, "values", void 0);
OffsetGroupElement = __decorate([
    customElement('typo3-install-offset-group')
], OffsetGroupElement);
