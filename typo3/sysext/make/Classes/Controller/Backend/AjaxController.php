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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\Controller;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Make\Utility\ContentBlocksUtility;
use TYPO3\CMS\Make\Utility\ExtensionUtility;

#[Controller]
final class AjaxController
{
    public function __construct(
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected PageRenderer $pageRenderer,
        protected ExtensionUtility $extensionUtility,
        protected ContentBlocksUtility $contentBlocksUtility,
    ) {
    }

    public function listCbAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->getAvailableContentBlocks()->getResponse();
    }

    public function getCbAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->getContentBlockByName(
            $request->getParsedBody()
        )->getResponse();
    }

    public function deleteCbAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->deleteContentBlock(
            $request->getParsedBody()
        )->getResponse();
    }
    public function translateAction(ServerRequestInterface $request): ResponseInterface
    {
        $parsedBody = $request->getParsedBody();
        return new JsonResponse(['success' => true]);
    }
    public function saveContentTypeAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->saveContentType(
            $request->getParsedBody()
        )->getResponse();
    }
    public function downloadCbAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->downloadContentBlock($request->getParsedBody());
    }

    public function listExtAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->extensionUtility->getAvailableExtensions()->getResponse();
    }

    public function listIconsAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->getIconsList()->getResponse();
    }

    public function listGroupsAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->getGroupsList()->getResponse();
    }

    public function listBasicsAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->getBasicList()->getResponse();
    }

    public function getBasicAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->getBasicByName(
            $request->getParsedBody()
        )->getResponse();
    }

    public function getTranslationAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->getTranslationsByContentBlockName(
            $request->getParsedBody()
        )->getResponse();
    }

    public function saveTranslationAction(ServerRequestInterface $request): ResponseInterface
    {
        return $this->contentBlocksUtility->saveTranslationFile(
            $request->getParsedBody()
        )->getResponse();
    }
}

