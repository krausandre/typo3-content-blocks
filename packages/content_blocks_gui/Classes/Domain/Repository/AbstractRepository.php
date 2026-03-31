<?php

namespace FriendsOfTYPO3\ContentBlocksGui\Domain\Repository;

use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Database\Query\Restriction\HiddenRestriction;

abstract class AbstractRepository implements UsageInterface
{
    protected QueryBuilder $queryBuilder;

    public function __construct(
        protected readonly ConnectionPool $connectionPool
    ) {
    }

    public function countUsages(string|int $name, ContentType $contentType, string $tableName): int
    {
        $table = $contentType->getTable();
        $this->queryBuilder = $this->connectionPool->getQueryBuilderForTable($table);
        $this->queryBuilder->getRestrictions()->removeByType(HiddenRestriction::class);
        return $this->queryBuilder
            ->count('uid')
            ->from($table)
            ->where(
                $this->queryBuilder->expr()->eq($contentType->getTypeField(), $this->queryBuilder->createNamedParameter($name))
            )
            ->executeQuery()
            ->fetchOne();
    }
}
