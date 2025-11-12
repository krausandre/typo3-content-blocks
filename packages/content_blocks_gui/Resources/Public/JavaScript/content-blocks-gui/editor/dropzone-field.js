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
import{LitElement as c,html as h}from"lit";import{property as a,customElement as f}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";import"@friendsoftypo3/content-blocks-gui/interface/definitions.js";var d=function(p,e,o,n){var i=arguments.length,t=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(p,e,o,n);else for(var s=p.length-1;s>=0;s--)(l=p[s])&&(t=(i<3?l(t):i>3?l(e,o,t):l(e,o))||t);return i>3&&t&&Object.defineProperty(e,o,t),t};let r=class extends c{constructor(){super(...arguments),this.position=0,this.level=0,this.parent=null}render(){return console.log("Render dropzone"),h`<style>.cb-drop-zone{border:1px dashed #ccc;height:20px;margin:10px;background-color:#f9f9f9;&:focus{background-color:#cbffdb}}</style><div id=cb-drop-zone-${this.position} class=cb-drop-zone @dragover=${this.handleDragOver} @drop=${this.handleDrop}></div>`}handleDragOver(e){e.preventDefault()}handleDrop(e){e.preventDefault(),this._dispatchFieldTypeDroppedEvent(e.dataTransfer?.getData("text/plain"))}_dispatchFieldTypeDroppedEvent(e){const o=JSON.parse(e);this.dispatchEvent(new CustomEvent("fieldTypeDropped",{detail:{data:o,position:this.position,level:this.level,parent:this.parent},bubbles:!0,composed:!0}))}createRenderRoot(){return this}};d([a()],r.prototype,"position",void 0),d([a()],r.prototype,"level",void 0),d([a()],r.prototype,"parent",void 0),r=d([f("dropzone-field")],r);export{r as DropzoneField};
