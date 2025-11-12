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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\Controller;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use FriendsOfTYPO3\ContentBlocksGui\Answer\DataAnswer;
use FriendsOfTYPO3\ContentBlocksGui\Utility\ContentBlocksUtility;
use FriendsOfTYPO3\ContentBlocksGui\Utility\ExtensionUtility;

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
        $sampleJson = file_get_contents(Environment::getFrameworkBasePath() . '/make/Test/Fixtures/listCbAction.json');
        $sampleData = json_decode($sampleJson, true);
        return new JsonResponse([
            'body' => [
                'contentBlocks' => $sampleData['contentBlocks'],
                'basics' => $sampleData['basics'],
            ],
        ]);
        // return $this->contentBlocksUtility->getAvailableContentBlocks()->getResponse();
    }

    public function getCbAction(ServerRequestInterface $request): ResponseInterface
    {
        $sampleJson = file_get_contents(Environment::getFrameworkBasePath() . '/make/Test/Fixtures/editCbAction.json');
        $sampleData = json_decode($sampleJson, true);
        return new JsonResponse([
            'body' => $sampleData,
        ]);
//        return $this->contentBlocksUtility->getContentBlockByName(
//            $request->getParsedBody()
//        )->getResponse();
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
        return $this->contentBlocksUtility->downloadContentBlock(json_decode($request->getBody()->getContents(), true));
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

    /**
     * AJAX endpoint for fetching content blocks by type with counts
     */
    public function listByTypeAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        $type = $queryParams['type'] ?? 'content-element';

        $allContentBlocks = $this->contentBlocksUtility->getAvailableContentBlocks();

        // Get counts for all types
        $counts = [
            'content-element' => isset($allContentBlocks['CONTENT_ELEMENT']) ? count($allContentBlocks['CONTENT_ELEMENT']) : 0,
            'page-type' => isset($allContentBlocks['PAGE_TYPE']) ? count($allContentBlocks['PAGE_TYPE']) : 0,
            'record-type' => isset($allContentBlocks['RECORD_TYPE']) ? count($allContentBlocks['RECORD_TYPE']) : 0,
            'basic' => isset($allContentBlocks['BASICS']) ? count($allContentBlocks['BASICS']) : 0,
        ];

        // Get items for requested type
        $items = match($type) {
            'content-element' => $allContentBlocks['CONTENT_ELEMENT'] ?? [],
            'page-type' => $allContentBlocks['PAGE_TYPE'] ?? [],
            'record-type' => $allContentBlocks['RECORD_TYPE'] ?? [],
            'basic' => $allContentBlocks['BASICS'] ?? [],
            default => []
        };

        // Convert associative array to indexed array for frontend
        $itemsList = array_values($items);

        return new JsonResponse([
            'type' => $type,
            'items' => $itemsList,
            'counts' => $counts,
            'total' => count($itemsList)
        ]);
    }

    /**
     * AJAX endpoint for saving content blocks
     */
    public function saveAction(ServerRequestInterface $request): ResponseInterface
    {
        $parsedBody = $request->getParsedBody();
        return $this->contentBlocksUtility->saveContentType(
            $parsedBody
        )->getResponse();
    }
}

