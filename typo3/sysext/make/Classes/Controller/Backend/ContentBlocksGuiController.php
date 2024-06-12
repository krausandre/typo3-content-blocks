<?php

declare(strict_types=1);

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

namespace TYPO3\CMS\Make\Controller\Backend;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Routing\Exception\RouteNotFoundException;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\Components\ButtonBar;
use TYPO3\CMS\Backend\Template\Components\Buttons\GenericButton;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Http\RedirectResponse;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Make\Utility\ContentBlocksUtility;
use TYPO3\CMS\Make\Utility\ExtensionUtility;

#[AsController]
final class ContentBlocksGuiController
{
    protected ModuleTemplate $moduleTemplate;

    public function __construct(
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected readonly UriBuilder $backendUriBuilder,
        protected PageRenderer $pageRenderer,
        protected ContentBlocksUtility $contentBlocksUtility,
        protected ExtensionUtility $extensionUtility,
        protected IconFactory $iconFactory
    ) {
    }

    public function indexAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);

        $sampleJson = file_get_contents(Environment::getFrameworkBasePath() . '/make/Test/Fixtures/listCbAction.json');
        $sampleData = json_decode($sampleJson, true);
        $contentBlocks = $sampleData['contentBlocks'];
        foreach ($contentBlocks as $key => $contentBlock) {
            $contentBlocks[$key]['editUrl'] = (string)$this->backendUriBuilder->buildUriFromRoute('make_content_block_edit', [
                'name' => $contentBlock['name'],
                'mode' => 'edit',
            ]);
            $contentBlocks[$key]['duplicateUrl'] = (string)$this->backendUriBuilder->buildUriFromRoute('make_content_block_duplicate', [
                'name' => $contentBlock['name'],
                'mode' => 'duplicate',
            ]);
            $contentBlocks[$key]['deleteUrl'] = (string)$this->backendUriBuilder->buildUriFromRoute('make_content_block_delete', [
                'name' => $contentBlock['name'],
            ]);
        }
        $this->moduleTemplate->assignMultiple([
            'contentBlocks' => $contentBlocks,
//            'basics' => $sampleData['basics'],
        ]);
        // return $this->contentBlocksUtility->getAvailableContentBlocks();
        $this->pageRenderer->loadJavaScriptModule('@typo3/make/content-blocks/content-blocks-gui-module.js');
        $this->pageRenderer->loadJavaScriptModule('@typo3/make/content-blocks/list.js');
        $this->pageRenderer->addInlineLanguageLabelFile('EXT:make/Resources/Private/Language/locallang.xlf');

        $buttonBar = $this->moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $addContentElementButton = GeneralUtility::makeInstance(GenericButton::class)
            ->setTag('a')
            ->setHref((string)$this->backendUriBuilder->buildUriFromRoute('make_content_block_new', [
                'name' => '',
                'mode' => 'new',
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

        return $this->moduleTemplate->renderResponse('ContentBlocksGui/List');
    }

    /**
     * @throws RouteNotFoundException
     */
    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);
        $this->handleAction($request);
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/Edit');
    }

    /**
     * @throws RouteNotFoundException
     */
    public function duplicateAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);
        $this->handleAction($request);
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/Duplicate');
    }

    /**
     * @throws RouteNotFoundException
     */
    public function deleteAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        if (empty($queryParams['name'])) {
            throw new RouteNotFoundException('Missing required content block data');
        }
        $this->contentBlocksUtility->deleteContentBlock($queryParams['name']);
        return new RedirectResponse(
            (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui'),
            303
        );
    }

    /**
     * @throws RouteNotFoundException
     */
    protected function handleAction(ServerRequestInterface $request): void
    {
        $this->pageRenderer->loadJavaScriptModule('@typo3/make/content-blocks/editor.js');
        $queryParams = $request->getQueryParams();
        if (empty($queryParams['name']) || empty($queryParams['mode'])) {
            throw new RouteNotFoundException('Missing required content block data');
        }
        $sampleJson = file_get_contents(Environment::getFrameworkBasePath() . '/make/Test/Fixtures/editCbAction.json');
        $contentBlocksData = json_decode($sampleJson, true);
        // @todo: FieldTypesList needed
        $contentBlockEditorData = GeneralUtility::implodeAttributes([
            'mode' => $queryParams['mode'],
            'data' => GeneralUtility::jsonEncodeForHtmlAttribute($contentBlocksData, false),
            'host-extensions' => GeneralUtility::jsonEncodeForHtmlAttribute($this->extensionUtility->findAvailableExtensions(), false),
            'groups' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getGroupsList(), false),
        ], true);
        $this->moduleTemplate->assignMultiple([
            'contentBlockEditorData' => $contentBlockEditorData,
        ]);
    }
}

