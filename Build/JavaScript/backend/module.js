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
 * @internal
 */
export var ModuleSelector;
(function (ModuleSelector) {
    ModuleSelector["link"] = "[data-moduleroute-identifier]";
})(ModuleSelector || (ModuleSelector = {}));
/**
 * @internal
 */
export class ModuleUtility {
    static getRouteFromElement(element) {
        const moduleRoute = {
            identifier: element.dataset.modulerouteIdentifier,
            params: element.dataset.modulerouteParams
        };
        return moduleRoute;
    }
    /**
     * Gets the module properties from module information data attribute
     */
    static getFromName(name) {
        const parsedRecord = getParsedRecordFromName(name);
        if (parsedRecord === null) {
            return {
                name: name,
                aliases: [],
                component: '',
                navigationComponentId: '',
                parent: '',
                link: ''
            };
        }
        return {
            name: name,
            aliases: parsedRecord.aliases || [],
            component: parsedRecord.component || '',
            navigationComponentId: parsedRecord.navigationComponentId || '',
            parent: parsedRecord.parent || '',
            link: parsedRecord.link || '',
        };
    }
}
/**
 * Runtime cache of json serialized module information
 */
let parsedInformation = null;
/**
 * Flushes the runtime cache containing parsed module information
 *
 * @internal
 */
export function flushModuleCache() {
    parsedInformation = null;
}
function getParsedInformation() {
    if (parsedInformation === null) {
        const modulesInformation = String(document.querySelector('[data-modulemenu]')?.dataset.modulesInformation || '');
        if (modulesInformation !== '') {
            try {
                parsedInformation = JSON.parse(modulesInformation);
            }
            catch {
                console.error('Invalid modules information provided.');
                parsedInformation = null;
            }
        }
    }
    return parsedInformation;
}
function getParsedRecordFromName(name) {
    const parsedModuleInformation = getParsedInformation();
    if (parsedModuleInformation !== null) {
        for (const [key, module] of Object.entries(parsedModuleInformation)) {
            if (name === key || module.aliases.includes(name)) {
                return parsedModuleInformation[key];
            }
        }
    }
    return null;
}
