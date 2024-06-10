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

namespace TYPO3\CMS\Make\Utility;

use TYPO3\CMS\ContentBlocks\Service\PackageResolver;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\PathUtility;
use TYPO3\CMS\Make\Answer\AnswerInterface;
use TYPO3\CMS\Make\Answer\DataAnswer;

class ExtensionUtility
{
    public function __construct(
//        protected PackageResolver $packageResolver
    ) {
    }
    public function getAvailableExtensions(): AnswerInterface
    {
        // TODO: test in legacy mode
        return new DataAnswer(
            'list',
            $this->findAvailableExtensions()
        );
    }

    public function findAvailableExtensions(): array
    {
        $availablePackages = $this->packageResolver->getAvailablePackages();
        $availableExtensions = [];
        foreach ($availablePackages as $packageKey => $package) {

            if($package->getValueFromComposerManifest('name') === 'contentblocks/content-blocks-gui') {
                continue;
            }

            $requiredPackages = $package->getValueFromComposerManifest('require');
            $requiredContentBlocksPackage = false;
            foreach ($requiredPackages as $package => $version) {
                if($package === 'contentblocks/content-blocks' || $package === 'typo3/cms-content-blocks') {
                    $requiredContentBlocksPackage = true;
                }
            }
            if(!$requiredContentBlocksPackage) {
                // continue;
            }
            $availableExtensions[$packageKey] = [
                'vendor' => explode('/', $availablePackages[$packageKey]->getValueFromComposerManifest('name'))[0],
                'package' => explode('/', $availablePackages[$packageKey]->getValueFromComposerManifest('name'))[1],
                'extension' => $packageKey,
                'icon' => PathUtility::getAbsoluteWebPath(ExtensionManagementUtility::getExtensionIcon($availablePackages[$packageKey]->getPackagePath(), true))
            ];
        }
        return $availableExtensions;
    }

    public function isEditable(string $extension): bool
    {
        return array_key_exists($extension, $this->findAvailableExtensions());
    }
}
