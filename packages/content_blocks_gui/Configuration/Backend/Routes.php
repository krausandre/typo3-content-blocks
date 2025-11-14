<?php

return [
    'content_block_gui_content_block_modify' => [
        'path' => '/content-block-gui/content-block/modify/{type}',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::editAction'
    ],
    'content_block_gui_content_block_delete' => [
        'path' => '/content-block-gui/content-block/delete',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::deleteAction'
    ],
    'content_block_gui_content_block_duplicate' => [
        'path' => '/content-block-gui/content-block/duplicate',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::duplicateAction'
    ],
    'content_block_gui_basic_modify' => [
        'path' => '/content-block-gui/basic/modify/{type}',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::editBasicAction'
    ],
    'content_block_gui_basic_delete' => [
        'path' => '/content-block-gui/basic/delete',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::deleteBasicAction'
    ],
    'content_block_gui_basic_duplicate' => [
        'path' => '/content-block-gui/basic/duplicate',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::duplicateBasicAction'
    ],
    // Basics API endpoints
    'content_block_gui_api_basics_list' => [
        'path' => '/content-block-gui/api/basics/list',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::listBasicsApiAction'
    ],
    'content_block_gui_api_basics_load' => [
        'path' => '/content-block-gui/api/basics/load',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::loadBasicApiAction'
    ],
    // Basics save endpoint moved to AjaxRoutes.php (required for TYPO3.settings.ajaxUrls in JavaScript)
    // 'content_block_gui_api_basics_save' => [
    //     'path' => '/content-block-gui/api/basics/save',
    //     'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::saveBasicApiAction'
    // ],
    'content_block_gui_api_basics_validate' => [
        'path' => '/content-block-gui/api/basics/validate',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::validateBasicApiAction'
    ],
    'content_block_gui_api_basics_usage' => [
        'path' => '/content-block-gui/api/basics/usage',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::getBasicUsageApiAction'
    ],
];
