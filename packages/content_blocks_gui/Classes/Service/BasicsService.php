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

use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use Symfony\Component\Yaml\Yaml;

/**
 * Service to manage Basics (field mixins/partials)
 *
 * Basics are simple field collections that can be reused across Content Blocks.
 * They have only 2 root properties: identifier (Vendor/Name) and fields array.
 */
final class BasicsService
{
    public function __construct(
        protected readonly PackageManager $packageManager
    ) {}

    /**
     * List all available Basics from all extensions
     *
     * @return array<int, array{identifier: string, vendor: string, name: string, fieldCount: int, path: string, extension: string}>
     */
    public function listBasics(): array
    {
        $basics = [];
        $activePackages = $this->packageManager->getActivePackages();

        foreach ($activePackages as $package) {
            $basicsPath = $package->getPackagePath() . 'ContentBlocks/Basics';

            if (!is_dir($basicsPath)) {
                continue;
            }

            // Recursively find all YAML files
            $yamlFiles = $this->findYamlFilesRecursive($basicsPath);

            foreach ($yamlFiles as $yamlFile) {
                try {
                    $content = file_get_contents($yamlFile);
                    if ($content === false) {
                        continue;
                    }

                    $basic = Yaml::parse($content);

                    if (!is_array($basic) || !isset($basic['identifier'])) {
                        continue;
                    }

                    $identifier = $basic['identifier'];
                    $parts = explode('/', $identifier);

                    if (count($parts) !== 2) {
                        // Invalid identifier format, skip
                        continue;
                    }

                    [$vendor, $name] = $parts;

                    $basics[] = [
                        'identifier' => $identifier,
                        'vendor' => $vendor,
                        'name' => $name,
                        'fieldCount' => count($basic['fields'] ?? []),
                        'path' => $yamlFile,
                        'extension' => $package->getPackageKey(),
                    ];
                } catch (\Exception $e) {
                    // Skip invalid Basics
                    continue;
                }
            }
        }

        // Sort by identifier
        usort($basics, fn($a, $b) => strcmp($a['identifier'], $b['identifier']));

        return $basics;
    }

    /**
     * Load a specific Basic by identifier
     *
     * @param string $identifier Format: Vendor/Name
     * @return array{identifier: string, fields: array}
     * @throws \RuntimeException if Basic not found
     */
    public function loadBasic(string $identifier): array
    {
        [$vendor, $name] = $this->parseIdentifier($identifier);
        $basicPath = $this->findBasicPath($vendor, $name);

        if ($basicPath === null) {
            throw new \RuntimeException(
                sprintf('Basic "%s" not found', $identifier),
                1734000001
            );
        }

        $content = file_get_contents($basicPath);
        if ($content === false) {
            throw new \RuntimeException(
                sprintf('Failed to read Basic "%s"', $identifier),
                1734000002
            );
        }

        $basic = Yaml::parse($content);

        if (!is_array($basic)) {
            throw new \RuntimeException(
                sprintf('Invalid Basic YAML in "%s"', $basicPath),
                1734000003
            );
        }

        // Validate required properties
        if (!isset($basic['identifier']) || !isset($basic['fields'])) {
            throw new \RuntimeException(
                sprintf('Basic "%s" must have identifier and fields properties', $identifier),
                1734000004
            );
        }

        return $basic;
    }

    /**
     * Save a Basic to disk
     *
     * @param string $extension Extension key where Basic should be stored
     * @param string $vendor Vendor part of identifier
     * @param string $name Name part of identifier
     * @param array $fields Array of field definitions
     * @return void
     * @throws \RuntimeException if validation fails
     */
    public function saveBasic(string $extension, string $vendor, string $name, array $fields): void
    {
        $identifier = $vendor . '/' . $name;

        // Validate circular references
        $validationResult = $this->validateBasic($identifier, $fields);
        if (!$validationResult['valid']) {
            throw new \RuntimeException(
                $validationResult['error'] ?? 'Validation failed',
                1734000005
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
                1734000006
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
                1734000007
            );
        }

        $basicPath = $this->findBasicPath($vendor, $name);
        if ($basicPath === null) {
            throw new \RuntimeException(
                sprintf('Basic "%s" not found', $identifier),
                1734000008
            );
        }

        $result = unlink($basicPath);
        if (!$result) {
            throw new \RuntimeException(
                sprintf('Failed to delete Basic "%s"', $identifier),
                1734000009
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
                    $identifier
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
                        $referencedBasic['fields'] ?? [],
                        $chain
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
                1734000010
            );
        }

        return $parts;
    }

    /**
     * Find the file path for a Basic by identifier
     *
     * Searches recursively through ContentBlocks/Basics directories
     * because the directory structure may not match the identifier structure
     * (e.g., TYPO3/Header is in ContentBlocks/Basics/ContentElements/Header.yaml)
     *
     * @param string $vendor Vendor name
     * @param string $name Basic name
     * @return string|null File path or null if not found
     */
    protected function findBasicPath(string $vendor, string $name): ?string
    {
        $identifier = $vendor . '/' . $name;
        $activePackages = $this->packageManager->getActivePackages();

        foreach ($activePackages as $package) {
            $basicsPath = $package->getPackagePath() . 'ContentBlocks/Basics';

            if (!is_dir($basicsPath)) {
                continue;
            }

            // Recursively search for YAML files
            $yamlFiles = $this->findYamlFilesRecursive($basicsPath);

            foreach ($yamlFiles as $yamlFile) {
                // Read file and check identifier
                $content = file_get_contents($yamlFile);
                if ($content === false) {
                    continue;
                }

                try {
                    $yaml = Yaml::parse($content);
                    if (isset($yaml['identifier']) && $yaml['identifier'] === $identifier) {
                        return $yamlFile;
                    }
                } catch (\Exception $e) {
                    // Skip invalid YAML files
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Recursively find all YAML files in a directory
     *
     * @param string $directory Directory to search
     * @return array<string> List of file paths
     */
    protected function findYamlFilesRecursive(string $directory): array
    {
        $yamlFiles = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'yaml') {
                $yamlFiles[] = $file->getPathname();
            }
        }

        return $yamlFiles;
    }
}
