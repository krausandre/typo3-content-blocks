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
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { EditorView, lineNumbers, highlightSpecialChars, drawSelection, keymap, placeholder } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { executeJavaScriptModuleInstruction, loadModule, resolveSubjectRef } from '@typo3/core/java-script-item-processor';
import '@typo3/backend/element/spinner-element';
/**
 * Module: @typo3/backend/code-editor/element/code-mirror-element
 * Renders CodeMirror into FormEngine
 */
let CodeMirrorElement = class CodeMirrorElement extends LitElement {
    constructor() {
        super(...arguments);
        this.mode = null;
        this.addons = [];
        this.keymaps = [];
        this.lineDigits = 0;
        this.autoheight = false;
        this.nolazyload = false;
        this.readonly = false;
        this.fullscreen = false;
        this.panel = 'bottom';
        this.editorTheme = null;
        this.editorView = null;
    }
    static { this.styles = css `
    :host {
      position: relative;
      display: block;
    }

    :host([fullscreen]) {
      position: fixed;
      inset: 64px 0 0;
      z-index: 9;
    }

    :host([fullscreen]) .cm-scroller {
      min-height: initial;
      max-height: 100%;
    }

    :host([autoheight]) .cm-scroller {
      max-height: initial;
    }

    .codemirror-label {
      font-size: .875em;
      opacity: .75;
    }

    .codemirror-label-top {
      margin-bottom: .25rem;
    }

    .codemirror-label-bottom {
      margin-top: .25rem;
    }

    typo3-backend-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .cm-editor {
      overflow: hidden;
      border-radius: var(--typo3-input-border-radius);
      border: var(--typo3-input-border-width) solid var(--typo3-input-border-color);
      transition: outline-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    .cm-focused {
      border-color: var(--typo3-input-focus-border-color);
      outline-offset: 0;
      outline: .25rem solid color-mix(in srgb, var(--typo3-form-control-focus-border-color), transparent 25%);
    }

    .cm-gutters {
      height: auto !important;
      position: relative !important;
    }

    .cm-content {
      min-height: calc(8px + 12px * 1.4 * var(--rows, 18)) !important;
    }

    .cm-scroller {
      min-height: 100%;
      max-height: calc(100dvh - 10rem);
    }
  `; }
    /**
     * @internal
     */
    setContent(newContent) {
        if (this.editorView !== null) {
            this.editorView.dispatch({
                changes: {
                    from: 0,
                    to: this.editorView.state.doc.length,
                    insert: newContent
                }
            });
        }
    }
    /**
     * @internal
     */
    getContent() {
        return this.editorView.state.doc.toString();
    }
    render() {
        return html `
      ${this.label && this.panel === 'top' ? html `<div class="codemirror-label codemirror-label-top">${this.label}</div>` : ''}
      <div id="codemirror-parent" @keydown=${(e) => this.onKeydown(e)}></div>
      ${this.label && this.panel === 'bottom' ? html `<div class="codemirror-label codemirror-label-bottom">${this.label}</div>` : ''}
      ${this.editorView === null ? html `<typo3-backend-spinner size="large"></typo3-backend-spinner>` : ''}
    `;
    }
    firstUpdated() {
        if (this.nolazyload) {
            this.initializeEditor(this.firstElementChild);
            return;
        }
        const observerOptions = {
            root: document.body
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.intersectionRatio > 0) {
                    observer.unobserve(entry.target);
                    if (this.firstElementChild && this.firstElementChild.nodeName.toLowerCase() === 'textarea') {
                        this.initializeEditor(this.firstElementChild);
                    }
                }
            });
        }, observerOptions);
        observer.observe(this);
    }
    onKeydown(event) {
        if (event.ctrlKey && event.altKey && event.key === 'f') {
            event.preventDefault();
            this.fullscreen = true;
        }
        if (event.key === 'Escape' && this.fullscreen) {
            event.preventDefault();
            this.fullscreen = false;
        }
    }
    async initializeEditor(textarea) {
        const updateListener = EditorView.updateListener.of((v) => {
            if (v.docChanged) {
                textarea.value = v.state.doc.toString();
                textarea.dispatchEvent(new CustomEvent('change', { bubbles: true }));
            }
        });
        if (this.lineDigits > 0) {
            this.style.setProperty('--rows', this.lineDigits.toString());
        }
        else if (textarea.getAttribute('rows')) {
            this.style.setProperty('--rows', textarea.getAttribute('rows'));
        }
        this.editorTheme = new Compartment();
        const extensions = [
            this.editorTheme.of([]),
            updateListener,
            lineNumbers(),
            highlightSpecialChars(),
            drawSelection(),
            EditorState.allowMultipleSelections.of(true),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        ];
        if (this.readonly) {
            extensions.push(EditorState.readOnly.of(true));
        }
        if (this.placeholder) {
            extensions.push(placeholder(this.placeholder));
        }
        if (this.mode) {
            const modeImplementation = await executeJavaScriptModuleInstruction(this.mode);
            extensions.push(...modeImplementation);
        }
        if (this.addons.length > 0) {
            extensions.push(...await Promise.all(this.addons.map(moduleInstruction => executeJavaScriptModuleInstruction(moduleInstruction))));
        }
        const keymaps = [
            ...defaultKeymap,
            indentWithTab,
        ];
        if (this.keymaps.length > 0) {
            const dynamicKeymaps = await Promise.all(this.keymaps.map(keymap => loadModule(keymap).then((module) => resolveSubjectRef(module, keymap))));
            dynamicKeymaps.forEach(keymap => keymaps.push(...keymap));
        }
        extensions.push(keymap.of(keymaps));
        this.editorView = new EditorView({
            state: EditorState.create({
                doc: textarea.value,
                extensions
            }),
            parent: this.renderRoot.querySelector('#codemirror-parent'),
            root: this.renderRoot
        });
        this.toggleDarkMode(this.darkModeEnabled());
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMediaQuery.addEventListener('change', () => {
            this.toggleDarkMode(this.darkModeEnabled());
        });
    }
    darkModeEnabled() {
        const computedStyle = window.getComputedStyle(this);
        const colorScheme = computedStyle.colorScheme;
        if (colorScheme === 'light only' || colorScheme === 'light') {
            return false;
        }
        else if (colorScheme === 'dark only' || colorScheme === 'dark') {
            return true;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    toggleDarkMode(enabled) {
        this.editorView.dispatch({
            effects: this.editorTheme.reconfigure(enabled ? oneDark : [])
        });
    }
};
__decorate([
    property({ type: Object })
], CodeMirrorElement.prototype, "mode", void 0);
__decorate([
    property({ type: Array })
], CodeMirrorElement.prototype, "addons", void 0);
__decorate([
    property({ type: Array })
], CodeMirrorElement.prototype, "keymaps", void 0);
__decorate([
    property({ type: Number })
], CodeMirrorElement.prototype, "lineDigits", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], CodeMirrorElement.prototype, "autoheight", void 0);
__decorate([
    property({ type: Boolean })
], CodeMirrorElement.prototype, "nolazyload", void 0);
__decorate([
    property({ type: Boolean })
], CodeMirrorElement.prototype, "readonly", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], CodeMirrorElement.prototype, "fullscreen", void 0);
__decorate([
    property({ type: String })
], CodeMirrorElement.prototype, "label", void 0);
__decorate([
    property({ type: String })
], CodeMirrorElement.prototype, "placeholder", void 0);
__decorate([
    property({ type: String })
], CodeMirrorElement.prototype, "panel", void 0);
__decorate([
    state()
], CodeMirrorElement.prototype, "editorTheme", void 0);
__decorate([
    state()
], CodeMirrorElement.prototype, "editorView", void 0);
CodeMirrorElement = __decorate([
    customElement('typo3-t3editor-codemirror')
], CodeMirrorElement);
export { CodeMirrorElement };
