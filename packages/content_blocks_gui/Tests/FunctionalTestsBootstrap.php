<?php

declare(strict_types=1);

/*
 * Bootstrap for Content Blocks GUI functional tests.
 * Based on TYPO3 Core FunctionalTestsBootstrap.php.
 */
(static function () {
    $testbase = new \TYPO3\TestingFramework\Core\Testbase();
    $testbase->defineOriginalRootPath();
    $testbase->createDirectory(ORIGINAL_ROOT . 'typo3temp/var/tests');
    $testbase->createDirectory(ORIGINAL_ROOT . 'typo3temp/var/transient');
})();
