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
/**
 * This processor is used as client-side counterpart of `\TYPO3\CMS\Core\Page\JavaScriptItems
 *
 * @module @typo3/core/java-script-item-processor
 * @internal Use in TYPO3 core only, API can change at any time!
 */
const FLAG_USE_IMPORTMAP = 2;
const FLAG_USE_TOP_WINDOW = 16;
const deniedProperties = ['__proto__', 'prototype', 'constructor'];
const allowedJavaScriptItemTypes = ['assign', 'invoke', 'instance'];
export function loadModule(payload) {
    if (!payload.name) {
        throw new Error('JavaScript module name is required');
    }
    if ((payload.flags & FLAG_USE_IMPORTMAP) === FLAG_USE_IMPORTMAP) {
        if (!(payload.flags & FLAG_USE_TOP_WINDOW)) {
            return import(payload.name);
        }
        else {
            const event = new CustomEvent('typo3:import-javascript-module', {
                detail: {
                    specifier: payload.name,
                    importPromise: null
                }
            });
            top.document.dispatchEvent(event);
            return event.detail.importPromise || Promise.reject(new Error('Top-level import failed'));
        }
    }
    throw new Error('Unknown JavaScript module type');
}
export function resolveSubjectRef(__esModule, payload) {
    const exportName = payload.exportName;
    if (typeof exportName === 'string') {
        return __esModule[exportName];
    }
    return __esModule.default;
}
export function executeJavaScriptModuleInstruction(json) {
    // `name` is required
    if (!json.name) {
        throw new Error('JavaScript module name is required');
    }
    if (!json.items) {
        return loadModule(json);
    }
    const items = json.items
        .filter((item) => allowedJavaScriptItemTypes.includes(item.type))
        .map((item) => {
        if (item.type === 'assign') {
            return (__esModule) => {
                const subjectRef = resolveSubjectRef(__esModule, json);
                mergeRecursive(subjectRef, item.assignments);
            };
        }
        else if (item.type === 'invoke') {
            return (__esModule) => {
                const subjectRef = resolveSubjectRef(__esModule, json);
                if ('method' in item && item.method) {
                    return subjectRef[item.method](...item.args);
                }
                else {
                    return subjectRef(...item.args);
                }
            };
        }
        else if (item.type === 'instance') {
            return (__esModule) => {
                // this `null` is `thisArg` scope of `Function.bind`,
                // which will be reset when invoking `new`
                const args = [null].concat(item.args);
                const subjectRef = resolveSubjectRef(__esModule, json);
                return new (subjectRef.bind(...args));
            };
        }
        else {
            return () => {
                return;
            };
        }
    });
    return loadModule(json).then((subjectRef) => items.map((item) => item.call(null, subjectRef)));
}
function isObjectInstance(item) {
    return item instanceof Object && !(item instanceof Array);
}
function mergeRecursive(target, source) {
    Object.keys(source).forEach((property) => {
        if (deniedProperties.indexOf(property) !== -1) {
            throw new Error('Property ' + property + ' is not allowed');
        }
        if (!isObjectInstance(source[property]) || typeof target[property] === 'undefined') {
            Object.assign(target, { [property]: source[property] });
        }
        else {
            mergeRecursive(target[property], source[property]);
        }
    });
}
export class JavaScriptItemProcessor {
    constructor() {
        this.invokableNames = ['globalAssignment', 'javaScriptModuleInstruction'];
    }
    /**
     * Processes multiple items and delegates to handlers
     * (globalAssignment, javaScriptModuleInstruction)
     */
    processItems(items) {
        items.forEach((item) => this.invoke(item.type, item.payload));
    }
    invoke(name, data) {
        if (!this.invokableNames.includes(name) || typeof this[name] !== 'function') {
            throw new Error('Unknown handler name "' + name + '"');
        }
        this[name].call(this, data);
    }
    /**
     * Assigns (filtered) variables to `window` object globally.
     */
    globalAssignment(payload) {
        mergeRecursive(window, payload);
    }
    /**
     * Loads and invokes a JavaScript (ESM) or requires.js (AMD) module.
     */
    javaScriptModuleInstruction(payload) {
        executeJavaScriptModuleInstruction(payload);
    }
}
