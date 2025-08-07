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
import{LitElement as l,css as a,html as m}from"lit";import{customElement as p}from"lit/decorators.js";import"@typo3/backend/element/icon-element.js";var d=function(n,t,r,i){var o=arguments.length,e=o<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,r):i,c;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(n,t,r,i);else for(var s=n.length-1;s>=0;s--)(c=n[s])&&(e=(o<3?c(e):o>3?c(t,r,e):c(t,r))||e);return o>3&&e&&Object.defineProperty(t,r,e),e};let f=class extends l{static{this.styles=a``}render(){return m`<div><h2>Basics</h2></div>`}createRenderRoot(){return this}};f=d([p("editor-left-pane-basics")],f);export{f as EditorLeftPaneBasics};
