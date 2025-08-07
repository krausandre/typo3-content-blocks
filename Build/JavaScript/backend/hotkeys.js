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
import HotkeyStorage, {} from '@typo3/backend/hotkeys/hotkey-storage';
import RegularEvent from '@typo3/core/event/regular-event';
export var ModifierKeys;
(function (ModifierKeys) {
    ModifierKeys["META"] = "meta";
    ModifierKeys["CTRL"] = "control";
    ModifierKeys["SHIFT"] = "shift";
    ModifierKeys["ALT"] = "alt";
})(ModifierKeys || (ModifierKeys = {}));
/**
 * Module: @typo3/backend/hotkeys
 *
 * Provides API to register hotkeys (aka shortcuts) in the TYPO3 backend. It is possible to register hotkeys in
 * different scopes, that can also be switched during runtime. Extensions should always specify their scope when
 * registering hotkeys.
 *
 * Due to how the TYPO3 backend currently works, registered hotkeys are limited to the same document the API is used in.
 */
class Hotkeys {
    constructor() {
        // navigator.platform is deprecated, but https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API is experimental for now
        this.normalizedCtrlModifierKey = navigator.platform.toLowerCase().startsWith('mac') ? ModifierKeys.META : ModifierKeys.CTRL;
        this.defaultOptions = {
            scope: 'all',
            allowOnEditables: false,
            allowRepeat: false,
            bindElement: undefined
        };
        this.scopedHotkeyMap = HotkeyStorage.getScopedHotkeyMap();
        this.setScope('all');
        this.registerEventHandler();
    }
    setScope(scope) {
        HotkeyStorage.activeScope = scope;
    }
    getScope() {
        return HotkeyStorage.activeScope;
    }
    register(hotkey, handler, options = {}) {
        if (hotkey.filter((hotkeyPart) => !Object.values(ModifierKeys).includes(hotkeyPart)).length === 0) {
            throw new Error('Attempted to register hotkey "' + hotkey.join('+') + '" without a non-modifier key.');
        }
        // Normalize trigger
        hotkey = hotkey.map((h) => h.toLowerCase());
        const mergedConfiguration = { ...this.defaultOptions, ...options };
        if (!this.scopedHotkeyMap.has(mergedConfiguration.scope)) {
            this.scopedHotkeyMap.set(mergedConfiguration.scope, new Map());
        }
        let ariaKeyShortcut = this.composeAriaKeyShortcut(hotkey);
        const hotkeyMap = this.scopedHotkeyMap.get(mergedConfiguration.scope);
        const hotkeyStruct = this.createHotkeyStructFromTrigger(hotkey);
        const encodedHotkeyStruct = JSON.stringify(hotkeyStruct);
        if (hotkeyMap.has(encodedHotkeyStruct)) {
            const setup = hotkeyMap.get(encodedHotkeyStruct);
            // Hotkey already exists, remove potentially set `aria-keyshortcuts` for this hotkey
            setup.options.bindElement?.removeAttribute('aria-keyshortcuts');
            // Delete existing hotkey. If the existing hotkey was registered in a different browser scope, the callback is lost
            hotkeyMap.delete(encodedHotkeyStruct);
        }
        hotkeyMap.set(encodedHotkeyStruct, { struct: hotkeyStruct, handler, options: mergedConfiguration });
        if (mergedConfiguration.bindElement instanceof Element) {
            const existingAriaAttribute = mergedConfiguration.bindElement.getAttribute('aria-keyshortcuts');
            if (existingAriaAttribute !== null && !existingAriaAttribute.includes(ariaKeyShortcut)) {
                // Element already has `aria-keyshortcuts`, append composed shortcut
                ariaKeyShortcut = existingAriaAttribute + ' ' + ariaKeyShortcut;
            }
            mergedConfiguration.bindElement.setAttribute('aria-keyshortcuts', ariaKeyShortcut);
        }
    }
    registerEventHandler() {
        new RegularEvent('keydown', (e) => {
            const hotkeySetup = this.findHotkeySetup(e);
            if (hotkeySetup === null) {
                return;
            }
            if (e.repeat && !hotkeySetup.options.allowRepeat) {
                return;
            }
            if (!hotkeySetup.options.allowOnEditables) {
                const target = e.target;
                if (target.isContentEditable || (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && !e.target.readOnly)) {
                    return;
                }
            }
            hotkeySetup.handler(e);
        }).bindTo(document);
    }
    findHotkeySetup(e) {
        // We always consider the global "all" scope first to avoid overriding global hotkeys
        const scopes = [...new Set(['all', HotkeyStorage.activeScope])];
        const hotkeyStruct = this.createHotkeyStructFromEvent(e);
        const encodedHotkeyStruct = JSON.stringify(hotkeyStruct);
        for (const scope of scopes) {
            const hotkeyMap = this.scopedHotkeyMap.get(scope);
            if (hotkeyMap.has(encodedHotkeyStruct)) {
                return hotkeyMap.get(encodedHotkeyStruct);
            }
        }
        return null;
    }
    createHotkeyStructFromTrigger(hotkey) {
        const nonModifierCodes = hotkey.filter((hotkeyPart) => !Object.values(ModifierKeys).includes(hotkeyPart));
        if (nonModifierCodes.length > 1) {
            throw new Error('Cannot register hotkey with more than one non-modifier key, "' + nonModifierCodes.join('+') + '" given.');
        }
        return {
            modifiers: {
                meta: hotkey.includes(ModifierKeys.META),
                ctrl: hotkey.includes(ModifierKeys.CTRL),
                shift: hotkey.includes(ModifierKeys.SHIFT),
                alt: hotkey.includes(ModifierKeys.ALT),
            },
            key: nonModifierCodes[0].toLowerCase(),
        };
    }
    createHotkeyStructFromEvent(e) {
        return {
            modifiers: {
                meta: e.metaKey,
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
            },
            key: e.key?.toLowerCase(),
        };
    }
    /**
     * Composes a string for use with `aria-keyshortcuts`
     * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-keyshortcuts
     */
    composeAriaKeyShortcut(hotkey) {
        const parts = [];
        for (let key of hotkey) {
            if (key === '+') {
                key = 'plus';
            }
            else {
                key = key.replace(/[\u00A0-\u9999<>&]/g, i => '&#' + i.charCodeAt(0) + ';');
            }
            parts.push(key);
        }
        // The standard requires to have modifier keys to be at first
        parts.sort((a, b) => {
            const aIsModifierKey = Object.values(ModifierKeys).includes(a);
            const bIsModifierKey = Object.values(ModifierKeys).includes(b);
            if (aIsModifierKey && !bIsModifierKey) {
                return -1;
            }
            if (!aIsModifierKey && bIsModifierKey) {
                return 1;
            }
            if (aIsModifierKey && bIsModifierKey) {
                return -1;
            }
            return 0;
        });
        return parts.join('+');
    }
}
// Helper to always get the same instance within a frame
// @todo: have the module in `top` scope, while being able to register the `keydown` event in each frame
let hotkeysInstance;
if (!TYPO3.Hotkeys) {
    hotkeysInstance = new Hotkeys();
    TYPO3.Hotkeys = hotkeysInstance;
}
else {
    hotkeysInstance = TYPO3.Hotkeys;
}
export default hotkeysInstance;
