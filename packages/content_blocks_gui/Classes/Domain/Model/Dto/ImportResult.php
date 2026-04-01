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
 * Data Transfer Object representing the result of importing content blocks
 */
final class ImportResult
{
    /**
     * @param ContentBlockInfo[] $imported
     * @param ContentBlockInfo[] $skipped
     * @param array $errors
     */
    public function __construct(
        public readonly array $imported,        // Successfully imported
        public readonly array $skipped,         // Skipped due to conflicts
        public readonly array $errors,           // Failed imports
    ) {}

    public function toArray(): array
    {
        return [
            'imported' => array_map(fn($block) => $block->toArray(), $this->imported),
            'skipped' => array_map(fn($block) => $block->toArray(), $this->skipped),
            'errors' => $this->errors,
        ];
    }
}
