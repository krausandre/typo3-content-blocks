<?php

declare(strict_types=1);

namespace FriendsOfTYPO3\ContentBlocksGui\Factory;

use FriendsOfTYPO3\ContentBlocksGui\Domain\Repository\ContentElementRepository;
use FriendsOfTYPO3\ContentBlocksGui\Domain\Repository\PageTypeRepository;
use FriendsOfTYPO3\ContentBlocksGui\Domain\Repository\RecordTypeRepository;
use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;

class UsageFactory
{
    public function __construct(
        protected readonly PageTypeRepository $pageTypeRepository,
        protected readonly RecordTypeRepository $recordTypeRepository,
        protected readonly ContentElementRepository $contentElementRepository,
    ) {}

    public function countUsages(ContentType $contentType, string|int $name, string $tableName): int
    {
        return match ($contentType->name) {
            'PAGE_TYPE' => $this->pageTypeRepository->countUsages($name, $contentType, $tableName),
            'RECORD_TYPE' => $this->recordTypeRepository->countUsages($name, $contentType, $tableName),
            'CONTENT_ELEMENT' => $this->contentElementRepository->countUsages($name, $contentType, $tableName),
            default => 0,
        };
    }
}
