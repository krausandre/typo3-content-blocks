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

namespace FriendsOfTYPO3\ContentBlocksGui\Service;

/**
 * Shared field cleanup logic for saving Content Block YAML.
 *
 * Handles:
 * - Casting boolean properties to actual booleans
 * - Omitting properties that should not be saved as empty string
 * - Stripping UI-only properties
 * - Unwrapping UI wrapper objects { enabled, items: [...] } to flat arrays
 */
trait FieldCleanupTrait
{
    private const BOOLEAN_FIELD_PROPERTIES = [
        'useExistingField',
        'prefixFields',
        'required',
        'readOnly',
        'nullable',
    ];

    private const OMIT_WHEN_EMPTY_PROPERTIES = [
        'prefixType',
        'renderType',
    ];

    private const UI_ONLY_PROPERTIES = [
        '_validation',
        '_isBaseField',
        '_typeInjected',
        'enabled',
    ];

    protected function cleanFieldsForSave(mixed $data): mixed
    {
        if (!is_array($data)) {
            return $data;
        }

        $cleaned = [];
        foreach ($data as $key => $value) {
            // Skip UI-only properties
            if (in_array($key, self::UI_ONLY_PROPERTIES, true)) {
                continue;
            }
            // Omit properties that should not be saved as empty string
            if (in_array($key, self::OMIT_WHEN_EMPTY_PROPERTIES, true) && $value === '') {
                continue;
            }
            // Cast known boolean properties
            if (in_array($key, self::BOOLEAN_FIELD_PROPERTIES, true)) {
                $cleaned[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                continue;
            }
            // Unwrap UI wrapper: { enabled, items: [...] } -> [...]
            if (is_array($value) && array_key_exists('items', $value) && is_array($value['items'])) {
                $otherKeys = array_diff(array_keys($value), ['items', 'enabled']);
                if (empty($otherKeys)) {
                    $cleaned[$key] = $this->cleanFieldsForSave($value['items']);
                    continue;
                }
            }
            // Recursively clean nested structures
            $cleaned[$key] = $this->cleanFieldsForSave($value);
        }
        return $cleaned;
    }
}
