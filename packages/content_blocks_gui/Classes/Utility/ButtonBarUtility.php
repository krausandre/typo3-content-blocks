<?php

declare(strict_types=1);

namespace FriendsOfTYPO3\ContentBlocksGui\Utility;

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
        protected IconFactory $iconFactory,
    ) {}

    /**
     * @throws RouteNotFoundException
     */
    public function addIndexButtonBar(ModuleTemplate $moduleTemplate): void
    {
        $buttonBar = $moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $addContentElementButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string) $this->backendUriBuilder->buildUriFromRoute('content_block_gui_content_block_modify', [
                'type' => 'new',
                'name' => '',
            ]))
            ->setIcon($this->iconFactory->getIcon('actions-add'))
            ->setTitle('Add a new content element')
            ->setLabel('Add content element')
            ->setShowLabelText(true)
            ->setAttributes(['data-action' => 'add-content-block']);
        $buttonBar->addButton($addContentElementButton, ButtonBar::BUTTON_POSITION_LEFT, 1);

        $addRecordTypeButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string) $this->backendUriBuilder->buildUriFromRoute('content_block_gui_content_block_modify', [
                'type' => 'new',
                'name' => '',
                'contentType' => 'record-type',
            ]))
            ->setIcon($this->iconFactory->getIcon('actions-add'))
            ->setTitle('Add a new record type')
            ->setLabel('Add record type')
            ->setShowLabelText(true)
            ->setAttributes(['data-action' => 'add-record-type']);
        $buttonBar->addButton($addRecordTypeButton, ButtonBar::BUTTON_POSITION_LEFT, 1);

        $addPageTypeButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string) $this->backendUriBuilder->buildUriFromRoute('content_block_gui_content_block_modify', [
                'type' => 'new',
                'name' => '',
                'contentType' => 'page-type',
            ]))
            ->setIcon($this->iconFactory->getIcon('actions-add'))
            ->setTitle('Add a new page type')
            ->setLabel('Add page type')
            ->setShowLabelText(true)
            ->setAttributes(['data-action' => 'add-page-type']);
        $buttonBar->addButton($addPageTypeButton, ButtonBar::BUTTON_POSITION_LEFT, 1);

        $addBasicButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string) $this->backendUriBuilder->buildUriFromRoute('content_block_gui_basic_modify', [
                'type' => 'new',
                'identifier' => '',
            ]))
            ->setIcon($this->iconFactory->getIcon('actions-add'))
            ->setTitle('Add a new basic')
            ->setLabel('Add basic')
            ->setShowLabelText(true)
            ->setAttributes(['data-action' => 'add-basic']);
        $buttonBar->addButton($addBasicButton, ButtonBar::BUTTON_POSITION_LEFT, 1);

        $uploadButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('button')
            ->setIcon($this->iconFactory->getIcon('actions-upload'))
            ->setTitle('Upload Content Block(s) from ZIP')
            ->setLabel('Upload')
            ->setShowLabelText(true)
            ->setAttributes(['data-action' => 'upload-content-blocks']);
        $buttonBar->addButton($uploadButton, ButtonBar::BUTTON_POSITION_LEFT, 2);

        $reloadListButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string) $this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui'))
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

        // Go back button
        $addContentElementButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string) $this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui'))
            ->setTitle('Go back to the list')
            ->setLabel('Go back')
            ->setIcon($this->iconFactory->getIcon('actions-arrow-down-left'))
            ->setShowLabelText(true);
        $buttonBar->addButton($addContentElementButton, ButtonBar::BUTTON_POSITION_LEFT, 1);

        // Save button (AJAX - stay in editor)
        $saveButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref('#')
            ->setTitle('Save and continue editing')
            ->setLabel('Save')
            ->setIcon($this->iconFactory->getIcon('actions-save'))
            ->setAttributes(['data-action' => 'save-content-block'])
            ->setShowLabelText(true);
        $buttonBar->addButton($saveButton, ButtonBar::BUTTON_POSITION_LEFT, 2);

        // Save & Close button (Form POST - redirect to list)
        $saveAndCloseButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref('#')
            ->setTitle('Save and return to list')
            ->setLabel('Save & Close')
            ->setIcon($this->iconFactory->getIcon('actions-save-close'))
            ->setAttributes(['data-action' => 'save-and-close-content-block'])
            ->setShowLabelText(true);
        $buttonBar->addButton($saveAndCloseButton, ButtonBar::BUTTON_POSITION_LEFT, 3);
    }
}
