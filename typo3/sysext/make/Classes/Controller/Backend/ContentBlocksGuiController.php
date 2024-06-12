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
use TYPO3\CMS\Backend\Attribute\Controller;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Page\PageRenderer;

#[Controller]
final class ContentBlocksGuiController
{
    protected ModuleTemplate $moduleTemplate;

    public function __construct(
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected PageRenderer $pageRenderer
    ) {
    }

    public function indexAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);

        $sampleJson = file_get_contents(Environment::getFrameworkBasePath() . '/make/Test/Fixtures/listCbAction.json');
        $sampleData = json_decode($sampleJson, true);
        $this->moduleTemplate->assignMultiple([
            'contentBlocks' => $sampleData['contentBlocks'],
            'basics' => $sampleData['basics'],
        ]);
        // return $this->contentBlocksUtility->getAvailableContentBlocks();
        $this->pageRenderer->loadJavaScriptModule('@typo3/make/content-blocks/content-blocks-gui-module.js');
        $this->pageRenderer->addInlineLanguageLabelFile('EXT:make/Resources/Private/Language/locallang.xlf');
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/List');
    }

    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);

        $sampleJson = file_get_contents(Environment::getFrameworkBasePath() . '/make/Test/Fixtures/editCbAction.json');
        $sampleData = json_decode($sampleJson, true);
        $this->moduleTemplate->assignMultiple([
            'contentBlockData' => $sampleData['contentBlock'],
            'basics' => $sampleData['basics'],
        ]);
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/Edit');
    }
}

