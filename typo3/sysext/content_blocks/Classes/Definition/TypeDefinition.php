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

/**
 * @internal Not part of TYPO3's public API.
 */
class TypeDefinition
{
    protected string $identifier = '';
    protected string $table = '';
    protected string $typeField = '';
    protected string|int $typeName = '';
    protected string $label = '';
    protected string $iconProviderClassName = '';
    /** @var string[] */
    protected array $columns = [];
    /** @var array<TcaFieldDefinition> */
    protected array $overrideColumns = [];
    protected string $vendor = '';
    protected string $package = '';

    final public function __construct()
    {
    }

    public static function createFromArray(array $array, string $table): static
    {
        if (!isset($array['identifier']) || $array['identifier'] === '') {
            throw new \InvalidArgumentException('Type identifier must not be empty.', 1629292395);
        }

        if (!isset($array['typeField']) || $array['typeField'] === '') {
            throw new \InvalidArgumentException('Type field must not be empty.', 1668856783);
        }

        if ($table === '') {
            throw new \InvalidArgumentException('Type table must not be empty.', 1668858103);
        }

        $self = new static();
        return $self
            ->withTable($table)
            ->withIdentifier($array['identifier'])
            ->withTypeField($array['typeField'])
            ->withTypeName($array['typeName'])
            ->withLabel($array['label'] ?? '')
            ->withColumns($array['columns'] ?? [])
            ->withOverrideColumns($array['overrideColumns'] ?? [])
            ->withIconProviderClassName($array['iconProvider'] ?? '')
            ->withVendor($array['vendor'] ?? '')
            ->withPackage($array['package'] ?? '');
    }

    public function getIdentifier(): string
    {
        return $this->identifier;
    }

    public function getTable(): string
    {
        return $this->table;
    }

    public function getTypeField(): string
    {
        return $this->typeField;
    }

    public function getTypeName(): string|int
    {
        return $this->typeName;
    }

    public function getTypeIconIdentifier(): string
    {
        return $this->typeName . '-icon';
    }

    public function getVendor(): string
    {
        return $this->vendor;
    }

    public function getPackage(): string
    {
        return $this->package;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getIconProviderClassName(): string
    {
        return $this->iconProviderClassName;
    }

    public function getColumns(): array
    {
        return $this->columns;
    }

    public function hasColumn(string $column): bool
    {
        return in_array($column, $this->columns, true);
    }

    public function getOverrideColumns(): array
    {
        return $this->overrideColumns;
    }

    public function withIdentifier(string $identifier): static
    {
        $clone = clone $this;
        $clone->identifier = $identifier;
        return $clone;
    }

    public function withTable(string $table): static
    {
        $clone = clone $this;
        $clone->table = $table;
        return $clone;
    }

    public function withTypeField(string $typeField): static
    {
        $clone = clone $this;
        $clone->typeField = $typeField;
        return $clone;
    }

    public function withLabel(string $label): static
    {
        $clone = clone $this;
        $clone->label = $label;
        return $clone;
    }

    public function withIconProviderClassName(string $iconProvider): static
    {
        $clone = clone $this;
        $clone->iconProviderClassName = $iconProvider;
        return $clone;
    }

    /**
     * @param string[] $columns
     */
    public function withColumns(array $columns): static
    {
        $clone = clone $this;
        $clone->columns = $columns;
        return $clone;
    }

    /**
     * @param array<TcaFieldDefinition> $overrideColumns
     */
    public function withOverrideColumns(array $overrideColumns): static
    {
        $clone = clone $this;
        $clone->overrideColumns = $overrideColumns;
        return $clone;
    }

    public function withVendor(string $vendor): static
    {
        $clone = clone $this;
        $clone->vendor = $vendor;
        return $clone;
    }

    public function withPackage(string $package): static
    {
        $clone = clone $this;
        $clone->package = $package;
        return $clone;
    }

    public function withTypeName(string|int $type): static
    {
        $clone = clone $this;
        $clone->typeName = $type;
        return $clone;
    }
}
