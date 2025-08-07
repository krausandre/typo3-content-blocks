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
import DocumentService from '@typo3/core/document-service';
import RegularEvent from '@typo3/core/event/regular-event';
import DebounceEvent from '@typo3/core/event/debounce-event';
DocumentService.ready().then(() => {
    const searchField = document.getElementById('search-field');
    const filterContainer = document.getElementById('t3js-filter-container');
    new RegularEvent('click', (e, target) => {
        e.preventDefault();
        searchField.value = target.dataset.filter;
        filterContainer.dispatchEvent(new CustomEvent('typo3:styleguide:update-icons', {
            detail: {
                searchValue: searchField.value
            }
        }));
    }).delegateTo(document, '.t3js-filter-buttons button');
    new DebounceEvent('input', (e) => {
        filterContainer.dispatchEvent(new CustomEvent('typo3:styleguide:update-icons', {
            detail: {
                searchValue: e.target.value
            }
        }));
    }).bindTo(searchField);
    new RegularEvent('typo3:styleguide:update-icons', (e) => {
        const typedQuery = e.detail.searchValue;
        const iconContainerElements = Array.from(filterContainer.querySelectorAll('[data-icon-identifier]'));
        if (typedQuery === '') {
            iconContainerElements.map((iconContainer) => iconContainer.hidden = false);
        }
        else {
            if (typedQuery.includes('type:')) {
                const [, type] = typedQuery.split(':');
                switch (type.toLowerCase()) {
                    case 'bitmap':
                        iconContainerElements.forEach((iconContainer) => {
                            const containsIconsOfType = iconContainer.querySelector('img:not([src$=".svg"])') !== null;
                            iconContainer.hidden = !containsIconsOfType;
                        });
                        break;
                    case 'font':
                        iconContainerElements.forEach((iconContainer) => {
                            const containsIconsOfType = iconContainer.querySelector('i.fa') !== null;
                            iconContainer.hidden = !containsIconsOfType;
                        });
                        break;
                    case 'vector':
                        iconContainerElements.forEach((iconContainer) => {
                            const containsIconsOfType = iconContainer.querySelector('img[src$=".svg"]') !== null;
                            iconContainer.hidden = !containsIconsOfType;
                        });
                        break;
                    default:
                }
            }
            else {
                iconContainerElements.forEach((iconContainer) => {
                    iconContainer.hidden = !iconContainer.matches('[data-icon-identifier*="' + typedQuery + '"]');
                });
            }
        }
    }).bindTo(filterContainer);
});
