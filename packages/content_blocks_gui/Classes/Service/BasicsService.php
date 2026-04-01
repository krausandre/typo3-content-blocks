<?php

declare(strict_types=1);

/**
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

use FriendsOfTYPO3\ContentBlocksGui\Utility\ContentBlocksUtility;
use Symfony\Component\Yaml\Yaml;
use TYPO3\CMS\ContentBlocks\Basics\BasicsLoader;
use TYPO3\CMS\ContentBlocks\Basics\BasicsRegistry;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Service to manage Basics (field mixins/partials)
 *
 * Basics are simple field collections that can be reused across Content Blocks.
 * They have only 2 root properties: identifier (Vendor/Name) and fields array.
 */
final class BasicsService
{
    use FieldCleanupTrait;

    public function __construct(
        protected readonly PackageManager $packageManager,
        protected BasicsRegistry $basicsRegistry,
        protected readonly BasicsLoader $basicsLoader,
    ) {}

    /**
     * List all available Basics from all extensions
     *
     * @return array<int, array{identifier: string, vendor: string, name: string, fieldCount: int, extension: string}>
     */
    public function listBasics(): array
    {
        $registry = $this->basicsLoader->loadUncached();
        $basics = [];

        foreach ($registry->getAllBasics() as $loadedBasic) {
            $identifier = $loadedBasic->getIdentifier();
            $parts = explode('/', $identifier);
            if (count($parts) !== 2) {
                continue;
            }

            $basics[] = [
                'identifier' => $identifier,
                'vendor' => $parts[0],
                'name' => $parts[1],
                'fieldCount' => count($loadedBasic->getFields()),
                'extension' => $loadedBasic->getHostExtension(),
            ];
        }

        usort($basics, fn($a, $b) => strcmp($a['identifier'], $b['identifier']));

        return $basics;
    }

    /**
     * Load a specific Basic by identifier
     *
     * @param string $identifier Format: Vendor/Name
     * @return array{identifier: string, fields: array, hostExtension: string}
     * @throws \RuntimeException if Basic not found
     */
    public function loadBasic(string $identifier): array
    {
        $registry = $this->basicsLoader->loadUncached();
        if (!$registry->hasBasic($identifier)) {
            throw new \RuntimeException(
                sprintf('Basic "%s" not found', $identifier),
                1734000001,
            );
        }

        return $registry->getBasic($identifier)->toArray();
    }

    /**
     * Load a Basic for the editor with all necessary metadata
     *
     * Uses Content Blocks' internal BasicsRegistry API to load Basic data
     * and prepares it in the format needed by the editor component.
     *
     * @param string $identifier Format: Vendor/Name
     * @return array{identifier: string, fields: array, vendor: string, name: string, hostExtension: string}
     * @throws \RuntimeException if Basic not found
     */
    public function loadBasicForEditor(string $identifier): array
    {
        // Load Basics to ensure registry is populated
        $this->basicsRegistry = $this->basicsLoader->loadUncached();

        // Check if basic exists
        if (!$this->basicsRegistry->hasBasic($identifier)) {
            throw new \RuntimeException(
                sprintf('Basic "%s" not found', $identifier),
                1734100001,
            );
        }

        // Get Basic from registry
        $loadedBasic = $this->basicsRegistry->getBasic($identifier);

        // Parse identifier into vendor and name
        [$vendor, $name] = $this->parseIdentifier($identifier);

        return [
            'identifier' => $loadedBasic->getIdentifier(),
            'fields' => $loadedBasic->getFields(),
            'vendor' => $vendor,
            'name' => $name,
            'hostExtension' => $loadedBasic->getHostExtension(),
        ];
    }

    /**
     * Save a Basic for the GUI (handles both create and update)
     *
     * @param string $mode 'new' or 'edit'
     * @param string $extension Extension key where Basic should be stored
     * @param string $identifier Full identifier (Vendor/Name)
     * @param array $fields Array of field definitions
     * @return array{success: bool, message: string}
     */
    public function saveBasicFromGui(string $mode, string $extension, string $identifier, array $fields): array
    {
        try {
            [$vendor, $name] = $this->parseIdentifier($identifier);

            // Reload registry to check current state
            $this->basicsRegistry = $this->basicsLoader->loadUncached();

            // For create mode: check for collisions
            if ($mode === 'new') {
                // Check if Basic already exists in registry
                if ($this->basicsRegistry->hasBasic($identifier)) {
                    return [
                        'success' => false,
                        'message' => sprintf('Basic "%s" already exists. Please use a different identifier.', $identifier),
                    ];
                }

                // Check if file exists
                $basicsPath = $this->getBasicPathForCreate($extension, $identifier);
                if (file_exists($basicsPath)) {
                    return [
                        'success' => false,
                        'message' => sprintf('Basic file already exists at "%s". Please use a different identifier.', $basicsPath),
                    ];
                }

                // Save to new location
                $this->writeBasicYaml($basicsPath, $identifier, $fields);
            } else {
                // Update mode: find existing location or create new
                $existingPath = $this->findBasicPath($identifier);

                if ($existingPath === null) {
                    // Basic was deleted externally - create new one
                    $existingPath = $this->getBasicPathForCreate($extension, $identifier);
                    $this->writeBasicYaml($existingPath, $identifier, $fields);

                    return [
                        'success' => true,
                        'message' => sprintf(
                            'Warning: Basic "%s" was not found and has been recreated. Please verify this is intended.',
                            $identifier,
                        ),
                    ];
                }

                // Update existing Basic in same location
                $this->writeBasicYaml($existingPath, $identifier, $fields);
            }

            return [
                'success' => true,
                'message' => sprintf('Basic "%s" saved successfully.', $identifier),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => sprintf('Failed to save Basic: %s', $e->getMessage()),
            ];
        }
    }

    /**
     * Get path for creating a new Basic
     *
     * @param string $extension Extension key
     * @param string $identifier Full identifier (Vendor/Name)
     * @return string Absolute file path
     */
    protected function getBasicPathForCreate(string $extension, string $identifier): string
    {
        $package = $this->packageManager->getPackage($extension);
        $basicsDir = $package->getPackagePath() . 'ContentBlocks/Basics';

        // Ensure directory exists
        if (!is_dir($basicsDir)) {
            GeneralUtility::mkdir_deep($basicsDir);
        }

        // Use identifier as filename (e.g., "Vendor-Name.yaml")
        $filename = str_replace('/', '-', $identifier) . '.yaml';
        return $basicsDir . '/' . $filename;
    }

    /**
     * Find existing Basic file path by scanning recursively for the matching identifier.
     *
     * Basics can live in any subdirectory under ContentBlocks/Basics/,
     * and the filename does not need to match the identifier.
     *
     * @param string $identifier Full identifier (Vendor/Name)
     * @return string|null Absolute file path or null if not found
     */
    protected function findBasicPath(string $identifier): ?string
    {
        if (!$this->basicsRegistry->hasBasic($identifier)) {
            return null;
        }

        $loadedBasic = $this->basicsRegistry->getBasic($identifier);
        $extension = $loadedBasic->getHostExtension();
        $package = $this->packageManager->getPackage($extension);
        $basicsDir = $package->getPackagePath() . 'ContentBlocks/Basics';

        return ContentBlocksUtility::findBasicFilePath($basicsDir, $identifier);
    }

    /**
     * Write Basic YAML file
     *
     * @param string $filePath Absolute file path
     * @param string $identifier Full identifier (Vendor/Name)
     * @param array $fields Array of field definitions
     * @return void
     * @throws \RuntimeException if write fails
     */
    protected function writeBasicYaml(string $filePath, string $identifier, array $fields): void
    {
        // Clean UI-only properties from fields before saving
        $cleanedFields = $this->cleanFieldsForSave($fields);

        // Prepare YAML content
        $basicData = [
            'identifier' => $identifier,
            'fields' => $cleanedFields,
        ];

        $yamlContent = Yaml::dump($basicData, 10, 2);

        // Write file
        $result = GeneralUtility::writeFile($filePath, $yamlContent);
        if ($result === false) {
            throw new \RuntimeException(
                sprintf('Failed to write Basic YAML file to "%s"', $filePath),
                1734100002,
            );
        }
    }

    /**
     * Save a Basic to disk (legacy method - kept for compatibility)
     *
     * @param string $extension Extension key where Basic should be stored
     * @param string $vendor Vendor part of identifier
     * @param string $name Name part of identifier
     * @param array $fields Array of field definitions
     * @return void
     * @throws \RuntimeException if validation fails
     * @deprecated Use saveBasicFromGui() instead
     */
    public function saveBasic(string $extension, string $vendor, string $name, array $fields): void
    {
        $identifier = $vendor . '/' . $name;

        // Validate circular references
        $validationResult = $this->validateBasic($identifier, $fields);
        if (!$validationResult['valid']) {
            throw new \RuntimeException(
                $validationResult['error'] ?? 'Validation failed',
                1734000005,
            );
        }

        // Get extension path
        $package = $this->packageManager->getPackage($extension);
        $basicsDir = $package->getPackagePath() . 'ContentBlocks/Basics/' . $vendor;

        // Create vendor directory if needed
        if (!is_dir($basicsDir)) {
            GeneralUtility::mkdir_deep($basicsDir);
        }

        $yamlPath = $basicsDir . '/' . $name . '.yaml';

        // Prepare YAML content
        $basicData = [
            'identifier' => $identifier,
            'fields' => $fields,
        ];

        $yamlContent = Yaml::dump($basicData, 10, 2);

        // Write file
        $result = file_put_contents($yamlPath, $yamlContent);
        if ($result === false) {
            throw new \RuntimeException(
                sprintf('Failed to write Basic "%s"', $identifier),
                1734000006,
            );
        }
    }

    /**
     * Delete a Basic
     *
     * @param string $identifier Format: Vendor/Name
     * @return void
     * @throws \RuntimeException if Basic not found or is read-only
     */
    public function deleteBasic(string $identifier): void
    {
        [$vendor, $name] = $this->parseIdentifier($identifier);

        // Prevent deletion of TYPO3 core Basics
        if ($vendor === 'TYPO3') {
            throw new \RuntimeException(
                sprintf('Cannot delete core Basic "%s"', $identifier),
                1734000007,
            );
        }

        $basicPath = $this->findBasicPath($identifier);
        if ($basicPath === null) {
            throw new \RuntimeException(
                sprintf('Basic "%s" not found', $identifier),
                1734000008,
            );
        }

        $result = unlink($basicPath);
        if (!$result) {
            throw new \RuntimeException(
                sprintf('Failed to delete Basic "%s"', $identifier),
                1734000009,
            );
        }
    }

    /**
     * Validate a Basic (primarily for circular reference detection)
     *
     * @param string $identifier The Basic identifier
     * @param array $fields Field definitions
     * @return array{valid: bool, error?: string}
     */
    public function validateBasic(string $identifier, array $fields): array
    {
        // Check for circular references
        $hasCircularRef = $this->detectCircularReference($identifier, $fields);

        if ($hasCircularRef) {
            return [
                'valid' => false,
                'error' => sprintf(
                    'Circular reference detected in Basic "%s"',
                    $identifier,
                ),
            ];
        }

        return ['valid' => true];
    }

    /**
     * Detect circular references in Basic fields
     *
     * @param string $identifier Current Basic identifier
     * @param array $fields Field definitions to check
     * @param array<string> $chain Chain of identifiers already visited
     * @return bool True if circular reference detected
     */
    public function detectCircularReference(string $identifier, array $fields, array $chain = []): bool
    {
        // Add current identifier to chain
        if (in_array($identifier, $chain, true)) {
            return true; // Circular reference detected
        }

        $chain[] = $identifier;

        // Find all Basic-type fields
        foreach ($fields as $field) {
            if (!is_array($field)) {
                continue;
            }

            // Check if this field is a Basic type
            if (isset($field['type']) && $field['type'] === 'Basic' && isset($field['identifier'])) {
                $referencedBasicId = $field['identifier'];

                try {
                    // Load the referenced Basic
                    $referencedBasic = $this->loadBasic($referencedBasicId);

                    // Recursively check the referenced Basic
                    if ($this->detectCircularReference(
                        $referencedBasicId,
                        $referencedBasic['fields'],
                        $chain,
                    )) {
                        return true;
                    }
                } catch (\RuntimeException $e) {
                    // If Basic doesn't exist, ignore for now (will fail on save)
                    continue;
                }
            }

            // Check nested fields (e.g., in Collections)
            if (isset($field['fields']) && is_array($field['fields'])) {
                if ($this->detectCircularReference($identifier, $field['fields'], $chain)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Get list of Content Blocks that use a specific Basic
     *
     * @param string $identifier Basic identifier
     * @return array<string> List of Content Block identifiers
     */
    public function getUsedBy(string $identifier): array
    {
        $usedBy = [];
        $activePackages = $this->packageManager->getActivePackages();

        foreach ($activePackages as $package) {
            $contentBlocksPath = $package->getPackagePath() . 'ContentBlocks';

            if (!is_dir($contentBlocksPath)) {
                continue;
            }

            // Check ContentElements, PageTypes, RecordTypes
            $types = ['ContentElements', 'PageTypes', 'RecordTypes'];

            foreach ($types as $type) {
                $typePath = $contentBlocksPath . '/' . $type;
                if (!is_dir($typePath)) {
                    continue;
                }

                $cbDirs = glob($typePath . '/*', GLOB_ONLYDIR);
                if (!$cbDirs) {
                    continue;
                }

                foreach ($cbDirs as $cbDir) {
                    $yamlFile = $cbDir . '/EditorInterface.yaml';
                    if (!file_exists($yamlFile)) {
                        continue;
                    }

                    $content = file_get_contents($yamlFile);
                    if ($content === false) {
                        continue;
                    }

                    // Check if Basic identifier appears in the file
                    if (str_contains($content, $identifier)) {
                        $cbName = basename($cbDir);
                        $usedBy[] = $cbName;
                    }
                }
            }
        }

        return array_unique($usedBy);
    }

    /**
     * Parse Basic identifier into vendor and name parts
     *
     * @param string $identifier Format: Vendor/Name
     * @return array{0: string, 1: string} [vendor, name]
     * @throws \InvalidArgumentException if format is invalid
     */
    protected function parseIdentifier(string $identifier): array
    {
        $parts = explode('/', $identifier);

        if (count($parts) !== 2) {
            throw new \InvalidArgumentException(
                sprintf('Invalid Basic identifier format: "%s". Expected "Vendor/Name"', $identifier),
                1734000010,
            );
        }

        return $parts;
    }
}
