<?php

/**
 * Definitions of AJAX routes provided by EXT:make
 */
return [
    'content_blocks_gui_download_cb' => [
        'path' => '/contentblocks/gui/cb/download',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::downloadCbAction',
    ],
    'content_blocks_gui_download_basic' => [
        'path' => '/contentblocks/gui/basic/download',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::downloadBasicAction',
    ],
    'content_blocks_gui_save_content_type' => [
        'path' => '/contentblocks/gui/contenttype/save',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::saveContentTypeAction',
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
    'content_blocks_gui_list_by_type' => [
        'path' => '/contentblocks/gui/list/bytype',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::listByTypeAction',
    ],
    'content_blocks_gui_save_cb' => [
        'path' => '/contentblocks/gui/cb/save',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::saveAction',
    ],
    'content_blocks_gui_save_cb_and_close' => [
        'path' => '/contentblocks/gui/cb/save-and-close',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::saveContentBlockAndCloseAction',
    ],
    'content_blocks_gui_validate_record_duplication' => [
        'path' => '/contentblocks/gui/recordtype/validate-duplication',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::validateRecordTypeDuplicationAction',
    ],
    'content_blocks_gui_multi_download' => [
        'path' => '/contentblocks/gui/multi/download',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::multiDownloadAction',
    ],
    'content_blocks_gui_upload' => [
        'path' => '/contentblocks/gui/upload',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::uploadAndAnalyzeAction',
    ],
    'content_blocks_gui_import' => [
        'path' => '/contentblocks/gui/import',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::executeImportAction',
    ],
    // Basics save AJAX endpoint - Returns JSON, stays in editor
    'content_blocks_gui_save_basic_ajax' => [
        'path' => '/contentblocks/gui/basics/save/ajax',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\AjaxController::class . '::saveBasicAjaxAction',
    ],
    // Basics save & close endpoint - Uses form POST with redirect (needs to be in AjaxRoutes for TYPO3.settings.ajaxUrls)
    'content_block_gui_api_basics_save' => [
        'path' => '/content-block-gui/api/basics/save',
        'target' => FriendsOfTYPO3\ContentBlocksGui\Controller\Backend\ContentBlocksGuiController::class . '::saveBasicApiAction',
    ],
];
