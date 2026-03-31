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

namespace FriendsOfTYPO3\ContentBlocksGui\Tests\Unit\Factory;

use FriendsOfTYPO3\ContentBlocksGui\Domain\Repository\ContentElementRepository;
use FriendsOfTYPO3\ContentBlocksGui\Domain\Repository\PageTypeRepository;
use FriendsOfTYPO3\ContentBlocksGui\Domain\Repository\RecordTypeRepository;
use FriendsOfTYPO3\ContentBlocksGui\Factory\UsageFactory;
use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\ContentBlocks\Definition\ContentType\ContentType;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class UsageFactoryTest extends UnitTestCase
{
    #[Test]
    public function countUsagesRoutesToContentElementRepository(): void
    {
        $contentElementRepository = $this->createMock(ContentElementRepository::class);
        $contentElementRepository
            ->expects(self::once())
            ->method('countUsages')
            ->with('vendor/my-element', ContentType::CONTENT_ELEMENT, 'tt_content')
            ->willReturn(5);

        $pageTypeRepository = $this->createMock(PageTypeRepository::class);
        $recordTypeRepository = $this->createMock(RecordTypeRepository::class);

        $factory = new UsageFactory(
            $pageTypeRepository,
            $recordTypeRepository,
            $contentElementRepository,
        );

        $result = $factory->countUsages(ContentType::CONTENT_ELEMENT, 'vendor/my-element', 'tt_content');

        self::assertSame(5, $result);
    }

    #[Test]
    public function countUsagesRoutesToPageTypeRepository(): void
    {
        $pageTypeRepository = $this->createMock(PageTypeRepository::class);
        $pageTypeRepository
            ->expects(self::once())
            ->method('countUsages')
            ->with('vendor/my-page', ContentType::PAGE_TYPE, 'pages')
            ->willReturn(3);

        $contentElementRepository = $this->createMock(ContentElementRepository::class);
        $recordTypeRepository = $this->createMock(RecordTypeRepository::class);

        $factory = new UsageFactory(
            $pageTypeRepository,
            $recordTypeRepository,
            $contentElementRepository,
        );

        $result = $factory->countUsages(ContentType::PAGE_TYPE, 'vendor/my-page', 'pages');

        self::assertSame(3, $result);
    }

    #[Test]
    public function countUsagesRoutesToRecordTypeRepository(): void
    {
        $recordTypeRepository = $this->createMock(RecordTypeRepository::class);
        $recordTypeRepository
            ->expects(self::once())
            ->method('countUsages')
            ->with('vendor/my-record', ContentType::RECORD_TYPE, 'tx_myext_domain_model_record')
            ->willReturn(7);

        $pageTypeRepository = $this->createMock(PageTypeRepository::class);
        $contentElementRepository = $this->createMock(ContentElementRepository::class);

        $factory = new UsageFactory(
            $pageTypeRepository,
            $recordTypeRepository,
            $contentElementRepository,
        );

        $result = $factory->countUsages(ContentType::RECORD_TYPE, 'vendor/my-record', 'tx_myext_domain_model_record');

        self::assertSame(7, $result);
    }
}
