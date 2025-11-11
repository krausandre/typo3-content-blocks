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

namespace FriendsOfTYPO3\ContentBlocksGui\Controller\Backend;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Routing\Exception\RouteNotFoundException;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Http\RedirectResponse;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use FriendsOfTYPO3\ContentBlocksGui\Utility\ButtonBarUtility;
use FriendsOfTYPO3\ContentBlocksGui\Utility\ContentBlocksUtility;
use FriendsOfTYPO3\ContentBlocksGui\Utility\ExtensionUtility;

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
        protected IconFactory $iconFactory,
        protected ButtonBarUtility $buttonBarUtility
    ) {
    }

    /**
     * @throws RouteNotFoundException
     */
    public function indexAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);
        $contentBlocks = $this->contentBlocksUtility->getAvailableContentBlocks();
        $this->moduleTemplate->assignMultiple([
            'contentBlocks' => $contentBlocks,
//            'basics' => $sampleData['basics'],
        ]);

        // Load the list component
        $this->pageRenderer->loadJavaScriptModule('@friendsoftypo3/content-blocks-gui/list.js');
        $this->pageRenderer->addInlineLanguageLabelFile('EXT:content_blocks_gui/Resources/Private/Language/locallang.xlf');

        $this->buttonBarUtility->addIndexButtonBar($this->moduleTemplate);

        return $this->moduleTemplate->renderResponse('ContentBlocksGui/List');
    }

    /**
     * @throws RouteNotFoundException
     */
    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);
        $this->buttonBarUtility->addEditButtonBar($this->moduleTemplate);
        $this->handleAction($request);
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/Edit');
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
    public function duplicateAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();

        // Validate required parameters
        if (empty($queryParams['sourceName']) || empty($queryParams['targetExtension'])
            || empty($queryParams['targetVendor']) || empty($queryParams['targetName'])) {
            throw new RouteNotFoundException('Missing required parameters for duplication');
        }

        $sourceName = $queryParams['sourceName'];
        $targetExtension = $queryParams['targetExtension'];
        $targetVendor = $queryParams['targetVendor'];
        $targetName = $queryParams['targetName'];

        try {
            // Duplicate the content block
            $this->contentBlocksUtility->duplicateContentBlock(
                $sourceName,
                $targetExtension,
                $targetVendor,
                $targetName
            );

            // Redirect back to list view
            return new RedirectResponse(
                (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui'),
                303
            );
        } catch (\Exception $e) {
            throw new RouteNotFoundException('Failed to duplicate content block: ' . $e->getMessage());
        }
    }

    /**
     * @throws RouteNotFoundException
     */
    protected function handleAction(ServerRequestInterface $request): void
    {
        $this->pageRenderer->loadJavaScriptModule('@friendsoftypo3/content-blocks-gui/editor.js');
        $queryParams = $request->getQueryParams();
        if (!isset($queryParams['name'])) {
            throw new RouteNotFoundException('Missing required content block name');
        }
        $mode = 'new';
        // TODO: /typo3/ is hardcoded, needs to be dynamic since this is configurable in TYPO3 v13
        if($request->getUri()->getPath() === '/typo3/content-block-gui/content-block/modify/new') {
            $skeletonJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Configuration/ContentBlocks/Skeleton.json');
            $contentBlocksData = json_decode($skeletonJson, true);
        } elseif ($request->getUri()->getPath() === '/typo3/content-block-gui/content-block/modify/edit') {
            $mode = 'edit';
//            $sampleJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Test/Fixtures/editCbAction.json');
//            $contentBlocksData = json_decode($sampleJson, true);
            $contentBlocksData = $this->contentBlocksUtility->getContentBlockByName($queryParams);
        } elseif ($request->getUri()->getPath() === '/typo3/content-block-gui/content-block/modify/duplicate') {
            $mode = 'duplicate';
            $sampleJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Test/Fixtures/editCbAction.json');
            $contentBlocksData = json_decode($sampleJson, true);
        } else {
            throw new RouteNotFoundException('Invalid request');
        }
        $contentBlockEditorData = GeneralUtility::implodeAttributes([
            'mode' => $mode,
            'data' => GeneralUtility::jsonEncodeForHtmlAttribute($contentBlocksData, false),
            'extensions' => GeneralUtility::jsonEncodeForHtmlAttribute($this->extensionUtility->findAvailableExtensions(), false),
            'groups' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getGroupsList(), false),
            'fieldconfig' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getFieldTypes(), false),
        ], true);

        $this->moduleTemplate->assignMultiple([
            'contentBlockEditorData' => $contentBlockEditorData,
        ]);
    }

    /**
     * @throws RouteNotFoundException
     */
    public function editBasicAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);
        $this->buttonBarUtility->addEditButtonBar($this->moduleTemplate);
        $this->handleBasicAction($request);
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/EditBasic');
    }

    /**
     * @throws RouteNotFoundException
     */
    public function deleteBasicAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);
        $this->buttonBarUtility->addEditButtonBar($this->moduleTemplate);
        $this->handleAction($request);
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/Edit');
    }

    /**
     * @throws RouteNotFoundException
     */
    public function duplicateBasicAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);
        $this->buttonBarUtility->addEditButtonBar($this->moduleTemplate);
        $this->handleAction($request);
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/Edit');
    }


    /**
     * @throws RouteNotFoundException
     */
    protected function handleBasicAction(ServerRequestInterface $request): void
    {
        $this->pageRenderer->loadJavaScriptModule('@friendsoftypo3/content-blocks-gui/editor.js');
        $queryParams = $request->getQueryParams();
        if (!isset($queryParams['identifier'])) {
            throw new RouteNotFoundException('Missing required basic identifier #1762887757');
        }
        $mode = 'new';
        // TODO: /typo3/ is hardcoded, needs to be dynamic since this is configurable in TYPO3 v13
        if($request->getUri()->getPath() === '/typo3/content-block-gui/basic/modify/new') {
            $skeletonJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Configuration/ContentBlocks/Skeleton.json');
            $contentBlocksData = json_decode($skeletonJson, true);
        } elseif ($request->getUri()->getPath() === '/typo3/content-block-gui/content-block/modify/edit') {
            $mode = 'edit';
//            $sampleJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Test/Fixtures/editCbAction.json');
//            $contentBlocksData = json_decode($sampleJson, true);
            $contentBlocksData = $this->contentBlocksUtility->getContentBlockByName($queryParams);
        } elseif ($request->getUri()->getPath() === '/typo3/content-block-gui/content-block/modify/duplicate') {
            $mode = 'duplicate';
            $sampleJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Test/Fixtures/editCbAction.json');
            $contentBlocksData = json_decode($sampleJson, true);
        } else {
            throw new RouteNotFoundException('Invalid request');
        }
        $contentBlockEditorData = GeneralUtility::implodeAttributes([
            'mode' => $mode,
            'data' => GeneralUtility::jsonEncodeForHtmlAttribute($contentBlocksData, false),
            'extensions' => GeneralUtility::jsonEncodeForHtmlAttribute($this->extensionUtility->findAvailableExtensions(), false),
            'groups' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getGroupsList(), false),
            'fieldconfig' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getFieldTypes(), false),
        ], true);

        $this->moduleTemplate->assignMultiple([
            'contentBlockEditorData' => $contentBlockEditorData,
        ]);
    }
}

