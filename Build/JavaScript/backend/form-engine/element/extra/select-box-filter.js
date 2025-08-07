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
import RegularEvent from '@typo3/core/event/regular-event';
var Selectors;
(function (Selectors) {
    Selectors["fieldContainerSelector"] = ".t3js-formengine-field-group";
    Selectors["filterTextFieldSelector"] = ".t3js-formengine-multiselect-filter-textfield";
    Selectors["filterSelectFieldSelector"] = ".t3js-formengine-multiselect-filter-dropdown";
})(Selectors || (Selectors = {}));
/**
 * Select field filter functions, see TCA option "multiSelectFilterItems"
 */
class SelectBoxFilter {
    constructor(selectElement) {
        this.selectElement = null;
        this.availableOptions = null;
        this.selectElement = selectElement;
        this.initializeEvents();
    }
    static toggleOptGroup(option) {
        const optGroup = option.parentElement;
        if (!(optGroup instanceof HTMLOptGroupElement)) {
            return;
        }
        if (optGroup.querySelectorAll('option:not([hidden]):not([disabled]):not(.hidden)').length === 0) {
            optGroup.hidden = true;
        }
        else {
            optGroup.hidden = false;
            optGroup.disabled = false;
            optGroup.classList.remove('hidden');
        }
    }
    initializeEvents() {
        const wizardsElement = this.selectElement.closest('.form-wizards-wrap');
        if (wizardsElement === null) {
            return;
        }
        new RegularEvent('input', (e) => {
            this.filter(e.target.value);
        }).delegateTo(wizardsElement, Selectors.filterTextFieldSelector);
        new RegularEvent('change', (e) => {
            this.filter(e.target.value);
        }).delegateTo(wizardsElement, Selectors.filterSelectFieldSelector);
    }
    /**
     * Filter the actual items
     *
     * @param {string} filterText
     */
    filter(filterText) {
        if (this.availableOptions === null) {
            this.availableOptions = this.selectElement.querySelectorAll('option');
        }
        const matchFilter = new RegExp(filterText, 'i');
        this.availableOptions.forEach((option) => {
            option.hidden = filterText.length > 0 && option.textContent.match(matchFilter) === null;
            SelectBoxFilter.toggleOptGroup(option);
        });
    }
}
export default SelectBoxFilter;
