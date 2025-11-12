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
        'path' => '/content-block-gui/basic/modify',
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
];
