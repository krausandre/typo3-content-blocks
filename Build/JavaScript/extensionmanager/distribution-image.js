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
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators';
/**
 * Module @typo3/extensionmanager/distribution-image
 *
 * @example
 * <typo3-extensionmanager-distribution-image image="some/image.jpg" fallback="/some/fallback/image.jpg"/>
 */
let DistributionImage = class DistributionImage extends LitElement {
    static { this.styles = css `
    img {
      display: block;
      width: 100%;
      height: auto;
    }
  `; }
    render() {
        if (!this.image && !this.fallback) {
            return nothing;
        }
        const imageToUse = this.welcomeImage || this.image || this.fallback;
        return html `<img alt="${this.alt}" src="${imageToUse}" @error="${imageToUse !== this.fallback ? this.onError : nothing}">`;
    }
    onError(e) {
        const imageElement = e.target;
        if (this.image.length && imageElement.getAttribute('src') === this.welcomeImage) {
            imageElement.setAttribute('src', this.image);
        }
        else if (this.fallback.length) {
            imageElement.setAttribute('src', this.fallback);
        }
    }
};
__decorate([
    property({ type: String })
], DistributionImage.prototype, "alt", void 0);
__decorate([
    property({ type: String })
], DistributionImage.prototype, "image", void 0);
__decorate([
    property({ type: String })
], DistributionImage.prototype, "welcomeImage", void 0);
__decorate([
    property({ type: String })
], DistributionImage.prototype, "fallback", void 0);
DistributionImage = __decorate([
    customElement('typo3-extensionmanager-distribution-image')
], DistributionImage);
export { DistributionImage };
