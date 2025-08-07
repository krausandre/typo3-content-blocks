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
import { ScaffoldIdentifierEnum } from '../enum/viewport/scaffold-identifier';
import { AbstractContainer } from './abstract-container';
import TriggerRequest from '../event/trigger-request';
import { selector } from '@typo3/core/literals';
class NavigationContainer extends AbstractContainer {
    constructor(consumerScope) {
        super(consumerScope);
        this.activeComponentId = '';
    }
    get parent() {
        return document.querySelector(ScaffoldIdentifierEnum.scaffold);
    }
    get container() {
        return document.querySelector(ScaffoldIdentifierEnum.contentNavigation);
    }
    /**
     * Renders registered (non-iframe) navigation component e.g. a page tree
     *
     * @param {string} navigationComponentId
     */
    showComponent(navigationComponentId) {
        const container = this.container;
        this.show(navigationComponentId);
        // Component is already loaded and active, nothing to do
        if (navigationComponentId === this.activeComponentId) {
            return;
        }
        if (this.activeComponentId !== '') {
            const activeComponentElement = container.querySelector('#navigationComponent-' + this.activeComponentId.replace(/[/@]/g, '_'));
            if (activeComponentElement) {
                activeComponentElement.style.display = 'none';
            }
        }
        const componentCssName = navigationComponentId.replace(/[/@]/g, '_');
        const navigationComponentElement = 'navigationComponent-' + componentCssName;
        // The component was already set up, so requiring the module again can be excluded.
        if (container.querySelectorAll(selector `[data-component="${navigationComponentId}"]`).length === 1) {
            this.show(navigationComponentId);
            this.activeComponentId = navigationComponentId;
            return;
        }
        import(navigationComponentId + '.js').then((__esModule) => {
            if (typeof __esModule.navigationComponentName === 'string') {
                const tagName = __esModule.navigationComponentName;
                const element = document.createElement(tagName);
                element.setAttribute('id', navigationComponentElement);
                element.classList.add('scaffold-content-navigation-component');
                element.dataset.component = navigationComponentId;
                container.append(element);
            }
            else {
                // Because the component does not exist, let's create the div as wrapper
                container.insertAdjacentHTML('beforeend', '<div class="scaffold-content-navigation-component" data-component="' + navigationComponentId + '" id="' + navigationComponentElement + '"></div>');
                // manual static initialize method, unused but kept for backwards-compatibility until TYPO3 v12
                const navigationComponent = Object.values(__esModule)[0];
                navigationComponent.initialize('#' + navigationComponentElement);
            }
            this.show(navigationComponentId);
            this.activeComponentId = navigationComponentId;
        });
    }
    hide() {
        const parent = this.parent;
        parent.classList.remove('scaffold-content-navigation-available');
    }
    show(component) {
        const parent = this.parent;
        const container = this.container;
        container.querySelectorAll(ScaffoldIdentifierEnum.contentNavigationDataComponent).forEach((el) => el.style.display = 'none');
        parent.classList.add('scaffold-content-navigation-available');
        const selectedElement = container.querySelector('[data-component="' + component + '"]');
        if (selectedElement) {
            // Re-set to the display setting from CSS
            selectedElement.style.display = null;
        }
    }
    setUrl(urlToLoad, interactionRequest) {
        const promise = this.consumerScope.invoke(new TriggerRequest('typo3.setUrl', interactionRequest));
        promise.then(() => {
            this.parent.classList.add('scaffold-content-navigation-expanded');
        });
        return promise;
    }
}
export default NavigationContainer;
