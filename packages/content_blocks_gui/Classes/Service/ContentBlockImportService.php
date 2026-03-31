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

namespace FriendsOfTYPO3\ContentBlocksGui\Service;

use FriendsOfTYPO3\ContentBlocksGui\Domain\Model\Dto\ContentBlockInfo;
use FriendsOfTYPO3\ContentBlocksGui\Domain\Model\Dto\ImportAnalysis;
use FriendsOfTYPO3\ContentBlocksGui\Domain\Model\Dto\ImportResult;
use FriendsOfTYPO3\ContentBlocksGui\Utility\DatabaseUtility;
use TYPO3\CMS\ContentBlocks\Basics\BasicsLoader;
use TYPO3\CMS\ContentBlocks\Loader\ContentBlockLoader;
use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;
use TYPO3\CMS\ContentBlocks\Service\PackageResolver;
use TYPO3\CMS\ContentBlocks\Utility\ContentBlockPathUtility;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Service for importing validated content blocks
 */
final class ContentBlockImportService
{
    public function __construct(
        protected readonly PackageResolver $packageResolver,
        protected readonly DatabaseUtility $databaseUtility,
        protected readonly CacheManager $cacheManager,
        protected readonly ContentBlockLoader $contentBlockLoader,
        protected readonly BasicsLoader $basicsLoader,
    ) {
    }

    /**
     * Import content blocks from analyzed ZIP
     *
     * @param array $conflictResolutions Map of block name => strategy ('skip' or 'overwrite')
     */
    public function importContentBlocks(
        ImportAnalysis $analysis,
        string $targetExtension,
        array $conflictResolutions
    ): ImportResult {
        $imported = [];
        $skipped = [];
        $errors = [];

        // Import each block
        foreach ($analysis->blocks as $block) {
            try {
                // Check conflict resolution (conflict is empty string if no conflict)
                if ($block->conflict !== '') {
                    $strategy = $conflictResolutions[$block->name] ?? 'skip';
                    if ($strategy === 'skip') {
                        $skipped[] = $block;
                        continue;
                    }
                    // Handle overwrite
                    $this->handleConflict($block, $strategy, $targetExtension);
                }

                // Import based on type
                if ($block->type === 'BASIC') {
                    $this->copyBasic($block, $targetExtension);
                } else {
                    $this->copyContentBlock($block, $targetExtension);
                }

                $imported[] = $block;
            } catch (\Exception $e) {
                $errors[] = ['block' => $block->name, 'error' => $e->getMessage()];
            }
        }

        // ALWAYS update database schema and flush caches after import
        if (!empty($imported)) {
            // 1. Update database schema (creates new RecordType tables if needed)
            $this->databaseUtility->updateDatabaseSchema();

            // 2. Flush system cache to ensure TCA is regenerated
            $this->cacheManager->flushCachesInGroup('system');

            // 3. Reload Content Blocks registries
            $this->contentBlockLoader->loadUncached();
            $this->basicsLoader->loadUncached();
        }

        // Clean up temporary directory
        GeneralUtility::rmdir($analysis->tempDir, true);

        return new ImportResult(
            imported: $imported,
            skipped: $skipped,
            errors: $errors
        );
    }

    /**
     * Copy content block with all subdirectories (templates/, language/, assets/)
     */
    private function copyContentBlock(ContentBlockInfo $block, string $targetExtension): void
    {
        $availablePackages = $this->packageResolver->getAvailablePackages();
        $extensionPath = $availablePackages[$targetExtension]->getPackagePath();
        $typeSubdir = $this->getTypeSubdirectory($block->type);
        $targetPath = $extensionPath . '/' . $typeSubdir . '/' . $block->directoryName;

        // Create target directory
        GeneralUtility::mkdir_deep($targetPath);

        // Copy all files preserving directory structure
        foreach ($block->files as $relativePath) {
            $sourcePath = $block->sourcePath . '/' . $relativePath;
            $destPath = $targetPath . '/' . $relativePath;

            // Create subdirectory if needed (e.g., templates/, language/)
            $destDir = dirname($destPath);
            if (!is_dir($destDir)) {
                GeneralUtility::mkdir_deep($destDir);
            }

            // Copy file
            copy($sourcePath, $destPath);
        }
    }

    /**
     * Copy Basic file to target extension
     */
    private function copyBasic(ContentBlockInfo $block, string $targetExtension): void
    {
        $availablePackages = $this->packageResolver->getAvailablePackages();
        $extensionPath = $availablePackages[$targetExtension]->getPackagePath();
        $targetBasicsPath = $extensionPath . '/' . ContentBlockPathUtility::getRelativeBasicsPath() . '/';

        GeneralUtility::mkdir_deep($targetBasicsPath);

        $targetFile = $targetBasicsPath . $block->fileName;
        copy($block->sourcePath, $targetFile);
    }

    /**
     * Handle conflict by overwriting existing content block
     */
    private function handleConflict(ContentBlockInfo $block, string $strategy, string $targetExtension): void
    {
        if ($strategy !== 'overwrite') {
            return;
        }

        $availablePackages = $this->packageResolver->getAvailablePackages();
        $extensionPath = $availablePackages[$targetExtension]->getPackagePath();

        if ($block->type === 'BASIC') {
            // Delete existing Basic file
            $targetFile = $extensionPath . '/' . ContentBlockPathUtility::getRelativeBasicsPath() . '/' . $block->fileName;
            if (file_exists($targetFile)) {
                unlink($targetFile);
            }
        } else {
            // Delete existing content block directory
            $typeSubdir = $this->getTypeSubdirectory($block->type);
            $targetPath = $extensionPath . '/' . $typeSubdir . '/' . $block->directoryName;
            if (is_dir($targetPath)) {
                GeneralUtility::rmdir($targetPath, true);
            }
        }
    }

    /**
     * Get type subdirectory name
     */
    private function getTypeSubdirectory(string $type): string
    {
        $contentType = match($type) {
            'CONTENT_ELEMENT' => ContentType::CONTENT_ELEMENT,
            'PAGE_TYPE' => ContentType::PAGE_TYPE,
            'RECORD_TYPE' => ContentType::RECORD_TYPE,
            'FILE_TYPE' => ContentType::FILE_TYPE,
            default => throw new \RuntimeException('Unknown content type: ' . $type),
        };
        return ContentBlockPathUtility::getRelativeContentTypePath($contentType);
    }
}
