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

namespace FriendsOfTYPO3\ContentBlocksGui\Utility;

use Psr\Log\LoggerInterface;
use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Schema\SchemaMigrator;
use TYPO3\CMS\Core\Database\Schema\SqlReader;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Utility for managing database schema changes for Content Blocks
 */
readonly class DatabaseUtility
{
    public function __construct(
        protected SchemaMigrator $schemaMigrator,
        protected SqlReader      $sqlReader,
        protected ConnectionPool $connectionPool,
        protected LoggerInterface $logger,
    ) {}

    /**
     * Update database schema for newly created Content Blocks
     * This method regenerates SQL from Content Blocks and applies schema changes
     *
     * @return array{success?: string, error?: string}
     */
    public function updateDatabaseSchema(): array
    {
        try {
            // Clear system cache to force new TCA caching
            $cacheManager = GeneralUtility::makeInstance(CacheManager::class);
            $cacheManager->flushCachesInGroup('system');
            $cacheManager->getCache('typoscript')->flush();

            $this->logger->info('DatabaseUtility: Starting database schema update');

            // Get all SQL statements including from Content Blocks via PSR-14 events
            // The SqlReader dispatches AlterTableDefinitionStatementsEvent which Content Blocks listens to
            $sqlStatements = $this->sqlReader->getCreateTableStatementArray(
                $this->sqlReader->getTablesDefinitionString()
            );

            $this->logger->debug('DatabaseUtility: Retrieved SQL statements', [
                'count' => count($sqlStatements),
            ]);

            // Get update suggestions from schema migrator
            $updateSuggestions = $this->schemaMigrator->getUpdateSuggestions($sqlStatements);

            $this->logger->debug('DatabaseUtility: Schema migrator suggestions', [
                'suggestions' => $updateSuggestions,
            ]);

            // Apply all update suggestions
            $executedStatements = 0;
            foreach ($updateSuggestions as $connectionName => $suggestions) {
                // Remove metadata keys
                unset($suggestions['tables_count'], $suggestions['change_currentValue']);

                // Flatten suggestions array
                $statements = array_merge(...array_values($suggestions));

                if (empty($statements)) {
                    continue;
                }

                $connection = $this->connectionPool->getConnectionByName($connectionName);

                foreach ($statements as $statement) {
                    $this->logger->info('DatabaseUtility: Executing SQL statement', [
                        'statement' => $statement,
                    ]);
                    $connection->executeStatement($statement);
                    $executedStatements++;
                }
            }

            if ($executedStatements > 0) {
                $this->logger->info('DatabaseUtility: Schema update completed successfully', [
                    'executedStatements' => $executedStatements,
                ]);
                return [
                    'success' => sprintf(
                        'Database schema updated successfully. %d statement(s) executed.',
                        $executedStatements
                    ),
                ];
            }

            $this->logger->info('DatabaseUtility: No schema changes needed');
            return [
                'success' => 'Database schema is up to date. No changes needed.',
            ];
        } catch (\Exception $e) {
            $this->logger->error('DatabaseUtility: Schema update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return [
                'error' => sprintf(
                    'Failed to update database schema: %s',
                    $e->getMessage()
                ),
            ];
        }
    }

    /**
     * Check if a specific table exists in the database
     */
    public function tableExists(string $tableName): bool
    {
        try {
            $connection = $this->connectionPool->getConnectionForTable($tableName);
            $schemaManager = $connection->createSchemaManager();

            return $schemaManager->tablesExist([$tableName]);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get update suggestions for a specific table
     * Useful for checking what changes would be made before applying them
     *
     * @return array
     */
    public function getUpdateSuggestionsForTable(string $tableName): array
    {
        try {
            // Get all SQL statements via PSR-14 events
            $sqlStatements = $this->sqlReader->getCreateTableStatementArray(
                $this->sqlReader->getTablesDefinitionString()
            );

            // Filter statements for specific table
            $tableStatements = array_filter($sqlStatements, function ($statement) use ($tableName) {
                return str_contains($statement, 'CREATE TABLE `' . $tableName . '`');
            });

            if (empty($tableStatements)) {
                return [];
            }

            return $this->schemaMigrator->getUpdateSuggestions($tableStatements);
        } catch (\Exception $e) {
            return [];
        }
    }
}
