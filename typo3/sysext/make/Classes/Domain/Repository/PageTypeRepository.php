<?php

namespace TYPO3\CMS\Make\Domain\Repository;

use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Restriction\HiddenRestriction;
use TYPO3\CMS\Make\Domain\Repository\AbstractRepository;
use TYPO3\CMS\Make\Domain\Repository\UsageInterface;

class PageTypeRepository extends AbstractRepository implements UsageInterface
{
    public function __construct(ConnectionPool $connectionPool)
    {
        parent::__construct($connectionPool);
    }

    public function countUsages(string|int $name, ContentType $contentType, string $tableName): int
    {
        $this->queryBuilder = $this->connectionPool->getQueryBuilderForTable($contentType->getTable());
        $this->queryBuilder->getRestrictions()->removeByType(HiddenRestriction::class);
        return $this->queryBuilder
            ->count('uid')
            ->from($contentType->getTable())
            ->where(
                $this->queryBuilder->expr()->eq($contentType->getTypeField(), $this->queryBuilder->createNamedParameter($name))
            )
            ->executeQuery()
            ->fetchOne();
    }
}
