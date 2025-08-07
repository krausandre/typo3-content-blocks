<?php

/**
 * Definitions of AJAX routes provided by EXT:make
 */
return [
    'content_blocks_gui_download_cb' => [
        'path' => '/contentblocks/gui/cb/download',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::downloadCbAction',
    ],
    'content_blocks_gui_save_content_type' => [
        'path' => '/contentblocks/gui/contenttype/save',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::saveContentTypeAction',
    ],
    'content_blocks_gui_translate_cb' => [
        'path' => '/contentblocks/gui/cb/translate',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::translateCbAction',
    ],
    'content_blocks_gui_list_icons' => [
        'path' => '/contentblocks/gui/icons/list',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::listIconsAction',
    ],
    'content_blocks_gui_list_basics' => [
        'path' => '/contentblocks/gui/basics/list',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::listBasicsAction',
    ],
    'content_blocks_gui_get_basics' => [
        'path' => '/contentblocks/gui/basics/get',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::getBasicAction',
    ],
    'content_blocks_gui_get_translation' => [
        'path' => '/contentblocks/gui/translation/get',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::getTranslationAction',
    ],
    'content_blocks_gui_save_translation' => [
        'path' => '/contentblocks/gui/translation/save',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::saveTranslationAction',
    ],
];
