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
use FriendsOfTYPO3\ContentBlocksGui\Domain\Model\Dto\ImportAnalysis;
use FriendsOfTYPO3\ContentBlocksGui\Service\BasicsService;
use FriendsOfTYPO3\ContentBlocksGui\Service\ContentBlockImportAnalyzer;
use FriendsOfTYPO3\ContentBlocksGui\Service\ContentBlockImportService;
use FriendsOfTYPO3\ContentBlocksGui\Utility\ContentBlocksUtility;
use FriendsOfTYPO3\ContentBlocksGui\Utility\ExtensionUtility;
use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Cache\CacheManager;

#[Controller]
final class AjaxController
{
    public function __construct(
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected PageRenderer $pageRenderer,
        protected ExtensionUtility $extensionUtility,
        protected ContentBlocksUtility $contentBlocksUtility,
        protected ContentBlockImportAnalyzer $importAnalyzer,
        protected ContentBlockImportService $importService,
        protected readonly BasicsService $basicsService,
        protected readonly CacheManager $cacheManager,
        protected readonly LoggerInterface $logger,
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

//    TODO: it seems that saveCbAction is not used anymore
//    it seems the ContentBlocksGuiController::deleteAction() is used instead
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

    public function downloadBasicAction(ServerRequestInterface $request): ResponseInterface
    {
        $body = json_decode($request->getBody()->getContents(), true);

        if (!isset($body['identifier'])) {
            return new JsonResponse(['error' => 'Missing identifier parameter'], 400);
        }

        try {
            return $this->contentBlocksUtility->downloadBasic($body['identifier']);
        } catch (\RuntimeException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 404);
        }
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

    /**
     * Validate RecordType duplication parameters
     * Used for real-time validation in the duplicate modal
     */
    public function validateRecordTypeDuplicationAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();

        $validation = $this->contentBlocksUtility->validateRecordTypeDuplication(
            $queryParams['sourceName'] ?? '',
            $queryParams['duplicationStrategy'] ?? '',
            $queryParams['typeName'] ?? null,
            $queryParams['tableName'] ?? null
        );

        return new JsonResponse($validation);
    }

    /**
     * Download multiple content blocks as a single ZIP
     */
    public function multiDownloadAction(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $parsedBody = $request->getParsedBody();
            $blocks = $parsedBody['blocks'] ?? [];

            if (empty($blocks)) {
                return new JsonResponse(['error' => 'No content blocks selected for download'], 400);
            }

            // Create multi-block ZIP
            $fileName = $this->contentBlocksUtility->createMultiBlockZip($blocks);

            // Read file content
            $fileContent = file_get_contents($fileName);
            $fileSize = filesize($fileName);

            // Clean up temporary file
            unlink($fileName);

            // Create response with file content
            $response = new \TYPO3\CMS\Core\Http\Response();
            $response = $response
                ->withHeader('Content-Type', 'application/zip')
                ->withHeader('Content-Length', (string)$fileSize)
                ->withHeader('Content-Disposition', 'attachment; filename="' . basename($fileName) . '"');

            $response->getBody()->write($fileContent);

            return $response;
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Upload and analyze ZIP file for content block import
     */
    public function uploadAndAnalyzeAction(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $uploadedFiles = $request->getUploadedFiles();
            $parsedBody = $request->getParsedBody();

            if (!isset($uploadedFiles['file'])) {
                return new JsonResponse(['error' => 'No file uploaded'], 400);
            }

            $uploadedFile = $uploadedFiles['file'];
            $targetExtension = $parsedBody['targetExtension'] ?? null;

            if (!$targetExtension) {
                return new JsonResponse(['error' => 'No target extension specified'], 400);
            }

            // Validate upload
            $this->validateUpload($uploadedFile);

            // Get temporary file path
            $tempPath = $uploadedFile->getStream()->getMetadata('uri');

            // Analyze ZIP
            $analysis = $this->importAnalyzer->analyzeZip($tempPath, $targetExtension);

            return new JsonResponse([
                'success' => true,
                'analysis' => $analysis->toArray()
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Execute import after user confirmation
     */
    public function executeImportAction(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $parsedBody = $request->getParsedBody();

            if (!isset($parsedBody['analysis']) || !isset($parsedBody['targetExtension'])) {
                return new JsonResponse(['error' => 'Missing required parameters'], 400);
            }

            $analysis = ImportAnalysis::fromArray($parsedBody['analysis']);
            $targetExtension = $parsedBody['targetExtension'];
            $conflictResolutions = $parsedBody['conflicts'] ?? [];

            // Execute import
            $result = $this->importService->importContentBlocks(
                $analysis,
                $targetExtension,
                $conflictResolutions
            );

            return new JsonResponse([
                'success' => true,
                'result' => $result->toArray()
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate uploaded file
     */
    private function validateUpload(\Psr\Http\Message\UploadedFileInterface $file): void
    {
        // File size (10MB max)
        if ($file->getSize() > 10 * 1024 * 1024) {
            throw new \RuntimeException('ZIP file too large (max 10MB)');
        }

        // MIME type
        if ($file->getClientMediaType() !== 'application/zip' && $file->getClientMediaType() !== 'application/x-zip-compressed') {
            throw new \RuntimeException('Only ZIP files are allowed');
        }

        // File extension
        if (!str_ends_with($file->getClientFilename(), '.zip')) {
            throw new \RuntimeException('File must have .zip extension');
        }

        // Check for upload errors
        if ($file->getError() !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('File upload failed with error code: ' . $file->getError());
        }
    }

}

