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

namespace TYPO3\CMS\Core\Tests\Functional\Utility;

use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

class GeneralUtilityTest extends FunctionalTestCase
{
    protected array $coreExtensionsToLoad = [
        'content_blocks',
    ];

    protected bool $initializeDatabase = false;

    protected array $pathsToProvideInTestInstance = [
        'typo3/sysext/core/Tests/Functional/Fixtures/ContentBlocks/' => 'typo3conf/content-blocks/',
    ];

    /**
     * @test
     */
    public function absolutePathToContentBlockResolved(): void
    {
        $expectedPath = Environment::getPublicPath() . '/typo3conf/content-blocks/foo/Resources/Private/Frontend.html';
        self::assertSame($expectedPath, GeneralUtility::getFileAbsFileName('CB:bar/foo/Resources/Private/Frontend.html'));
    }
}
