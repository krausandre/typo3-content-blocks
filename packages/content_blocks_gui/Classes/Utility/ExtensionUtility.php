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

namespace FriendsOfTYPO3\ContentBlocksGui\Utility;

use TYPO3\CMS\ContentBlocks\Service\PackageResolver;
use TYPO3\CMS\Core\Utility\PathUtility;

class ExtensionUtility
{
    public function __construct(
        protected PackageResolver $packageResolver,
    ) {}

    /**
     * Get available extensions for content blocks.
     * Uses the native Content Blocks PackageResolver to get packages filtered for display.
     * This ensures consistency with the Content Blocks core command.
     */
    public function findAvailableExtensions(): array
    {
        $availablePackages = $this->packageResolver->getAvailablePackagesForDisplay();
        $availableExtensions = [];

        foreach ($availablePackages as $packageKey => $package) {
            // Skip protected packages
            if ($package->isProtected()) {
                continue;
            }

            $composerName = $package->getValueFromComposerManifest('name');
            if (!$composerName) {
                continue;
            }

            $nameParts = explode('/', $composerName);
            if (count($nameParts) !== 2) {
                continue;
            }

            [$vendor, $packageName] = $nameParts;

            // Skip the content-blocks-gui extension itself
            if ($vendor === 'friendsoftypo3' && $packageName === 'content-blocks-gui') {
                continue;
            }

            // Check if package requires content-blocks
            $requiredPackages = $package->getValueFromComposerManifest('require');

            // If no require section, skip this package
            if ($requiredPackages === null) {
                continue;
            }

            // Convert stdClass to array if needed
            if (is_object($requiredPackages)) {
                $requiredPackages = (array) $requiredPackages;
            }

            // Check if friendsoftypo3/content-blocks is in the dependencies
            $hasContentBlocksDependency = false;
            foreach ($requiredPackages as $packageName => $version) {
                if ($packageName === 'friendsoftypo3/content-blocks') {
                    $hasContentBlocksDependency = true;
                    break;
                }
            }

            if (!$hasContentBlocksDependency) {
                continue;
            }

            $availableExtensions[] = [
                'vendor' => $vendor,
                'package' => $nameParts[1], // Use the package name part
                'extension' => $packageKey,
                'icon' => $package->getPackageIcon() ? PathUtility::getAbsoluteWebPath($package->getPackageIcon()) : '',
            ];
        }

        return $availableExtensions;
    }

    public function isEditable(string $packageKey): bool
    {
        if ($packageKey === 'content_blocks') {
            return false;
        }
        $packages = $this->packageResolver->getAvailablePackages();
        return isset($packages[$packageKey]);
    }
}
