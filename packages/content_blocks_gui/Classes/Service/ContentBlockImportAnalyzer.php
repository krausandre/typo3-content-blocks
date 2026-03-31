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
use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;
use TYPO3\CMS\ContentBlocks\Service\PackageResolver;
use TYPO3\CMS\ContentBlocks\Utility\ContentBlockPathUtility;
use TYPO3\CMS\ContentBlocks\Validation\ContentBlockNameValidator;
use TYPO3\CMS\ContentBlocks\Validation\PageTypeNameValidator;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Analyzes uploaded ZIP files for content block imports
 */
final class ContentBlockImportAnalyzer
{
    private const TYPE_DIRECTORIES = [
        'ContentElements' => 'CONTENT_ELEMENT',
        'PageTypes' => 'PAGE_TYPE',
        'RecordTypes' => 'RECORD_TYPE',
        'FileTypes' => 'FILE_TYPE',
        'Basics' => 'BASIC',
    ];

    private const ALLOWED_EXTENSIONS = ['yaml', 'html', 'xlf', 'svg', 'png', 'jpg', 'jpeg', 'css', 'js', 'json'];
    private const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private const MAX_SVG_SIZE = 500 * 1024; // 500KB
    private const MAX_FILES = 100;

    public function __construct(
        protected readonly PackageResolver $packageResolver,
    ) {
    }

    /**
     * Analyze uploaded ZIP file
     *
     * @throws \RuntimeException
     */
    public function analyzeZip(string $zipPath, string $targetExtension): ImportAnalysis
    {
        // 1. Extract ZIP to temporary directory
        $tempDir = $this->extractZipToTemp($zipPath);

        try {
            // 2. Validate ZIP contents
            $this->validateZipContents($tempDir);

            // 3. Scan each type directory
            $blocks = [];
            foreach (self::TYPE_DIRECTORIES as $dirName => $type) {
                $typePath = $tempDir . '/' . $dirName;

                if (!is_dir($typePath)) {
                    continue; // This type not present in ZIP
                }

                if ($dirName === 'Basics') {
                    // Basics: Scan for .yaml files
                    $blocks = array_merge($blocks, $this->scanBasicsDirectory($typePath));
                } else {
                    // Content Blocks: Scan for subdirectories with config.yaml
                    $blocks = array_merge($blocks, $this->scanTypeDirectory($typePath, $type));
                }
            }

            if (empty($blocks)) {
                throw new \RuntimeException('No valid content blocks found in ZIP. Please ensure your ZIP contains type directories (ContentElements/, PageTypes/, RecordTypes/, or Basics/).');
            }

            // 4. Validate each block
            foreach ($blocks as $block) {
                $this->validateBlock($block);
            }

            // 5. Check for conflicts in target extension
            $this->checkConflicts($blocks, $targetExtension);

            return new ImportAnalysis(
                blocks: $blocks,
                valid: true,
                errors: [],
                tempDir: $tempDir
            );
        } catch (\Throwable $e) {
            // Clean up on error
            GeneralUtility::rmdir($tempDir, true);
            throw $e;
        }
    }

    /**
     * Extract ZIP to temporary directory
     */
    private function extractZipToTemp(string $zipPath): string
    {
        $tempDir = Environment::getVarPath() . '/transient/cb_import_' . uniqid();
        GeneralUtility::mkdir_deep($tempDir);

        $zip = new \ZipArchive();
        if ($zip->open($zipPath) !== true) {
            GeneralUtility::rmdir($tempDir, true);
            throw new \RuntimeException('Failed to open ZIP file');
        }

        $zip->extractTo($tempDir);
        $zip->close();

        return $tempDir;
    }

    /**
     * Validate ZIP contents for security and size limits
     */
    private function validateZipContents(string $extractPath): void
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($extractPath, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        $fileCount = 0;

        foreach ($iterator as $file) {
            if (!$file->isFile()) {
                continue;
            }

            $fileCount++;

            // Maximum files check
            if ($fileCount > self::MAX_FILES) {
                throw new \RuntimeException('ZIP contains too many files (max ' . self::MAX_FILES . ')');
            }

            // File extension check
            $ext = strtolower(pathinfo($file->getFilename(), PATHINFO_EXTENSION));
            if (!in_array($ext, self::ALLOWED_EXTENSIONS, true)) {
                throw new \RuntimeException("File type not allowed: {$ext} (in file: {$file->getFilename()})");
            }

            // File size checks
            $fileSize = $file->getSize();
            if ($ext === 'svg' && $fileSize > self::MAX_SVG_SIZE) {
                throw new \RuntimeException("SVG file too large: {$file->getFilename()} ({$fileSize} bytes, max 500KB)");
            }
            if ($fileSize > self::MAX_FILE_SIZE) {
                throw new \RuntimeException("File too large: {$file->getFilename()} ({$fileSize} bytes, max 2MB)");
            }

            // Path traversal protection
            $realPath = $file->getRealPath();
            if (!str_starts_with($realPath, realpath($extractPath))) {
                throw new \RuntimeException('Path traversal attempt detected');
            }
        }
    }

    /**
     * Scan a type directory for content blocks (ContentElements/, PageTypes/, etc.)
     *
     * @return ContentBlockInfo[]
     */
    private function scanTypeDirectory(string $typePath, string $expectedType): array
    {
        $blocks = [];
        $dirs = scandir($typePath);

        foreach ($dirs as $dirName) {
            if ($dirName === '.' || $dirName === '..') {
                continue;
            }

            $blockPath = $typePath . '/' . $dirName;
            if (!is_dir($blockPath)) {
                continue;
            }

            $configFile = $blockPath . '/' . ContentBlockPathUtility::getContentBlockDefinitionFileName();
            if (!file_exists($configFile)) {
                throw new \RuntimeException("Missing config.yaml in {$dirName}");
            }

            $yaml = Yaml::parseFile($configFile);

            // Verify type matches directory location
            if (isset($yaml['table'])) {
                $detectedType = ContentType::getByTable($yaml['table'])->name;
                if ($detectedType !== $expectedType) {
                    throw new \RuntimeException(
                        "Type mismatch: {$dirName} is in {$expectedType} directory but config.yaml indicates {$detectedType}"
                    );
                }
            }

            // Parse vendor from name (format: vendor/name)
            $fullName = $yaml['name'] ?? $dirName;
            $vendor = '';
            if (str_contains($fullName, '/')) {
                $parts = explode('/', $fullName, 2);
                $vendor = $parts[0];
            }

            // Recursively collect all files
            $files = $this->collectFilesRecursive($blockPath);

            $blocks[] = new ContentBlockInfo(
                type: $expectedType,
                name: $fullName,
                vendor: $vendor,
                table: $yaml['table'] ?? '',
                sourcePath: $blockPath,
                directoryName: $dirName,
                fileName: '',
                files: $files,
                yaml: $yaml
            );
        }

        return $blocks;
    }

    /**
     * Scan Basics directory for .yaml files
     *
     * @return ContentBlockInfo[]
     */
    private function scanBasicsDirectory(string $basicsPath): array
    {
        $blocks = [];
        $files = scandir($basicsPath);

        foreach ($files as $fileName) {
            if (!str_ends_with($fileName, '.yaml')) {
                continue;
            }

            $filePath = $basicsPath . '/' . $fileName;
            if (!is_file($filePath)) {
                continue;
            }

            $yaml = Yaml::parseFile($filePath);

            // Validate it's a Basic
            if (!$this->isBasic($yaml)) {
                throw new \RuntimeException("File {$fileName} is not a valid Basic");
            }

            $blocks[] = new ContentBlockInfo(
                type: 'BASIC',
                name: $yaml['identifier'],
                vendor: '',
                table: '',
                sourcePath: $filePath,
                directoryName: '',
                fileName: $fileName,
                files: [$fileName],
                yaml: $yaml
            );
        }

        return $blocks;
    }

    /**
     * Recursively collect all files relative to base path
     */
    private function collectFilesRecursive(string $basePath): array
    {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($basePath, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                // Store relative path from base (e.g., "templates/frontend.html")
                $relativePath = substr($file->getPathname(), strlen($basePath) + 1);
                $files[] = $relativePath;
            }
        }

        return $files;
    }

    /**
     * Check if YAML represents a Basic
     */
    private function isBasic(array $yaml): bool
    {
        $requiredKeys = ['identifier', 'fields'];
        $hasRequired = !array_diff($requiredKeys, array_keys($yaml));

        $forbiddenKeys = ['name', 'vendor', 'table', 'group'];
        $hasForbidden = !empty(array_intersect($forbiddenKeys, array_keys($yaml)));

        return $hasRequired && !$hasForbidden;
    }

    /**
     * Validate a content block
     */
    private function validateBlock(ContentBlockInfo $block): void
    {
        $yaml = $block->yaml;

        if ($block->type !== 'BASIC') {
            // Content Block validation
            if (empty($yaml['name'])) {
                throw new \RuntimeException('Content block missing name in config.yaml');
            }

            // Validate name format: vendor/name (both parts lowercase, alphanumeric, hyphens)
            $nameParts = explode('/', $yaml['name']);
            if (count($nameParts) !== 2
                || !ContentBlockNameValidator::isValid($nameParts[0])
                || !ContentBlockNameValidator::isValid($nameParts[1])
            ) {
                throw new \RuntimeException(
                    'Invalid content block name format: "' . $yaml['name'] . '". ' .
                    'Expected format: vendor/name (lowercase, alphanumeric, hyphens)'
                );
            }

            if ($block->type ==='PAGE_TYPE') {
                PageTypeNameValidator::validate($yaml["typeName"], $yaml['name']);
            }
        } else {
            // Basic validation
            if (empty($yaml['identifier'])) {
                throw new \RuntimeException('Basic missing identifier');
            }

            if (empty($yaml['fields'])) {
                throw new \RuntimeException('Basic missing fields');
            }
        }
    }

    /**
     * Check for conflicts with existing content blocks
     */
    private function checkConflicts(array $blocks, string $targetExtension): void
    {
        $availablePackages = $this->packageResolver->getAvailablePackages();
        if (!isset($availablePackages[$targetExtension])) {
            throw new \RuntimeException("Extension '{$targetExtension}' not found or not available for content blocks");
        }
        $extensionPath = $availablePackages[$targetExtension]->getPackagePath();

        // Track conflicts within the upload itself
        $uploadedDirectories = [];
        $uploadedBasicFiles = [];

        foreach ($blocks as $block) {
            if ($block->type === 'BASIC') {
                // Conflict Type 1: Basic filename already exists in target extension
                $targetBasicsPath = $extensionPath . '/' . ContentBlockPathUtility::getRelativeBasicsPath() . '/';
                $targetFilePath = $targetBasicsPath . $block->fileName;

                if (file_exists($targetFilePath)) {
                    $block->conflict = 'BASIC_FILE_EXISTS';
                }

                // Conflict Type 2: Duplicate Basic filename within this upload
                if (in_array($block->fileName, $uploadedBasicFiles, true)) {
                    throw new \RuntimeException(
                        "Duplicate Basic file in upload: {$block->fileName}"
                    );
                }
                $uploadedBasicFiles[] = $block->fileName;
            } else {
                // Conflict Type 1: Directory already exists in target extension
                $typeSubdir = $this->getTypeSubdirectory($block->type);
                $targetPath = $extensionPath . '/' . $typeSubdir . '/' . $block->directoryName;

                if (is_dir($targetPath)) {
                    $block->conflict = 'DIRECTORY_EXISTS';
                }

                // Conflict Type 2: Duplicate directory name within this upload
                $key = $typeSubdir . '/' . $block->directoryName;
                if (in_array($key, $uploadedDirectories, true)) {
                    throw new \RuntimeException(
                        "Duplicate content block directory in upload: {$block->directoryName} in {$typeSubdir}/"
                    );
                }
                $uploadedDirectories[] = $key;
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
