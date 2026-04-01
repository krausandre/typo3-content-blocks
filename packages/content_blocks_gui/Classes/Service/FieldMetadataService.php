<?php

declare(strict_types=1);

/**
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

namespace FriendsOfTYPO3\ContentBlocksGui\Service;

use TYPO3\CMS\ContentBlocks\Schema\SimpleTcaSchemaFactory;

/**
 * Service to provide field metadata for the GUI editor
 *
 * This service wraps Content Blocks' TCA Schema API to provide:
 * - Base field detection (from Configuration/TCA/*.php)
 * - Field type auto-detection
 * - System reserved field lists
 */
final class FieldMetadataService
{
    public function __construct(
        protected readonly SimpleTcaSchemaFactory $simpleTcaSchemaFactory,
    ) {}

    /**
     * Get complete field metadata for editor initialization
     *
     * @param string $table The table name (e.g., 'tt_content', 'pages')
     * @return array{baseFields: array, systemReservedFields: array, currentTable: string}
     */
    public function getFieldMetadata(string $table): array
    {
        return [
            'baseFields' => $this->getBaseFieldsForTable($table),
            'systemReservedFields' => $this->getSystemReservedFields($table),
            'currentTable' => $table,
        ];
    }

    /**
     * Get all base fields for a table with their Content Blocks types
     *
     * @param string $table The table name
     * @return array<string, array{type: string, tcaType: string, label: string, description: string}>
     */
    protected function getBaseFieldsForTable(string $table): array
    {
        if (!$this->simpleTcaSchemaFactory->has($table)) {
            return [];
        }

        $schema = $this->simpleTcaSchemaFactory->get($table);
        $baseFields = [];

        // Get base TCA columns directly from SimpleTcaSchemaFactory's loaded TCA
        // Note: SimpleTcaSchema doesn't expose fields publicly, so we iterate using hasField/getField
        // We get the field list from the original TCA that SimpleTcaSchemaFactory loaded
        $tcaColumns = $this->getBaseTcaColumns($table);

        foreach ($tcaColumns as $fieldName => $columnConfig) {
            // Use SimpleTcaSchema to check if field exists and get its type
            if ($schema->hasField($fieldName)) {
                $tcaField = $schema->getField($fieldName);
                $fieldType = $tcaField->getType();

                $baseFields[$fieldName] = [
                    'type' => $fieldType->getName(),        // Content Blocks type (e.g., "Text")
                    'tcaType' => $fieldType->getTcaType(),  // TCA type (e.g., "input")
                    'label' => $columnConfig['label'] ?? $fieldName,
                    'description' => $columnConfig['description'] ?? '',
                ];
            }
        }

        return $baseFields;
    }

    /**
     * Get base TCA columns for a table
     * This loads the same TCA that SimpleTcaSchemaFactory uses (Configuration/TCA/*.php)
     *
     * @param string $table The table name
     * @return array
     */
    protected function getBaseTcaColumns(string $table): array
    {
        // SimpleTcaSchemaFactory loads TCA from Configuration/TCA/*.php files
        // We need to get the columns before any overrides are applied
        // The factory caches this, so we're reading the same data it uses

        // For now, we'll read from global TCA which includes base + overrides
        // This is acceptable because SimpleTcaSchema.hasField() will filter to only base fields
        if (!isset($GLOBALS['TCA'][$table]['columns'])) {
            return [];
        }

        return $GLOBALS['TCA'][$table]['columns'];
    }

    /**
     * Get system reserved fields for a table
     *
     * These fields should not be used as identifiers without prefixing
     *
     * @param string $table The table name
     * @return array<string>
     */
    protected function getSystemReservedFields(string $table): array
    {
        // Core system fields that are present in virtually all tables
        $coreSystemFields = [
            'uid',
            'pid',
            'tstamp',
            'crdate',
            'cruser_id',
            'deleted',
            'hidden',
            'starttime',
            'endtime',
            'sorting',
            'sys_language_uid',
            'l10n_parent',
            'l10n_source',
            'l10n_state',
            'l10n_diffsource',
            't3ver_oid',
            't3ver_wsid',
            't3ver_state',
            't3ver_stage',
            'cache_tags',
            'cache_timeout',
            'l18n_cfg',
            'module',
            'mount_pid',
            'mount_pid_ol',
            'php_tree_stop',
            'TSconfig',
            'tsconfig_includes',
        ];

        // Get table-specific enable columns from TCA ctrl section
        $tableSystemFields = $coreSystemFields;
        if (isset($GLOBALS['TCA'][$table]['ctrl']['enablecolumns'])) {
            foreach ($GLOBALS['TCA'][$table]['ctrl']['enablecolumns'] as $fieldName) {
                if (!in_array($fieldName, $tableSystemFields)) {
                    $tableSystemFields[] = $fieldName;
                }
            }
        }

        // Add other common ctrl fields
        // BUT: Exclude base fields! Base fields (like 'header', 'bodytext') are reusable content fields,
        // not system reserved fields, even if they're referenced in ctrl config
        $baseFields = $this->getBaseFieldsForTable($table);

        if (isset($GLOBALS['TCA'][$table]['ctrl'])) {
            $ctrlFields = [
                'type',
                'typeicon_column',
                'label',
                'label_alt',
                'label_userFunc',
                'descriptionColumn',
                'editlock',
                'origUid',
                'fe_cruser_id',
                'fe_crgroup_id',
                'fe_admin_lock',
            ];

            foreach ($ctrlFields as $ctrlKey) {
                if (isset($GLOBALS['TCA'][$table]['ctrl'][$ctrlKey])) {
                    $fieldName = $GLOBALS['TCA'][$table]['ctrl'][$ctrlKey];

                    // Only add if it's a string, not already in the list, and NOT a base field
                    if (is_string($fieldName)
                        && !in_array($fieldName, $tableSystemFields)
                        && !isset($baseFields[$fieldName])) {
                        $tableSystemFields[] = $fieldName;
                    }
                }
            }
        }

        return array_unique($tableSystemFields);
    }

    /**
     * Check if a field is a base field (exists in Configuration/TCA/*.php)
     *
     * @param string $table The table name
     * @param string $identifier The field identifier
     * @return bool
     */
    public function isBaseField(string $table, string $identifier): bool
    {
        if (!$this->simpleTcaSchemaFactory->has($table)) {
            return false;
        }

        $schema = $this->simpleTcaSchemaFactory->get($table);
        return $schema->hasField($identifier);
    }

    /**
     * Detect Content Blocks type for an existing base field
     *
     * @param string $table The table name
     * @param string $identifier The field identifier
     * @return string|null The Content Blocks type name, or null if not a base field
     */
    public function detectTypeForBaseField(string $table, string $identifier): ?string
    {
        if (!$this->isBaseField($table, $identifier)) {
            return null;
        }

        $schema = $this->simpleTcaSchemaFactory->get($table);
        $tcaField = $schema->getField($identifier);
        $fieldType = $tcaField->getType();

        return $fieldType->getName();
    }
}
