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

use TYPO3\CMS\Backend\Attribute\Controller;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;

#[Controller]
final class ContentBlocksGuiController extends ActionController
{
    protected ModuleTemplate $moduleTemplate;

    public function __construct(
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected PageRenderer $pageRenderer
    ) {
    }

    public function initializeAction(): void
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($this->request);

        $this->pageRenderer->addCssFile('EXT:content_blocks_gui/Resources/Public/dist/index.css');

        $this->pageRenderer->loadJavaScriptModule('@contentblocks/content-blocks-gui/index.js');
        $this->pageRenderer->loadJavaScriptModule('@contentblocks/content-blocks-gui-testfiles/ajax-request-test.js');
    }

    public function listAction(): ResponseInterface
    {
        return $this->moduleTemplate->renderResponse('ContentBlocksGui/List');
    }
}

