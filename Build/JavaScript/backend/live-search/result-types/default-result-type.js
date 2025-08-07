import LiveSearchConfigurator from '@typo3/backend/live-search/live-search-configurator';
import '@typo3/backend/live-search/element/provider/page-provider-result-item';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import Notification from '@typo3/backend/notification';
export function registerType(type) {
    LiveSearchConfigurator.addInvokeHandler(type, 'switch_backend_user', (resultItem) => {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.switch_user)).post({
            targetUser: resultItem.extraData.uid,
        }).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.url) {
                top.window.location.href = data.url;
            }
            else {
                Notification.error('Switching to user went wrong.');
            }
        });
    });
}
