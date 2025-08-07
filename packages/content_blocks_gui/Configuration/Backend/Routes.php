<?php

return [
    'make_content_block_edit' => [
        'path' => '/make/content-blocks/gui/{type}',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::editAction'
    ],
    'make_content_block_delete' => [
        'path' => '/make/content-blocks/gui/delete',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::deleteAction'
    ],
];
