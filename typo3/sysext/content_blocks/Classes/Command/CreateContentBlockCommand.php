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

namespace TYPO3\CMS\ContentBlocks\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\QuestionHelper;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use TYPO3\CMS\ContentBlocks\Builder\ContentBlockConfiguration;
use TYPO3\CMS\ContentBlocks\Builder\ContentBlockSkeletonBuilder;
use TYPO3\CMS\ContentBlocks\PackageResolver;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Package\PackageManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class CreateContentBlockCommand extends Command
{
    protected ContentBlockSkeletonBuilder $contentBlockBuilder;

    protected SymfonyStyle $io;

    protected PackageResolver $packageResolver;

    public function injectContentBlockBuilder(ContentBlockSkeletonBuilder $contentBlockBuilder): void
    {
        $this->contentBlockBuilder = $contentBlockBuilder;
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->io = new SymfonyStyle($input, $output);
        $packageManager = GeneralUtility::makeInstance(PackageManager::class);
        $this->packageResolver = GeneralUtility::makeInstance(PackageResolver::class, $packageManager);
    }

    public function configure()
    {
        $this->addOption('vendor', '', InputOption::VALUE_OPTIONAL, 'The vendor name of the content block.');
        $this->addOption('package', '', InputOption::VALUE_OPTIONAL, 'The package name of the content block.');
        $this->addOption('extension', '', InputOption::VALUE_OPTIONAL, 'Enter extension in which the content block should be stored.');
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        /** @var QuestionHelper $questionHelper */
        $questionHelper = $this->getHelper('question');
        if ($input->getOption('vendor')) {
            $vendor = $input->getOption('vendor');
        } else {
            $questionVendor = new Question('Enter your vendor name: ');
            $vendor = $questionHelper->ask($input, $output, $questionVendor);
        }
        if ($input->getOption('package')) {
            $package = $input->getOption('package');
        } else {
            $questionPackage = new Question('Enter your package name: ');
            $package = $questionHelper->ask($input, $output, $questionPackage);
        }
        $packages = $this->packageResolver->getAvailablePackages();
        $availablePackages = [];

        foreach ($packages as $p) {
            $availablePackages[$p->getPackageKey()] = $p->getPackageMetaData()->getTitle();
        }
        if ($input->getOption('extension')) {
            $extension = $input->getOption('extension');
            $basePath = $this->packageResolver->resolvePackage($extension)->getPackagePath();
        } else {
            $extension = $this->io->askQuestion((new ChoiceQuestion(
                'Choose extension in which the content block should be stored: ',
                $availablePackages
            )));
            $basePath = $this->packageResolver->resolvePackage($extension)->getPackagePath() . 'ContentBlocks';
        }

        $contentBlockConfiguration = new ContentBlockConfiguration(
            yamlConfig: [
                'name' => $vendor . '/' . $package,
                'group' => 'common',
                'fields' => [
                    [
                        'identifier' => 'header',
                        'type' => 'Text',
                        'useExistingField' => true,
                    ],
                ],
            ],
            basePath: $basePath
        );
        $this->contentBlockBuilder->create($contentBlockConfiguration);

        return Command::SUCCESS;
    }
}
