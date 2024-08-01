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

namespace TYPO3\CMS\Core\Tests\Functional\DataHandling\Regular\MultiSite;

use PHPUnit\Framework\Attributes\Test;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Routing\SiteMatcher;
use TYPO3\CMS\Core\Tests\Functional\SiteHandling\SiteBasedTestTrait;
use TYPO3\TestingFramework\Core\Functional\Framework\Constraint\RequestSection\HasRecordConstraint;
use TYPO3\TestingFramework\Core\Functional\Framework\DataHandling\ActionService;
use TYPO3\TestingFramework\Core\Functional\Framework\Frontend\InternalRequest;
use TYPO3\TestingFramework\Core\Functional\Framework\Frontend\ResponseContent;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

/**
 * Functional test for the DataHandler when handling multiple page trees
 */
final class MultiSiteTest extends FunctionalTestCase
{
    use SiteBasedTestTrait;

    private const VALUE_PageIdWebsite = 1;
    private const VALUE_PageIdSecondSite = 50;
    private const TABLE_Page = 'pages';
    private const LANGUAGE_PRESETS = [
        'EN' => ['id' => 0, 'title' => 'English', 'locale' => 'en_US.UTF8'],
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->importCSVDataSet(__DIR__ . '/../DataSet/ImportDefault.csv');
        $this->importCSVDataSet(__DIR__ . '/../../../Fixtures/be_users_admin.csv');
        $this->writeSiteConfiguration(
            'test',
            $this->buildSiteConfiguration(1, 'http://localhost/'),
            [
                $this->buildDefaultLanguageConfiguration('EN', '/en/'),
            ],
            $this->buildErrorHandlingConfiguration('Fluid', [404]),
        );
        $this->setUpFrontendRootPage(1, ['EXT:core/Tests/Functional/Fixtures/Frontend/JsonRenderer.typoscript']);
    }

    #[Test]
    public function moveRootPageToDifferentPageTree(): void
    {
        $backendUser = $this->setUpBackendUser(1);
        $GLOBALS['LANG'] = $this->get(LanguageServiceFactory::class)->createFromUserPreferences($backendUser);

        // Warm up caches for the root line utility to identify side effects
        $this->get(SiteMatcher::class)->matchByPageId(self::VALUE_PageIdWebsite);
        $this->get(SiteMatcher::class)->matchByPageId(self::VALUE_PageIdSecondSite);

        // URL is now "/1" for the second site
        $actionService = new ActionService();
        $actionService->moveRecord(self::TABLE_Page, self::VALUE_PageIdSecondSite, self::VALUE_PageIdWebsite);
        $this->assertCSVDataSet(__DIR__ . '/DataSet/moveRootPageToDifferentPageTree.csv');

        $response = $this->executeFrontendSubRequest((new InternalRequest())->withPageId(self::VALUE_PageIdSecondSite));
        $responseSections = ResponseContent::fromString((string)$response->getBody())->getSections();
        self::assertThat($responseSections, (new HasRecordConstraint())
            ->setTable(self::TABLE_Page)->setField('title')->setValues('Second Root Page'));
    }
}
