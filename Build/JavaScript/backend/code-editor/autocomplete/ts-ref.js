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
import AjaxRequest from '@typo3/core/ajax/ajax-request';
export class TsRefType {
    constructor(typeId, extendsTypeId, properties) {
        this.properties = {};
        this.typeId = typeId;
        this.extends = extendsTypeId;
        this.properties = properties;
    }
}
export class TsRefProperty {
    constructor(parentType, name, value) {
        this.parentType = parentType;
        this.name = name;
        this.value = value;
    }
}
export class TsRef {
    constructor() {
        this.typeTree = {};
        this.doc = null;
    }
    /**
     * Load available TypoScript reference
     */
    async loadTsrefAsync() {
        const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.codeeditor_tsref).get();
        this.doc = await response.resolve();
        this.buildTree();
    }
    /**
     * Build the TypoScript reference tree
     */
    buildTree() {
        for (const typeId of Object.keys(this.doc)) {
            const arr = this.doc[typeId];
            this.typeTree[typeId] = new TsRefType(typeId, arr.extends || undefined, Object.fromEntries(Object.entries(arr.properties).map(([propName, property]) => [propName, new TsRefProperty(typeId, propName, property.type)])));
        }
        for (const typeId of Object.keys(this.typeTree)) {
            if (typeof this.typeTree[typeId].extends !== 'undefined') {
                this.addPropertiesToType(this.typeTree[typeId], this.typeTree[typeId].extends, 100);
            }
        }
    }
    /**
     * Adds properties to TypoScript types
     */
    addPropertiesToType(addToType, addFromTypeNames, maxRecDepth) {
        if (maxRecDepth < 0) {
            throw 'Maximum recursion depth exceeded while trying to resolve the extends in the TSREF!';
        }
        const exts = addFromTypeNames.split(',');
        for (let i = 0; i < exts.length; i++) {
            // "Type 'array' which is used to extend 'undefined', was not found in the TSREF!"
            if (typeof this.typeTree[exts[i]] !== 'undefined') {
                if (typeof this.typeTree[exts[i]].extends !== 'undefined') {
                    this.addPropertiesToType(this.typeTree[exts[i]], this.typeTree[exts[i]].extends, maxRecDepth - 1);
                }
                const properties = this.typeTree[exts[i]].properties;
                for (const propName in properties) {
                    // only add this property if it was not already added by a supertype (subtypes override supertypes)
                    if (typeof addToType.properties[propName] === 'undefined') {
                        addToType.properties[propName] = properties[propName];
                    }
                }
            }
        }
    }
    /**
     * Get properties from given TypoScript type id
     */
    getPropertiesFromTypeId(tId) {
        if (typeof this.typeTree[tId] !== 'undefined') {
            // clone is needed to assure that nothing of the tsref is overwritten by user setup
            this.typeTree[tId].properties.clone = function () {
                const result = {};
                for (const key of Object.keys(this)) {
                    result[key] = new TsRefProperty(this[key].parentType, this[key].name, this[key].value);
                }
                return result;
            };
            return this.typeTree[tId].properties;
        }
        return {};
    }
    /**
     * Check if a property of a type exists
     */
    typeHasProperty(typeId, propertyName) {
        return (typeof this.typeTree[typeId] !== 'undefined' &&
            typeof this.typeTree[typeId].properties[propertyName] !== 'undefined');
    }
    /**
     * Get the type
     */
    getType(typeId) {
        return this.typeTree[typeId];
    }
    /**
     * Check if type exists in the type tree
     */
    isType(typeId) {
        return typeof this.typeTree[typeId] !== 'undefined';
    }
}
