<?php

return [
    'make_content_block_edit' => [
        'path' => '/make/content-blocks/gui/edit',
        'target' => TYPO3\CMS\Make\Controller\Backend\ContentBlocksGuiController::class . '::editAction',
        'redirect' => [
            'enable' => true,
            'parameters' => [
                'edit' => true,
            ],
        ],
    ],
];
