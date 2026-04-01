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

namespace FriendsOfTYPO3\ContentBlocksGui\Domain\Model\Dto;

/**
 * Data Transfer Object representing a content block found in an upload ZIP
 */
final class ContentBlockInfo
{
    public function __construct(
        public readonly string $type,           // CONTENT_ELEMENT, PAGE_TYPE, RECORD_TYPE, BASIC
        public readonly string $name,           // vendor-name (or identifier for Basics)
        public readonly string $vendor,         // empty string for Basics
        public readonly string $table,          // empty string for Basics and Content Elements
        public readonly string $sourcePath,     // Temp extraction path
        public readonly string $directoryName,  // Directory name (e.g., "test-12"), empty string for Basics
        public readonly string $fileName,       // File name for Basics (e.g., "address.yaml"), empty string for content blocks
        public readonly array $files,           // List of files (relative paths)
        public readonly array $yaml,            // Parsed config.yaml/basic.yaml
        public string $conflict = '',            // Conflict type if detected: 'DIRECTORY_EXISTS', 'BASIC_FILE_EXISTS', or empty string for no conflict
    ) {}

    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'name' => $this->name,
            'vendor' => $this->vendor,
            'table' => $this->table,
            'sourcePath' => $this->sourcePath,
            'directoryName' => $this->directoryName,
            'fileName' => $this->fileName,
            'files' => $this->files,
            'yaml' => $this->yaml,
            'conflict' => $this->conflict,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            type: $data['type'],
            name: $data['name'],
            vendor: $data['vendor'] ?? '',
            table: $data['table'] ?? '',
            sourcePath: $data['sourcePath'],
            directoryName: $data['directoryName'] ?? '',
            fileName: $data['fileName'] ?? '',
            files: $data['files'],
            yaml: $data['yaml'],
            conflict: $data['conflict'] ?? '',
        );
    }
}
