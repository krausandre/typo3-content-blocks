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
        $this->queryBuilder
            ->count('uid')
            ->from($table);

        $typeField = $contentType->getTypeField();
        if ($typeField !== null && $typeField !== '') {
            $this->queryBuilder->where(
                $this->queryBuilder->expr()->eq($typeField, $this->queryBuilder->createNamedParameter($name))
            );
        }

        return $this->queryBuilder
            ->executeQuery()
            ->fetchOne();
    }
}
