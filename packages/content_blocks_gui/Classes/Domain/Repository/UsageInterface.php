<?php

declare(strict_types=1);

namespace FriendsOfTYPO3\ContentBlocksGui\Domain\Repository;

use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;

interface UsageInterface
{
    public function countUsages(string|int $name, ContentType $contentType, string $tableName): int;
}
