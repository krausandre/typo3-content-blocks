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

namespace TYPO3\CMS\ContentBlocks\DataProcessing;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\ContentBlocks\Definition\TableDefinitionCollection;
use TYPO3\CMS\ContentBlocks\Definition\TcaFieldDefinition;
use TYPO3\CMS\ContentBlocks\Enumeration\FieldType;
use TYPO3\CMS\Core\Database\RelationHandler;
use TYPO3\CMS\Core\Domain\Repository\PageRepository;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController;
use TYPO3\CMS\Frontend\Resource\FileCollector;

/**
 * @internal Not part of TYPO3's public API.
 */
class RelationResolver
{
    protected ?ServerRequestInterface $serverRequest = null;

    public function __construct(
        protected readonly TableDefinitionCollection $tableDefinitionCollection
    ) {
    }

    public function processField(TcaFieldDefinition $tcaFieldDefinition, array $record, string $table): mixed
    {
        $fieldType = $tcaFieldDefinition->getFieldType();
        $recordIdentifier = $tcaFieldDefinition->getUniqueIdentifier();

        if (!array_key_exists($recordIdentifier, $record)) {
            throw new \RuntimeException(
                'The field "' . $recordIdentifier . '" is missing in the "' . $table . '" table. Probably a database schema update is needed.',
                1674222293
            );
        }

        $data = $record[$recordIdentifier];

        if ($fieldType === FieldType::FILE) {
            $fileCollector = new FileCollector();
            $fileCollector->addFilesFromRelation($table, $recordIdentifier, $record);
            return $fileCollector->getFiles();
        }

        if ($fieldType === FieldType::COLLECTION) {
            return $this->processCollection($table, $record, $tcaFieldDefinition);
        }

        if ($fieldType === FieldType::CATEGORY) {
            return $this->processCategory($tcaFieldDefinition, $table, $record);
        }

        if ($fieldType === FieldType::REFERENCE) {
            return $this->processReference($tcaFieldDefinition, $table, $record);
        }

        if ($fieldType === FieldType::SELECT) {
            return $this->processSelect($tcaFieldDefinition, $table, $record);
        }

        return $data;
    }

    protected function processSelect(TcaFieldDefinition $tcaFieldDefinition, string $parentTable, array $record): mixed
    {
        $uniqueIdentifier = $tcaFieldDefinition->getUniqueIdentifier();
        $tcaFieldConfig = $GLOBALS['TCA'][$parentTable]['columns'][$tcaFieldDefinition->getUniqueIdentifier()] ?? [];
        if (($tcaFieldConfig['config']['foreign_table'] ?? '') !== '') {
            return $this->getRelations(
                uidList: (string)($record[$uniqueIdentifier] ?? ''),
                tableList: $tcaFieldConfig['config']['foreign_table'] ?? '',
                mmTable: $tcaFieldConfig['config']['MM'] ?? '',
                uid: (int)$record['uid'],
                currentTable: $parentTable,
                tcaFieldConf: $tcaFieldConfig['config'] ?? []
            );
        }
        if (in_array(($tcaFieldConfig['config']['renderType'] ?? ''), ['selectCheckBox', 'selectSingleBox', 'selectMultipleSideBySide'], true)) {
            return ($record[$uniqueIdentifier] ?? '') !== '' ? explode(',', $record[$uniqueIdentifier]) : [];
        }
        return $record[$uniqueIdentifier] ?? '';
    }

    protected function processReference(TcaFieldDefinition $tcaFieldDefinition, string $parentTable, array $record): array
    {
        $uniqueIdentifier = $tcaFieldDefinition->getUniqueIdentifier();
        $tcaFieldConfig = $GLOBALS['TCA'][$parentTable]['columns'][$tcaFieldDefinition->getUniqueIdentifier()] ?? [];
        return $this->getRelations(
            uidList: (string)($record[$uniqueIdentifier] ?? ''),
            tableList: $tcaFieldConfig['config']['allowed'] ?? '',
            mmTable: $tcaFieldConfig['config']['MM'] ?? '',
            uid: (int)$record['uid'],
            currentTable: $parentTable,
            tcaFieldConf: $tcaFieldConfig['config'] ?? []
        );
    }

    protected function processCategory(TcaFieldDefinition $tcaFieldDefinition, string $parentTable, array $record): array
    {
        $uniqueIdentifier = $tcaFieldDefinition->getUniqueIdentifier();
        $tcaFieldConfig = $GLOBALS['TCA'][$parentTable]['columns'][$tcaFieldDefinition->getUniqueIdentifier()] ?? [];
        $uidList = $tcaFieldConfig['config']['relationship'] === 'manyToMany' ? '' : (string)($record[$uniqueIdentifier] ?? '');
        return $this->getRelations(
            uidList: $uidList,
            tableList: $tcaFieldConfig['config']['foreign_table'] ?? '',
            mmTable: $tcaFieldConfig['config']['MM'] ?? '',
            uid: (int)$record['uid'],
            currentTable: $parentTable,
            tcaFieldConf: $tcaFieldConfig['config'] ?? []
        );
    }

    protected function processCollection(string $parentTable, array $record, TcaFieldDefinition $tcaFieldDefinition): array
    {
        $tcaFieldConfig = $GLOBALS['TCA'][$parentTable]['columns'][$tcaFieldDefinition->getUniqueIdentifier()] ?? [];
        $collectionTable = $tcaFieldConfig['config']['foreign_table'] ?? '';
        $uid = (string)($record[$tcaFieldDefinition->getUniqueIdentifier()] ?? '');
        $data = $this->getRelations(
            uidList: $uid,
            tableList: $collectionTable,
            mmTable: $tcaFieldConfig['config']['MM'] ?? '',
            uid: (int)$record['uid'],
            currentTable: $parentTable,
            tcaFieldConf: $tcaFieldConfig['config'] ?? []
        );

        $tableDefinition = $this->tableDefinitionCollection->getTable($collectionTable);
        foreach ($data as $index => $row) {
            foreach ($tableDefinition->getTcaColumnsDefinition() as $childTcaFieldDefinition) {
                $data[$index][$childTcaFieldDefinition->getIdentifier()] = $this->processField(
                    tcaFieldDefinition: $childTcaFieldDefinition,
                    record: $row,
                    table: $collectionTable,
                );
            }
        }
        return $data;
    }

    /**
     * @param array<string, mixed> $tcaFieldConf
     */
    protected function getRelations(string $uidList, string $tableList, string $mmTable, int $uid, string $currentTable, array $tcaFieldConf = []): array
    {
        $pageRepository = $this->getPageRepository();
        $relationHandler = GeneralUtility::makeInstance(RelationHandler::class);
        $relationHandler->start($uidList, $tableList, $mmTable, $uid, $currentTable, $tcaFieldConf);
        $relationHandler->getFromDB();
        $relations = $relationHandler->getResolvedItemArray();
        $records = [];
        foreach ($relations as $relation) {
            $tableName = $relation['table'];
            $translatedRecord = $pageRepository->getLanguageOverlay($tableName, $relation['record']);
            if ($translatedRecord !== null) {
                $records[] = $translatedRecord;
            }
        }
        return $records;
    }

    public function setRequest(ServerRequestInterface $serverRequest): void
    {
        $this->serverRequest = $serverRequest;
    }

    protected function getPageRepository(): PageRepository
    {
        $frontendController = $this->serverRequest?->getAttribute('frontend.controller');
        if ($frontendController instanceof TypoScriptFrontendController && $frontendController->sys_page instanceof PageRepository) {
            return $frontendController->sys_page;
        }
        return GeneralUtility::makeInstance(PageRepository::class);
    }
}
