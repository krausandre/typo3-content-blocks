<?php

/**
 * Definitions for routes provided by EXT:content_blocks_gui
 */
return [
    'content_blocks_gui_list_cb' => [
        'path' => '/contentblocks/gui/cb/list',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::listCbAction',
    ],
    'content_blocks_gui_get_cb' => [
        'path' => '/contentblocks/gui/cb/get',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::getCbAction',
    ],
    'content_blocks_gui_delete_cb' => [
        'path' => '/contentblocks/gui/cb/delete',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::deleteCbAction',
    ],
    'content_blocks_gui_translate_cb' => [
        'path' => '/contentblocks/gui/cb/translate',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::translateCbAction',
    ],
    'content_blocks_gui_save_content_type' => [
        'path' => '/contentblocks/gui/contenttype/save',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::saveContentTypeAction',
    ],
    'content_blocks_gui_download_cb' => [
        'path' => '/contentblocks/gui/cb/download',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::downloadCbAction',
    ],
    'content_blocks_gui_list_ext' => [
        'path' => '/contentblocks/gui/ext/list',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::listExtAction',
    ],
    'content_blocks_gui_list_icons' => [
        'path' => '/contentblocks/gui/icons/list',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::listIconsAction',
    ],
    'content_blocks_gui_list_groups' => [
        'path' => '/contentblocks/gui/groups/list',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::listGroupsAction',
    ],
    'content_blocks_gui_list_basics' => [
        'path' => '/contentblocks/gui/basics/list',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::listBasicsAction',
    ],
    'content_blocks_gui_get_basics' => [
        'path' => '/contentblocks/gui/basics/get',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::getBasicAction',
    ],
    'content_blocks_gui_get_translation' => [
        'path' => '/contentblocks/gui/translation/get',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::getTranslationAction',
    ],
    'content_blocks_gui_save_translation' => [
        'path' => '/contentblocks/gui/translation/save',
        'target' => TYPO3\CMS\Make\Controller\Backend\AjaxController::class . '::saveTranslationAction',
    ],
];
