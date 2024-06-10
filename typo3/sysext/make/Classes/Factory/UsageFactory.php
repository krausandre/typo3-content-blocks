<?php

namespace TYPO3\CMS\Make\Factory;
use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;
use TYPO3\CMS\Make\Domain\Repository\ContentElementRepository;
use TYPO3\CMS\Make\Domain\Repository\PageTypeRepository;
use TYPO3\CMS\Make\Domain\Repository\RecordTypeRepository;

class UsageFactory
{
    public function __construct(
        protected readonly PageTypeRepository $pageTypeRepository,
        protected readonly RecordTypeRepository $recordTypeRepository,
        protected readonly ContentElementRepository $contentElementRepository,
    ) {
    }

    public function countUsages(ContentType $contentType, string|int $name, string $tableName): int
    {
        return match ($contentType->name) {
            'PAGE_TYPE' => $this->pageTypeRepository->countUsages($name, $contentType, $tableName),
            'RECORD_TYPE' => $this->recordTypeRepository->countUsages($name, $contentType, $tableName),
            'CONTENT_ELEMENT' => $this->contentElementRepository->countUsages($name, $contentType, $tableName)
        };
    }
}
