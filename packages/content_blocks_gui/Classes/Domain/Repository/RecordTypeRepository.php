<?php

namespace FriendsOfTYPO3\ContentBlocksGui\Domain\Repository;

use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\Restriction\HiddenRestriction;
use FriendsOfTYPO3\ContentBlocksGui\Domain\Repository\AbstractRepository;
use FriendsOfTYPO3\ContentBlocksGui\Domain\Repository\UsageInterface;

class RecordTypeRepository extends AbstractRepository implements UsageInterface
{
    public function __construct(ConnectionPool $connectionPool)
    {
        parent::__construct($connectionPool);
    }

    public function countUsages(string|int $name, ContentType $contentType, string $tableName): int
    {
        $this->queryBuilder = $this->connectionPool->getQueryBuilderForTable($tableName);
        $this->queryBuilder->getRestrictions()->removeByType(HiddenRestriction::class);
        return $this->queryBuilder
            ->count('uid')
            ->from($tableName)
            ->executeQuery()
            ->fetchOne();
    }
}
