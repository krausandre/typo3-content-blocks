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

namespace TYPO3\CMS\ContentBlocks\Definition;

use TYPO3\CMS\ContentBlocks\Enumeration\FieldType;
use TYPO3\CMS\ContentBlocks\Utility\LanguagePathUtility;
use TYPO3\CMS\ContentBlocks\Utility\UniqueNameUtility;
use TYPO3\CMS\Core\SingletonInterface;

final class TableDefinitionCollection implements \IteratorAggregate, SingletonInterface
{
    /**
     * @var TableDefinition[]
     */
    private array $definitions = [];
    private array $customTables = [];

    public function __clone()
    {
        $this->definitions = array_map(function (TableDefinition $tableDefinition) {
            return clone $tableDefinition;
        }, $this->definitions);
    }

    public function addTable(TableDefinition $tableDefinition, $isCustomTable = false): void
    {
        if (!$this->hasTable($tableDefinition->getTable())) {
            $this->definitions[$tableDefinition->getTable()] = $tableDefinition;
            if ($isCustomTable) {
                $this->customTables[] = $tableDefinition->getTable();
            }
        }
    }

    public function isCustomTable(TableDefinition $tableDefinition): bool
    {
        return in_array($tableDefinition->getTable(), $this->customTables, true);
    }

    public function getTable(string $table): TableDefinition
    {
        if ($this->hasTable($table)) {
            return $this->definitions[$table];
        }
        throw new \OutOfBoundsException('The table "' . $table . '" does not exist.', 1628925803);
    }

    public function hasTable(string $table): bool
    {
        return isset($this->definitions[$table]);
    }

    public function toArray(): array
    {
        $tablesArray = array_merge([], ...$this->getTablesAsArray());
        return [
            'tables' => $tablesArray,
        ];
    }

    public function getTablesAsArray(): iterable
    {
        foreach ($this->definitions as $definition) {
            yield [$definition->getTable() => $definition->toArray()];
        }
    }

    public static function createFromArray(array $contentBlocks): TableDefinitionCollection
    {
        $tableDefinitionCollection = new self();
        $tableDefinitionList = [];

        // Since we need to sum up all lvl 0 ContentBlock fields to tt_content,
        // we have to handle the tt_content table a bit different from collection tables.
        foreach ($contentBlocks as $contentBlock) {
            // @todo define table in content blocks
            $table = 'tt_content';
            $composerName = $contentBlock['composerJson']['name'];
            [$vendor, $package] = explode('/', $composerName);

            $columns = [];
            foreach ($contentBlock['yaml']['fields'] ?? [] as $field) {
                $column = UniqueNameUtility::createUniqueColumnName($composerName, $field['identifier']);
                $columns[] = $column;

                $field = $tableDefinitionCollection->processCollections(
                    $field,
                    $column,
                    LanguagePathUtility::getPartialLanguageIdentifierPath($package, $field['identifier']),
                    $composerName
                );

                $tableDefinitionList[$table]['fields'][$column] = [
                    'identifier' => $column,
                    'config' => $field,
                ];
            }

            $tableDefinitionList[$table]['elements'][] = [
                'composerName' => $composerName,
                'identifier' => $composerName,
                'columns' => $columns,
                'vendor' => $vendor,
                'package' => $package,
                'wizardGroup' => $contentBlock['yaml']['group'] ?? '',
                'icon' => $contentBlock['icon'] ?? '',
                'iconProvider' => $contentBlock['iconProvider'] ?? '',
            ];
        }

        foreach ($tableDefinitionList as $table => $tableDefinition) {
            $tableDefinitionCollection->addTable(TableDefinition::createFromTableArray($table, $tableDefinition));
        }
        return $tableDefinitionCollection;
    }

    private function processCollections(array $field, string $column, string $languagePath, string $composerName): array
    {
        $originalLanguagePath = $languagePath;
        if (FieldType::from($field['type']) !== FieldType::COLLECTION || empty($field['properties']['fields'])) {
            $field['languagePath'] = $originalLanguagePath;
            return $field;
        }

        // enrich infos for inline relations
        // @todo move to TcaGenerator, foreign_field should be moved to a constant somewhere, as it is also used in SqlGenerator.
        $field['properties']['foreign_table'] = $column;
        $field['properties']['foreign_field'] = 'foreign_table_parent_uid';

        $tableDefinition = [];

        foreach ($field['properties']['fields'] as $collectionField) {
            $languagePath .= '.' . $collectionField['identifier'];
            $tableDefinition['fields'][$collectionField['identifier']] = [
                'identifier' => $collectionField['identifier'],
                'config' => $this->processCollections(
                    $collectionField,
                    UniqueNameUtility::createUniqueColumnName($composerName, $collectionField['identifier']),
                    $languagePath,
                    $composerName
                ),
            ];
        }

        $this->addTable(
            tableDefinition: TableDefinition::createFromTableArray($column, $tableDefinition),
            isCustomTable: true
        );

        $field['languagePath'] = $originalLanguagePath;
        return $field;
    }

    /**
     * @return \Traversable|TableDefinition[]
     */
    public function getIterator(): \Traversable
    {
        return new \ArrayIterator($this->definitions);
    }
}
