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
import { html, render, nothing } from 'lit';
import { until } from 'lit/directives/until';
/**
 * @internal
 */
export const renderNodes = (result) => {
    const anvil = document.createElement('div');
    render(result, anvil);
    return anvil.childNodes;
};
/**
 * @internal
 */
export const renderHTML = (result) => {
    const anvil = document.createElement('div');
    render(result, anvil);
    return anvil.innerHTML;
};
/**
 * @internal
 */
export const lll = (key, ...args) => {
    let languagePool = null;
    if (window.TYPO3 && window.TYPO3.lang && typeof window.TYPO3.lang[key] === 'string') {
        languagePool = window.TYPO3.lang;
    }
    else if (top.TYPO3 && top.TYPO3.lang && typeof top.TYPO3.lang[key] === 'string') {
        languagePool = top.TYPO3.lang;
    }
    if (languagePool === null) {
        return '';
    }
    let index = 0;
    return languagePool[key].replace(/%[sdf]/g, (match) => {
        const arg = args[index++];
        switch (match) {
            case '%s':
                return String(arg);
            case '%d':
                return String(parseInt(arg, 10));
            case '%f':
                return String(parseFloat(arg).toFixed(2));
            default:
                return match;
        }
    });
};
export const classesArrayToClassInfo = (classes) => {
    return classes.reduce((classInfo, name) => {
        classInfo[name] = true;
        return classInfo;
    }, {});
};
/**
 * Creates style tag having using a nonce-value if declared in `window.litNonce`
 * (see https://lit.dev/docs/api/ReactiveElement/#ReactiveElement.styles)
 *
 * @example
 * ```
 *  return html`
 *    ${styleTag`
 *      .my-style { ... }
 *    `}
 *    <div class="my-style">...</div>
 *  `
 * ```
 * produces a template result containing
 * ```
 *    <style nonce="...">
 *      .my-style { ... }
 *    </style>
 *    <div class="my-style">...</div>
 * ```
 * @deprecated avoid using dynamic styles in light DOM elements
 */
export const styleTag = (strings, windowRef) => {
    const nonce = (windowRef || window).litNonce;
    if (nonce) {
        return html `<style nonce="${nonce}">${strings}</style>`;
    }
    return html `<style>${strings}</style>`;
};
/**
 * Delays rendering a renderable by `timeout` milliseconds
 *
 * @example
 *
 * ```
 *   return html`${delay(80, () => html`Loading…`)}`
 * ```
 *
 * @internal
 */
export const delay = (timeout, result, fallback = () => nothing) => until(new Promise((resolve) => window.setTimeout(() => resolve(result()), timeout)), fallback());
