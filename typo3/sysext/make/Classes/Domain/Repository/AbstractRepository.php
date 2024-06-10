<?php

namespace TYPO3\CMS\Make\Domain\Repository;

use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;

abstract class AbstractRepository
{
    protected QueryBuilder $queryBuilder;

    public function __construct(
        protected readonly ConnectionPool $connectionPool
    ) {
    }
}
