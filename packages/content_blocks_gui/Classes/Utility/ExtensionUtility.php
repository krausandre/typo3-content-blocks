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

//use TYPO3\CMS\ContentBlocks\Service\PackageResolver;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\PathUtility;
use FriendsOfTYPO3\ContentBlocksGui\Answer\AnswerInterface;
use FriendsOfTYPO3\ContentBlocksGui\Answer\DataAnswer;

class ExtensionUtility
{
    public function __construct(
//        protected PackageResolver $packageResolver
        protected PackageManager $packageResolver
    ) {
    }
//    public function getAvailableExtensions(): AnswerInterface
//    {
//
//        return new DataAnswer(
//            'list',
//            $this->findAvailableExtensions()
//        );
//    }

    // TODO: test in legacy mode
    public function findAvailableExtensions(): array
    {
        $availablePackages = $this->packageResolver->getAvailablePackages();
        $availableExtensions = [];
        foreach ($availablePackages as $packageKey => $package) {
            if($availablePackages[$packageKey]->isProtected()) {
                continue;
            }
            $requiredPackages = $package->getValueFromComposerManifest('require');
            $requiredContentBlocksPackage = false;
            foreach ($requiredPackages as $package => $version) {
                if($package === 'friendsoftypo3/content-blocks') {
                    $requiredContentBlocksPackage = true;
                }
            }

            if(!$requiredContentBlocksPackage ||
                (explode('/', $availablePackages[$packageKey]->getValueFromComposerManifest('name'))[0] === 'friendsoftypo3' &&
                explode('/', $availablePackages[$packageKey]->getValueFromComposerManifest('name'))[1] === 'content-blocks-gui')
            ) {
                continue;
            }
            $availableExtensions[] = [
                'vendor' => explode('/', $availablePackages[$packageKey]->getValueFromComposerManifest('name'))[0],
                'package' => explode('/', $availablePackages[$packageKey]->getValueFromComposerManifest('name'))[1],
                'extension' => $packageKey,
                'icon' => $availablePackages[$packageKey]->getPackageIcon() ? PathUtility::getAbsoluteWebPath($availablePackages[$packageKey]->getPackageIcon()) : '',
            ];
        }
        return $availableExtensions;
    }

    public function isEditable(string $packageKey): bool
    {
        return $this->packageResolver->isPackageAvailable($packageKey);
    }
}
