<?php

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use TYPO3\CMS\Make\Controller\Backend\ContentBlocksGuiController;
use TYPO3\CMS\Make\Controller\Backend\AjaxController;

$_LLL_mod = 'LLL:EXT:make/Resources/Private/Language/locallang_mod.xlf:';
return [
    'web_ContentBlocksGui' => [
        'parent' => 'tools',
        'position' => ['after' => 'web_info'],
        'access' => 'admin',
        'workspaces' => 'live',
        'icon' => 'EXT:content_blocks_gui/Resources/Public/Icons/Extension.svg',
        'path' => '/module/web/ContentBlocksGui',
        'labels' =>  [
            'title' => $_LLL_mod . 'content-blocks-gui'
        ],
        'routes' => [
            '_default' => [
                'target' => ContentBlocksGuiController::class . '::indexAction',
            ],
        ],
//        'controllerActions' => [
//            ContentBlocksGuiController::class => [
//                'list',
//            ],
//            AjaxController::class => [
//                'listCb',
//                'createCb',
//                'getCb',
//                'deleteCb',
//                'getCb',
//                'translateCb',
//                'saveCb',
//                'downloadCb',
//                'copyCb',
//                'listExt',
//            ]
//        ],
    ],
];
