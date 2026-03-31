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

namespace FriendsOfTYPO3\ContentBlocksGui\Tests\Unit\Service;

use FriendsOfTYPO3\ContentBlocksGui\Service\ContentBlockImportAnalyzer;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\ContentBlocks\Service\PackageResolver;
use TYPO3\CMS\ContentBlocks\Utility\ContentBlockPathUtility;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class ContentBlockImportAnalyzerTest extends UnitTestCase
{
    private ContentBlockImportAnalyzer $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $packageResolver = $this->createMock(PackageResolver::class);
        $this->subject = new ContentBlockImportAnalyzer($packageResolver);
    }

    #[Test]
    public function getTypeSubdirectoryReturnsContentElements(): void
    {
        $reflection = new \ReflectionMethod(ContentBlockImportAnalyzer::class, 'getTypeSubdirectory');

        $result = $reflection->invoke($this->subject, 'CONTENT_ELEMENT');

        $expected = ContentBlockPathUtility::getRelativeContentTypePath(
            \TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType::CONTENT_ELEMENT
        );
        self::assertSame($expected, $result);
    }

    #[Test]
    public function getTypeSubdirectoryReturnsPageTypes(): void
    {
        $reflection = new \ReflectionMethod(ContentBlockImportAnalyzer::class, 'getTypeSubdirectory');

        $result = $reflection->invoke($this->subject, 'PAGE_TYPE');

        $expected = ContentBlockPathUtility::getRelativeContentTypePath(
            \TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType::PAGE_TYPE
        );
        self::assertSame($expected, $result);
    }

    #[Test]
    public function getTypeSubdirectoryReturnsRecordTypes(): void
    {
        $reflection = new \ReflectionMethod(ContentBlockImportAnalyzer::class, 'getTypeSubdirectory');

        $result = $reflection->invoke($this->subject, 'RECORD_TYPE');

        $expected = ContentBlockPathUtility::getRelativeContentTypePath(
            \TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType::RECORD_TYPE
        );
        self::assertSame($expected, $result);
    }

    #[Test]
    public function getTypeSubdirectoryThrowsOnUnknownType(): void
    {
        $reflection = new \ReflectionMethod(ContentBlockImportAnalyzer::class, 'getTypeSubdirectory');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Unknown content type: UNKNOWN');

        $reflection->invoke($this->subject, 'UNKNOWN');
    }

    #[Test]
    public function isBasicReturnsTrueForBasicYaml(): void
    {
        $reflection = new \ReflectionMethod(ContentBlockImportAnalyzer::class, 'isBasic');

        $yaml = [
            'identifier' => 'my-basic',
            'fields' => [
                [
                    'identifier' => 'header',
                    'type' => 'Text',
                ],
            ],
        ];

        $result = $reflection->invoke($this->subject, $yaml);

        self::assertTrue($result);
    }

    #[Test]
    public function isBasicReturnsFalseForContentBlock(): void
    {
        $reflection = new \ReflectionMethod(ContentBlockImportAnalyzer::class, 'isBasic');

        $yaml = [
            'name' => 'vendor/my-block',
            'table' => 'tt_content',
            'fields' => [
                [
                    'identifier' => 'header',
                    'type' => 'Text',
                ],
            ],
        ];

        $result = $reflection->invoke($this->subject, $yaml);

        self::assertFalse($result);
    }
}
