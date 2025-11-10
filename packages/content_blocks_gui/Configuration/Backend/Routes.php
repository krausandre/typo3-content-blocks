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
];
