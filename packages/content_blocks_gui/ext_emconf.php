<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'TYPO3 CMS Make',
    'description' => 'The Make extension provides command line scripts and the Content Blocks backend GUI.',
    'category' => 'module',
    'state' => 'alpha',
    'author' => 'TYPO3 Core Team',
    'author_email' => 'typo3cms@typo3.org',
    'author_company' => '',
    'version' => '0.0.1',
    'constraints' => [
        'depends' => [
            'typo3' => '13.4.0-13.99.99',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];
