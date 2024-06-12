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
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;

#[AsController]
final class ContentBlocksGuiController
{
    protected ModuleTemplate $moduleTemplate;

    public function __construct(
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected readonly UriBuilder $backendUriBuilder,
        protected PageRenderer $pageRenderer
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
        }
        $this->moduleTemplate->assignMultiple([
            'contentBlocks' => $contentBlocks,
//            'basics' => $sampleData['basics'],
        ]);
        // return $this->contentBlocksUtility->getAvailableContentBlocks();
        $this->pageRenderer->loadJavaScriptModule('@typo3/make/content-blocks/content-blocks-gui-module.js');
        $this->pageRenderer->addInlineLanguageLabelFile('EXT:make/Resources/Private/Language/locallang.xlf');
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/List');
    }

    /**
     * @throws RouteNotFoundException
     */
    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->pageRenderer->loadJavaScriptModule('@typo3/make/content-blocks/editor.js');
        $queryParams = $request->getQueryParams();
        if (empty($queryParams['name']) || empty($queryParams['mode'])) {
            throw new RouteNotFoundException('Missing required content block data');
        }
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);

        $sampleJson = file_get_contents(Environment::getFrameworkBasePath() . '/make/Test/Fixtures/editCbAction.json');
        $contentBlocksData = json_decode($sampleJson, true);
        // @todo: FieldTypesList needed
        // @todo: HostExtensionList needed
        // @todo: GroupList needed
        $contentBlockEditorData = GeneralUtility::implodeAttributes([
            'mode' => 'edit',
            'data' => GeneralUtility::jsonEncodeForHtmlAttribute($contentBlocksData, false),
        ], true);
        $this->moduleTemplate->assignMultiple([
            'contentBlockEditorData' => $contentBlockEditorData,
        ]);
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/Edit');
    }
}

