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

namespace TYPO3\CMS\Install\SystemEnvironment\DatabaseCheck\Platform;

use Doctrine\DBAL\Platforms\MariaDBPlatform as DoctrineMariaDBPlatform;
use Doctrine\DBAL\Platforms\MySQLPlatform as DoctrineMySQLPlatform;
use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageQueue;
use TYPO3\CMS\Core\Type\ContextualFeedbackSeverity;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Check database configuration status for MySQL server
 *
 * This class is a hardcoded requirement check for the database server.
 *
 * The status messages and title *must not* include HTML, use plain
 * text only. The return values of this class are not bound to HTML
 * and can be used in different scopes (eg. as json array).
 *
 * @internal This class is only meant to be used within EXT:install and is not part of the TYPO3 Core API.
 */
class MySql extends AbstractPlatform
{
    protected const PLATFORM_MYSQL = 'mysql';
    protected const PLATFORM_MARIADB = 'mariadb';

    /**
     * Minimum supported MySQL version
     *
     * @var array<string, string>
     */
    protected array $minimumVersion = [
        self::PLATFORM_MYSQL => '8.0.0',
        self::PLATFORM_MARIADB => '10.4.3',
    ];

    /**
     * @var array<string, string>
     */
    protected array $platformLabel = [
        self::PLATFORM_MYSQL => 'MySQL',
        self::PLATFORM_MARIADB => 'MariaDB',
    ];

    /**
     * List of MySQL modes that are incompatible with TYPO3 CMS
     *
     * @var array
     */
    protected $incompatibleSqlModes = [
        'NO_BACKSLASH_ESCAPES',
    ];

    /**
     * Charset of the database that should be fulfilled
     * @var array
     */
    protected $databaseCharsetToCheck = [
        'utf8',
        'utf8mb3',
        'utf8mb4',
    ];

    /**
     * Charset of the database server that should be fulfilled
     * @var array
     */
    protected $databaseServerCharsetToCheck = [
        'utf8',
        'utf8mb3',
        'utf8mb4',
    ];

    /**
     * Get all status information as array with status objects
     *
     * @throws \InvalidArgumentException
     * @throws \Doctrine\DBAL\Exception
     */
    public function getStatus(): FlashMessageQueue
    {
        $defaultConnection = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getConnectionByName(ConnectionPool::DEFAULT_CONNECTION_NAME);
        $platform = $defaultConnection->getDatabasePlatform();
        if (!($platform instanceof DoctrineMariaDBPlatform || $platform instanceof DoctrineMySQLPlatform)) {
            return $this->messageQueue;
        }
        $this->checkMySQLOrMariaDBVersion($defaultConnection);
        $this->checkInvalidSqlModes($defaultConnection);
        $this->checkDefaultDatabaseCharset($defaultConnection);
        $this->checkDefaultDatabaseServerCharset($defaultConnection);
        $this->checkDatabaseName($defaultConnection);
        return $this->messageQueue;
    }

    /**
     * Check if any SQL mode is set which is not compatible with TYPO3
     *
     * @param Connection $connection to the database to be checked
     */
    protected function checkInvalidSqlModes(Connection $connection)
    {
        $detectedIncompatibleSqlModes = $this->getIncompatibleSqlModes($connection);
        if (!empty($detectedIncompatibleSqlModes)) {
            $this->messageQueue->enqueue(new FlashMessage(
                'Incompatible SQL modes have been detected:'
                    . ' ' . implode(', ', $detectedIncompatibleSqlModes) . '.'
                    . ' The listed modes are not compatible with TYPO3 CMS.'
                    . ' You have to change that setting in your MySQL environment'
                    . ' or in $GLOBALS[\'TYPO3_CONF_VARS\'][\'DB\'][\'Connections\'][\'Default\'][\'initCommands\']',
                'Incompatible SQL modes found!',
                ContextualFeedbackSeverity::ERROR
            ));
        } else {
            $this->messageQueue->enqueue(new FlashMessage(
                '',
                'No incompatible SQL modes found.'
            ));
        }
    }

    /**
     * Check minimum MySQL version
     *
     * @param Connection $connection to the database to be checked
     */
    protected function checkMySQLOrMariaDBVersion(Connection $connection): void
    {
        $platformLabel = $this->getPlatformLabel($connection);
        $minimumVersion = $this->getMinimumVersion($connection);
        $serverVersion = $connection->getPlatformServerVersion();
        preg_match('/MySQL (5\.5\.5-|)((\d+\.)*(\d+\.)*\d+)/', $serverVersion, $match);
        $currentMysqlVersion = $match[2] ?? null;
        if ($currentMysqlVersion === null) {
            $this->messageQueue->enqueue(new FlashMessage(
                'Your ' . $platformLabel . ' version could not be determined. Verify manually to have at least '
                . $platformLabel . ' ' . $minimumVersion . ' installed. Version value: ' . $serverVersion,
                $platformLabel . ' version invalid',
                ContextualFeedbackSeverity::ERROR
            ));
        } elseif (version_compare($currentMysqlVersion, $minimumVersion, '<')) {
            $this->messageQueue->enqueue(new FlashMessage(
                'Your ' . $platformLabel . ' version ' . $currentMysqlVersion . ' is too old. TYPO3 CMS does not run'
                    . ' with this version. Update to at least ' . $platformLabel . ' ' . $minimumVersion,
                $platformLabel . ' version too low',
                ContextualFeedbackSeverity::ERROR
            ));
        } else {
            $this->messageQueue->enqueue(new FlashMessage(
                '',
                $platformLabel . ' version ' . $currentMysqlVersion . ' is fine'
            ));
        }
    }

    /**
     * Checks the character set of the database and reports an error if it is not utf-8.
     *
     * @param Connection $connection to the database to be checked
     */
    public function checkDefaultDatabaseCharset(Connection $connection): void
    {
        $queryBuilder = $connection->createQueryBuilder();
        $defaultDatabaseCharset = (string)$queryBuilder->select('DEFAULT_CHARACTER_SET_NAME')
            ->from('information_schema.SCHEMATA')
            ->where(
                $queryBuilder->expr()->eq(
                    'SCHEMA_NAME',
                    $queryBuilder->createNamedParameter($connection->getDatabase())
                )
            )
            ->setMaxResults(1)
            ->executeQuery()
            ->fetchOne();

        $platformLabel = $this->getPlatformLabel($connection);
        if (!in_array($defaultDatabaseCharset, $this->databaseCharsetToCheck, true)) {
            $this->messageQueue->enqueue(new FlashMessage(
                sprintf(
                    'Checking database character set failed, got key "%s" instead of "%s"',
                    $defaultDatabaseCharset,
                    implode(' or ', $this->databaseCharsetToCheck)
                ),
                $platformLabel . ' database character set check failed',
                ContextualFeedbackSeverity::ERROR
            ));
        } else {
            $this->messageQueue->enqueue(new FlashMessage(
                '',
                sprintf('%s database uses %s. All good.', $platformLabel, implode(' or ', $this->databaseCharsetToCheck))
            ));
        }
    }

    /**
     * Returns an array with the current sql mode settings
     *
     * @param Connection $connection to the database to be checked
     * @return array Contains all configured SQL modes that are incompatible
     */
    protected function getIncompatibleSqlModes(Connection $connection): array
    {
        $sqlModes = explode(',', (string)$connection->executeQuery('SELECT @@SESSION.sql_mode;')->fetchOne());
        return array_intersect($this->incompatibleSqlModes, $sqlModes);
    }

    /**
     * Checks the character set of the database server and reports an info if it is not utf-8.
     *
     * @param Connection $connection to the database to be checked
     */
    public function checkDefaultDatabaseServerCharset(Connection $connection): void
    {
        $defaultServerCharset = $connection->executeQuery('SHOW VARIABLES LIKE \'character_set_server\'')->fetchAssociative();
        $platformLabel = $this->getPlatformLabel($connection);
        if (!in_array($defaultServerCharset['Value'], $this->databaseServerCharsetToCheck, true)) {
            $this->messageQueue->enqueue(new FlashMessage(
                sprintf(
                    'Checking server character set failed, got key "%s" instead of "%s"',
                    $defaultServerCharset['Value'],
                    implode(' or ', $this->databaseServerCharsetToCheck)
                ),
                $platformLabel . ' database server character set check failed',
                ContextualFeedbackSeverity::INFO
            ));
        } else {
            $this->messageQueue->enqueue(new FlashMessage(
                '',
                sprintf('%s server default uses %s. All good.', $platformLabel, implode(' or ', $this->databaseCharsetToCheck))
            ));
        }
    }

    /**
     * Validate the database name
     */
    public static function isValidDatabaseName(string $databaseName): bool
    {
        return strlen($databaseName) <= static::SCHEMA_NAME_MAX_LENGTH && preg_match('/^[\x{0001}-\x{FFFF}]*$/u', $databaseName);
    }

    protected function checkDatabaseName(Connection $connection): void
    {
        if (static::isValidDatabaseName((string)$connection->getDatabase())) {
            return;
        }

        $this->messageQueue->enqueue(
            new FlashMessage(
                'The given database name must not be longer than ' . static::SCHEMA_NAME_MAX_LENGTH . ' characters'
                . ' and consist of the Unicode Basic Multilingual Plane (BMP), except U+0000',
                'Database name not valid',
                ContextualFeedbackSeverity::ERROR
            )
        );
    }

    protected function getMinimumVersion(Connection $connection): string
    {
        return $this->minimumVersion[$this->getPlatformType($connection)];
    }

    protected function getPlatformType(Connection $connection): string
    {
        return $this->isMariaDb($connection) ? self::PLATFORM_MARIADB : self::PLATFORM_MYSQL;
    }

    protected function getPlatformLabel(Connection $connection): string
    {
        return $this->platformLabel[$this->getPlatformType($connection)];
    }

    protected function isMariaDb(Connection $connection): bool
    {
        return $connection->getDatabasePlatform() instanceof DoctrineMariaDBPlatform;
    }
}
