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
 * Data Transfer Object representing the result of analyzing a content block upload ZIP
 */
final class ImportAnalysis
{
    /**
     * @param ContentBlockInfo[] $blocks
     * @param string[] $errors
     */
    public function __construct(
        public readonly array $blocks,
        public readonly bool $valid,
        public readonly array $errors,
        public readonly string $tempDir,
    ) {}

    public function toArray(): array
    {
        return [
            'blocks' => array_map(fn($block) => $block->toArray(), $this->blocks),
            'valid' => $this->valid,
            'errors' => $this->errors,
            'tempDir' => $this->tempDir,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            blocks: array_map(fn($blockData) => ContentBlockInfo::fromArray($blockData), $data['blocks']),
            valid: (bool) $data['valid'],
            errors: $data['errors'] ?? [],
            tempDir: $data['tempDir'],
        );
    }
}
