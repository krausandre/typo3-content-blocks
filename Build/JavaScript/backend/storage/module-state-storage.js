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
 * Module State previous known as `fsMod` with the previous description:
 *
 * > Used in main modules with a frameset for submodules to keep the ID
 * > between modules Typically that is set by something like this in a
 * > Web>* sub module
 *
 * @exports @typo3/backend/storage/module-state-storage
 */
export class ModuleStateStorage {
    static { this.prefix = 't3-module-state-'; }
    static update(module, identifier) {
        if (typeof identifier === 'number') {
            identifier = identifier.toString(10);
        }
        else if (typeof identifier !== 'string') {
            throw new SyntaxError('identifier must be of type string');
        }
        const oldState = ModuleStateStorage.current(module);
        const treeIdentifier = identifier === oldState.identifier ? oldState.treeIdentifier : null;
        const state = { identifier, treeIdentifier };
        ModuleStateStorage.commit(module, 'update', state);
        return state;
    }
    static updateWithTreeIdentifier(module, identifier, treeIdentifier) {
        if (typeof identifier === 'number') {
            identifier = identifier.toString(10);
        }
        else if (typeof identifier !== 'string') {
            throw new SyntaxError('identifier must be of type string');
        }
        if (typeof treeIdentifier === 'number') {
            treeIdentifier = treeIdentifier.toString(10);
        }
        else if (typeof treeIdentifier !== 'string') {
            throw new SyntaxError('treeIdentifier must be of type string');
        }
        const state = { identifier, treeIdentifier };
        ModuleStateStorage.commit(module, 'update-with-tree-identifier', state);
        return state;
    }
    static updateWithCurrentMount(module, identifier) {
        ModuleStateStorage.update(module, identifier);
    }
    static current(module) {
        const state = {
            ...ModuleStateStorage.getInitialState(),
            ...(ModuleStateStorage.fetch(module) ?? {}),
        };
        return state;
    }
    static purge() {
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith(ModuleStateStorage.prefix))
            .forEach((key) => sessionStorage.removeItem(key));
    }
    static fetch(module) {
        const data = sessionStorage.getItem(ModuleStateStorage.prefix + module);
        if (data === null) {
            return null;
        }
        return JSON.parse(data);
    }
    static async commit(module, mode, state) {
        const oldState = ModuleStateStorage.current(module);
        sessionStorage.setItem(ModuleStateStorage.prefix + module, JSON.stringify(state));
        top.document.dispatchEvent(new CustomEvent('typo3:module-state-storage:' + mode + ':' + module, {
            detail: {
                state,
                oldState,
            }
        }));
    }
    static getInitialState() {
        return { identifier: '', treeIdentifier: null };
    }
}
// exposing `ModuleStateStorage`
window.ModuleStateStorage = ModuleStateStorage;
