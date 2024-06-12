<?php

return [
    'make_content_block_list' => [
        'path' => '/make/content-blocks/gui/list',
        'target' => TYPO3\CMS\Make\Controller\Backend\ContentBlocksGuiController::class . '::indexAction'
    ],
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
    'make_content_block_delete' => [
        'path' => '/make/content-blocks/gui/delete',
        'target' => TYPO3\CMS\Make\Controller\Backend\ContentBlocksGuiController::class . '::deleteAction'
    ],
];
