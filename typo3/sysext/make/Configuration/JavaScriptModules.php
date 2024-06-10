<?php

return [
    'dependencies' => ['core', 'backend'],
    'imports' => [
        '@typo3/make/' => 'EXT:make/Resources/Public/dist/',
        // TODO: remove if ajax test requests are not needed anymore
        '@typo3/make-testfiles/' => 'EXT:make/Resources/Public/JavaScript/',
    ],
];
