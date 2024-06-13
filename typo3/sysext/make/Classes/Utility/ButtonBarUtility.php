<?php

namespace TYPO3\CMS\Make\Utility;

use TYPO3\CMS\Backend\Routing\Exception\RouteNotFoundException;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\Components\ButtonBar;
use TYPO3\CMS\Backend\Template\Components\Buttons\GenericButton;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ButtonBarUtility
{
    public function __construct(
        protected readonly UriBuilder $backendUriBuilder,
        protected IconFactory $iconFactory
    ){
    }

    /**
     * @throws RouteNotFoundException
     */
    public function addIndexButtonBar(ModuleTemplate $moduleTemplate): void
    {
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $addContentElementButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string)$this->backendUriBuilder->buildUriFromRoute('make_content_block_edit', [
                'type' => 'new',
                'name' => ''
            ]))
            ->setIcon($this->iconFactory->getIcon('actions-add'))
            ->setTitle('Add a new content element')
            ->setLabel('Add content element')
            ->setShowLabelText(true)
            ->setAttributes(['data-action' => 'add-content-block']);
        $buttonBar->addButton($addContentElementButton, ButtonBar::BUTTON_POSITION_LEFT, 1);

        $addRecordTypeButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref('#')
            ->setIcon($this->iconFactory->getIcon('actions-add'))
            ->setTitle('Add a new record type')
            ->setLabel('Add record type')
            ->setShowLabelText(true)
            ->setAttributes(['data-action' => 'add-record-type']);
        $buttonBar->addButton($addRecordTypeButton, ButtonBar::BUTTON_POSITION_LEFT, 1);

        $addPageTypeButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref('#')
            ->setIcon($this->iconFactory->getIcon('actions-add'))
            ->setTitle('Add a new page type')
            ->setLabel('Add page type')
            ->setShowLabelText(true);
        $buttonBar->addButton($addPageTypeButton, ButtonBar::BUTTON_POSITION_LEFT, 1);

        $reloadListButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui'))
            ->setIcon($this->iconFactory->getIcon('actions-refresh'))
            ->setTitle('Reload list')
            ->setLabel('Reload')
            ->setShowLabelText(false);
        $buttonBar->addButton($reloadListButton, ButtonBar::BUTTON_POSITION_RIGHT, 2);
    }

    /**
     * @throws RouteNotFoundException
     */
    public function addEditButtonBar(ModuleTemplate $moduleTemplate): void
    {
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $addContentElementButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui'))
            ->setTitle('Go back to the list')
            ->setLabel('Go back')
            ->setIcon($this->iconFactory->getIcon('actions-arrow-down-left'))
            ->setShowLabelText(true);
        $saveContentElementButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref('#')
            ->setTitle('Save content element')
            ->setLabel('Save')
            ->setIcon($this->iconFactory->getIcon('actions-save'))
            ->setAttributes(['data-action' => 'save-content-block'])
            ->setShowLabelText(true);
        $buttonBar->addButton($saveContentElementButton, ButtonBar::BUTTON_POSITION_LEFT, 2);

        $buttonBar->addButton($addContentElementButton, ButtonBar::BUTTON_POSITION_LEFT, 1);
    }
}
