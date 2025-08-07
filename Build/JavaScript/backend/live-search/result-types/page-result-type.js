import LiveSearchConfigurator from '@typo3/backend/live-search/live-search-configurator';
import { html } from 'lit';
import windowManager from '@typo3/backend/window-manager';
export function registerRenderer(type) {
    LiveSearchConfigurator.addRenderer(type, '@typo3/backend/live-search/element/provider/page-provider-result-item.js', (attributes) => {
        return html `<typo3-backend-live-search-result-item-page-provider
        .icon="${attributes.icon}"
        .itemTitle="${attributes.itemTitle}"
        .typeLabel="${attributes.typeLabel}"
        .extraData="${attributes.extraData}">
      </typo3-backend-live-search-result-item-page-provider>`;
    });
    LiveSearchConfigurator.addInvokeHandler(type, 'preview_page', (resultItem, action) => {
        windowManager.localOpen(action.url, true);
    });
}
