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
use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Routing\Exception\RouteNotFoundException;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Http\RedirectResponse;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageService;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Routing\BackendEntryPointResolver;
use TYPO3\CMS\Core\Type\ContextualFeedbackSeverity;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use FriendsOfTYPO3\ContentBlocksGui\Service\FieldMetadataService;
use FriendsOfTYPO3\ContentBlocksGui\Service\BasicsService;
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
        protected ButtonBarUtility $buttonBarUtility,
        protected readonly FlashMessageService $flashMessageService,
        protected readonly LoggerInterface $logger,
        protected readonly BackendEntryPointResolver $backendEntryPointResolver,
        protected readonly FieldMetadataService $fieldMetadataService,
        protected readonly BasicsService $basicsService,
    ) {
    }

    /**
     * @throws RouteNotFoundException
     */
    public function indexAction(ServerRequestInterface $request): ResponseInterface
    {
        $this->moduleTemplate = $this->moduleTemplateFactory->create($request);
        $contentBlocks = $this->contentBlocksUtility->getAvailableContentBlocks();
        $availableExtensions = $this->extensionUtility->findAvailableExtensions();

        $this->moduleTemplate->assignMultiple([
            'contentBlocks' => $contentBlocks,
            'availableExtensions' => GeneralUtility::jsonEncodeForHtmlAttribute($availableExtensions, false),
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

        // Preserve the active tab for better UX
        $redirectParams = [];
        if (!empty($queryParams['returnTab'])) {
            $redirectParams['type'] = $queryParams['returnTab'];
        }

        return new RedirectResponse(
            (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui', $redirectParams),
            303
        );
    }

    /**
     * @throws RouteNotFoundException
     */
    public function deleteBasicAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        if (empty($queryParams['identifier'])) {
            throw new RouteNotFoundException('Missing required basic identifier');
        }

        try {
            $this->contentBlocksUtility->deleteBasic($queryParams['identifier']);

            // Add success message
            $flashMessage = GeneralUtility::makeInstance(
                FlashMessage::class,
                sprintf('Basic "%s" has been successfully deleted.', $queryParams['identifier']),
                'Basic Deleted',
                ContextualFeedbackSeverity::OK,
                true
            );
            $this->flashMessageService->getMessageQueueByIdentifier()->enqueue($flashMessage);
        } catch (\Exception $e) {
            // Show error message
            $flashMessage = GeneralUtility::makeInstance(
                FlashMessage::class,
                sprintf('Failed to delete basic: %s', $e->getMessage()),
                'Deletion Failed',
                ContextualFeedbackSeverity::ERROR,
                true
            );
            $this->flashMessageService->getMessageQueueByIdentifier()->enqueue($flashMessage);

            $this->logger->error('Failed to delete basic', [
                'identifier' => $queryParams['identifier'],
                'error' => $e->getMessage(),
            ]);
        }

        // Preserve the active tab for better UX
        $redirectParams = [];
        if (!empty($queryParams['returnTab'])) {
            $redirectParams['type'] = $queryParams['returnTab'];
        }

        return new RedirectResponse(
            (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui', $redirectParams),
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

        // Optional RecordType duplication parameters
        $duplicationStrategy = $queryParams['duplicationStrategy'] ?? 'auto';
        $customTypeName = $queryParams['customTypeName'] ?? null;
        $customTableName = $queryParams['customTableName'] ?? null;

        try {
            // Duplicate the content block
            $this->contentBlocksUtility->duplicateContentBlock(
                $sourceName,
                $targetExtension,
                $targetVendor,
                $targetName,
                $duplicationStrategy,
                $customTypeName,
                $customTableName
            );

            // Add success message
            $flashMessage = GeneralUtility::makeInstance(
                FlashMessage::class,
                sprintf(
                    'Content block "%s/%s" has been successfully duplicated to "%s/%s".',
                    explode('/', $sourceName)[0],
                    explode('/', $sourceName)[1],
                    $targetVendor,
                    $targetName
                ),
                'Content Block Duplicated',
                ContextualFeedbackSeverity::OK,
                true
            );
            $this->flashMessageService->getMessageQueueByIdentifier()->enqueue($flashMessage);

            // Preserve the active tab for better UX
            $redirectParams = [];
            if (!empty($queryParams['returnTab'])) {
                $redirectParams['type'] = $queryParams['returnTab'];
            }

            // Redirect back to list view
            return new RedirectResponse(
                (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui', $redirectParams),
                303
            );
        } catch (\RuntimeException $e) {
            // Show user-friendly error message
            $flashMessage = GeneralUtility::makeInstance(
                FlashMessage::class,
                $e->getMessage(),
                'Duplication Failed',
                ContextualFeedbackSeverity::ERROR,
                true
            );
            $this->flashMessageService->getMessageQueueByIdentifier()->enqueue($flashMessage);

            // Preserve the active tab for better UX
            $redirectParams = [];
            if (!empty($queryParams['returnTab'])) {
                $redirectParams['type'] = $queryParams['returnTab'];
            }

            // Redirect back to list view
            return new RedirectResponse(
                (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui', $redirectParams),
                303
            );
        } catch (\Exception $e) {
            // Unexpected error - show generic message and log details
            $this->logger->error('Unexpected error during content block duplication', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $flashMessage = GeneralUtility::makeInstance(
                FlashMessage::class,
                'An unexpected error occurred during duplication. Please check the logs for details.',
                'Duplication Failed',
                ContextualFeedbackSeverity::ERROR,
                true
            );
            $this->flashMessageService->getMessageQueueByIdentifier()->enqueue($flashMessage);

            // Preserve the active tab for better UX
            $redirectParams = [];
            if (!empty($queryParams['returnTab'])) {
                $redirectParams['type'] = $queryParams['returnTab'];
            }

            // Redirect back to list view
            return new RedirectResponse(
                (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui', $redirectParams),
                303
            );
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
        $entryPoint = $this->backendEntryPointResolver->getPathFromRequest($request);
        if($request->getUri()->getPath() === $entryPoint . 'content-block-gui/content-block/modify/new') {
            $skeletonJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Configuration/ContentBlocks/Skeleton.json');
            $contentBlocksData = json_decode($skeletonJson, true);
        } elseif ($request->getUri()->getPath() === $entryPoint . 'content-block-gui/content-block/modify/edit') {
            $mode = 'edit';
//            $sampleJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Test/Fixtures/editCbAction.json');
//            $contentBlocksData = json_decode($sampleJson, true);
            $contentBlocksData = $this->contentBlocksUtility->getContentBlockByName($queryParams);
        } elseif ($request->getUri()->getPath() === $entryPoint . 'content-block-gui/content-block/modify/duplicate') {
            $mode = 'duplicate';
            $sampleJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Test/Fixtures/editCbAction.json');
            $contentBlocksData = json_decode($sampleJson, true);
        } else {
            throw new RouteNotFoundException('Invalid request');
        }
        // Get table for field metadata
        $table = $contentBlocksData['yaml']['table'] ?? 'tt_content';
        $fieldMetadata = $this->fieldMetadataService->getFieldMetadata($table);

        $contentBlockEditorData = GeneralUtility::implodeAttributes([
            'mode' => $mode,
            'data' => GeneralUtility::jsonEncodeForHtmlAttribute($contentBlocksData, false),
            'extensions' => GeneralUtility::jsonEncodeForHtmlAttribute($this->extensionUtility->findAvailableExtensions(), false),
            'groups' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getGroupsList(), false),
            'fieldconfig' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getFieldTypes(), false),
            'fieldmetadata' => GeneralUtility::jsonEncodeForHtmlAttribute($fieldMetadata, false),
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
    public function duplicateBasicAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();

        // Validate required parameters
        if (empty($queryParams['sourceIdentifier']) || empty($queryParams['targetExtension'])
            || empty($queryParams['targetIdentifier'])) {
            throw new RouteNotFoundException('Missing required parameters for basic duplication');
        }

        $sourceIdentifier = $queryParams['sourceIdentifier'];
        $targetExtension = $queryParams['targetExtension'];
        $targetIdentifier = $queryParams['targetIdentifier'];

        try {
            // Duplicate the basic
            $this->contentBlocksUtility->duplicateBasic(
                $sourceIdentifier,
                $targetExtension,
                $targetIdentifier
            );

            // Add success message
            $flashMessage = GeneralUtility::makeInstance(
                FlashMessage::class,
                sprintf(
                    'Basic "%s" has been successfully duplicated to "%s".',
                    $sourceIdentifier,
                    $targetIdentifier
                ),
                'Basic Duplicated',
                ContextualFeedbackSeverity::OK,
                true
            );
            $this->flashMessageService->getMessageQueueByIdentifier()->enqueue($flashMessage);

            // Preserve the active tab for better UX
            $redirectParams = [];
            if (!empty($queryParams['returnTab'])) {
                $redirectParams['type'] = $queryParams['returnTab'];
            }

            // Redirect back to list view
            return new RedirectResponse(
                (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui', $redirectParams),
                303
            );
        } catch (\RuntimeException $e) {
            // Show user-friendly error message
            $flashMessage = GeneralUtility::makeInstance(
                FlashMessage::class,
                $e->getMessage(),
                'Basic Duplication Failed',
                ContextualFeedbackSeverity::ERROR,
                true
            );
            $this->flashMessageService->getMessageQueueByIdentifier()->enqueue($flashMessage);

            // Preserve the active tab for better UX
            $redirectParams = [];
            if (!empty($queryParams['returnTab'])) {
                $redirectParams['type'] = $queryParams['returnTab'];
            }

            // Redirect back to list view
            return new RedirectResponse(
                (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui', $redirectParams),
                303
            );
        } catch (\Exception $e) {
            // Unexpected error - show generic message and log details
            $this->logger->error('Unexpected error during basic duplication', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $flashMessage = GeneralUtility::makeInstance(
                FlashMessage::class,
                'An unexpected error occurred during duplication. Please check the logs for details.',
                'Basic Duplication Failed',
                ContextualFeedbackSeverity::ERROR,
                true
            );
            $this->flashMessageService->getMessageQueueByIdentifier()->enqueue($flashMessage);

            // Preserve the active tab for better UX
            $redirectParams = [];
            if (!empty($queryParams['returnTab'])) {
                $redirectParams['type'] = $queryParams['returnTab'];
            }

            // Redirect back to list view
            return new RedirectResponse(
                (string)$this->backendUriBuilder->buildUriFromRoute('web_ContentBlocksGui', $redirectParams),
                303
            );
        }
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
        $entryPoint = $this->backendEntryPointResolver->getPathFromRequest($request);
        if($request->getUri()->getPath() === $entryPoint . 'content-block-gui/basic/modify/new') {
            $skeletonJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Configuration/ContentBlocks/Skeleton.json');
            $contentBlocksData = json_decode($skeletonJson, true);
        } elseif ($request->getUri()->getPath() === $entryPoint . 'content-block-gui/content-block/modify/edit') {
            $mode = 'edit';
//            $sampleJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Test/Fixtures/editCbAction.json');
//            $contentBlocksData = json_decode($sampleJson, true);
            $contentBlocksData = $this->contentBlocksUtility->getContentBlockByName($queryParams);
        } elseif ($request->getUri()->getPath() === $entryPoint . 'content-block-gui/content-block/modify/duplicate') {
            $mode = 'duplicate';
            $sampleJson = file_get_contents(Environment::getProjectPath() . '/packages/content_blocks_gui/Test/Fixtures/editCbAction.json');
            $contentBlocksData = json_decode($sampleJson, true);
        } else {
            throw new RouteNotFoundException('Invalid request');
        }
        // Get table for field metadata
        $table = $contentBlocksData['yaml']['table'] ?? 'tt_content';
        $fieldMetadata = $this->fieldMetadataService->getFieldMetadata($table);

        $contentBlockEditorData = GeneralUtility::implodeAttributes([
            'mode' => $mode,
            'data' => GeneralUtility::jsonEncodeForHtmlAttribute($contentBlocksData, false),
            'extensions' => GeneralUtility::jsonEncodeForHtmlAttribute($this->extensionUtility->findAvailableExtensions(), false),
            'groups' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getGroupsList(), false),
            'fieldconfig' => GeneralUtility::jsonEncodeForHtmlAttribute($this->contentBlocksUtility->getFieldTypes(), false),
            'fieldmetadata' => GeneralUtility::jsonEncodeForHtmlAttribute($fieldMetadata, false),
        ], true);

        $this->moduleTemplate->assignMultiple([
            'contentBlockEditorData' => $contentBlockEditorData,
        ]);
    }

    /**
     * API endpoint: List all available Basics
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface JSON response with list of Basics
     */
    public function listBasicsApiAction(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $basics = $this->basicsService->listBasics();
            return new JsonResponse([
                'success' => true,
                'data' => $basics,
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to list basics', [
                'error' => $e->getMessage(),
            ]);
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API endpoint: Load a specific Basic
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface JSON response with Basic data
     */
    public function loadBasicApiAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        $identifier = $queryParams['identifier'] ?? '';

        if (empty($identifier)) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Missing identifier parameter',
            ], 400);
        }

        try {
            $basic = $this->basicsService->loadBasic($identifier);
            return new JsonResponse([
                'success' => true,
                'data' => $basic,
            ]);
        } catch (\RuntimeException $e) {
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            $this->logger->error('Failed to load basic', [
                'identifier' => $identifier,
                'error' => $e->getMessage(),
            ]);
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API endpoint: Save a Basic
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface JSON response
     */
    public function saveBasicApiAction(ServerRequestInterface $request): ResponseInterface
    {
        $body = $request->getParsedBody();

        $extension = $body['extension'] ?? '';
        $vendor = $body['vendor'] ?? '';
        $name = $body['name'] ?? '';
        $fields = $body['fields'] ?? [];

        if (empty($extension) || empty($vendor) || empty($name)) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Missing required parameters: extension, vendor, or name',
            ], 400);
        }

        try {
            $this->basicsService->saveBasic($extension, $vendor, $name, $fields);
            return new JsonResponse([
                'success' => true,
                'message' => sprintf('Basic "%s/%s" saved successfully', $vendor, $name),
            ]);
        } catch (\RuntimeException $e) {
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            $this->logger->error('Failed to save basic', [
                'extension' => $extension,
                'vendor' => $vendor,
                'name' => $name,
                'error' => $e->getMessage(),
            ]);
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API endpoint: Validate a Basic (primarily for loop detection)
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface JSON response with validation result
     */
    public function validateBasicApiAction(ServerRequestInterface $request): ResponseInterface
    {
        $body = $request->getParsedBody();

        $identifier = $body['identifier'] ?? '';
        $fields = $body['fields'] ?? [];

        if (empty($identifier)) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Missing identifier parameter',
            ], 400);
        }

        try {
            $result = $this->basicsService->validateBasic($identifier, $fields);
            return new JsonResponse([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to validate basic', [
                'identifier' => $identifier,
                'error' => $e->getMessage(),
            ]);
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API endpoint: Get Content Blocks that use a specific Basic
     *
     * @param ServerRequestInterface $request
     * @return ResponseInterface JSON response with list of Content Blocks
     */
    public function getBasicUsageApiAction(ServerRequestInterface $request): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        $identifier = $queryParams['identifier'] ?? '';

        if (empty($identifier)) {
            return new JsonResponse([
                'success' => false,
                'error' => 'Missing identifier parameter',
            ], 400);
        }

        try {
            $usedBy = $this->basicsService->getUsedBy($identifier);
            return new JsonResponse([
                'success' => true,
                'data' => [
                    'identifier' => $identifier,
                    'usedBy' => $usedBy,
                    'usageCount' => count($usedBy),
                ],
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to get basic usage', [
                'identifier' => $identifier,
                'error' => $e->getMessage(),
            ]);
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

