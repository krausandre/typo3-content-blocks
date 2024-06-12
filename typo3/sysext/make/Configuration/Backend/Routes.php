<?php

return [
    'make_content_block_new' => [
        'path' => '/make/content-blocks/gui/new',
        'target' => TYPO3\CMS\Make\Controller\Backend\ContentBlocksGuiController::class . '::newAction'
    ],
    'make_content_block_edit' => [
        'path' => '/make/content-blocks/gui/edit',
        'target' => TYPO3\CMS\Make\Controller\Backend\ContentBlocksGuiController::class . '::editAction'
    ],
    'make_content_block_duplicate' => [
        'path' => '/make/content-blocks/gui/duplicate',
        'target' => TYPO3\CMS\Make\Controller\Backend\ContentBlocksGuiController::class . '::duplicateAction'
    ],
];
