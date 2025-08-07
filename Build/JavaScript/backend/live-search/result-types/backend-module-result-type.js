import LiveSearchConfigurator from '@typo3/backend/live-search/live-search-configurator';
export function registerType(type) {
    LiveSearchConfigurator.addInvokeHandler(type, 'open_module', (resultItem) => {
        TYPO3.ModuleMenu.App.showModule(resultItem.extraData.moduleIdentifier);
    });
}
