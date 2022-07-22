<?php

declare(strict_types=1);

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

namespace TYPO3\CMS\ContentBlocks\BackendController;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Template\Components\ButtonBar;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\Template\ModuleTemplateFactory;
use TYPO3\CMS\Core\Imaging\Icon;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Page\PageRenderer;

/**
 * @internal
 */
class ContentBlocksController
{
    const ROUTE_IDENTIFIER = 'tools_contentblocks';

    public function __construct(
        protected readonly IconFactory $iconFactory,
        protected readonly ModuleTemplateFactory $moduleTemplateFactory,
        protected readonly PageRenderer $pageRenderer,
        protected readonly UriBuilder $uriBuilder,
    ) {
    }

    public function overviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $view = $this->moduleTemplateFactory->create($request);
        $this->configureDocHeader($view, $request->getAttribute('normalizedParams')->getRequestUri());
        $view->setTitle(
            $this->getLanguageService()->sL(
                'LLL:EXT:content_blocks/Resources/Private/Language/locallang_module.xlf:mlang_tabs_tab'
            )
        );

        $this->addJavascriptGlobals();

        return $view->renderResponse('Overview');
    }

    public function newAction(ServerRequestInterface $request): ResponseInterface
    {
        $view = $this->moduleTemplateFactory->create($request);
        $this->configureDocHeader($view, $request->getAttribute('normalizedParams')->getRequestUri());
        $view->setTitle(
            $this->getLanguageService()->sL(
                'LLL:EXT:content_blocks/Resources/Private/Language/locallang_module.xlf:mlang_tabs_tab'
            )
        );

        $this->addJavascriptGlobals();

        return $view->renderResponse('New');
    }

    public function editAction(ServerRequestInterface $request): ResponseInterface
    {
        $view = $this->moduleTemplateFactory->create($request);
        $this->configureDocHeader($view, $request->getAttribute('normalizedParams')->getRequestUri());
        $view->setTitle(
            $this->getLanguageService()->sL(
                'LLL:EXT:content_blocks/Resources/Private/Language/locallang_module.xlf:mlang_tabs_tab'
            )
        );

        $this->addJavascriptGlobals();

        $cType = $request->getQueryParams()['cType'] ?? null;
        if ($cType === null) {
            $view->assign('new', 1);
        } else {
            $view->assign('cType', $cType);
        }

        return $view->renderResponse('Edit');
    }

    protected function configureDocHeader(ModuleTemplate $view, string $requestUri): void
    {
        $buttonBar = $view->getDocHeaderComponent()->getButtonBar();

        $addButton = $buttonBar->makeLinkButton()
            ->setHref('#')
            ->setDataAttributes(['identifier' => 'contentblocks.action.create'])
            ->setTitle(
                $this->getLanguageService()->sL(
                    'LLL:EXT:content_blocks/Resources/Private/Language/locallang_module.xlf:contentblocks.action.create'
                )
            )
            ->setIcon($this->iconFactory->getIcon('actions-add', Icon::SIZE_SMALL))
            ->setShowLabelText(true);
        $buttonBar->addButton($addButton);

        $reloadButton = $buttonBar->makeLinkButton()
            ->setHref($requestUri)
            ->setTitle(
                $this->getLanguageService()->sL(
                    'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.reload'
                )
            )
            ->setIcon($this->iconFactory->getIcon('actions-refresh', Icon::SIZE_SMALL));
        $buttonBar->addButton($reloadButton, ButtonBar::BUTTON_POSITION_RIGHT, 2);

        $shortcutButton = $buttonBar->makeShortcutButton()
            ->setRouteIdentifier(self::ROUTE_IDENTIFIER)
            ->setDisplayName(
                $this->getLanguageService()->sL(
                    'LLL:EXT:content_blocks/Resources/Private/Language/locallang_module.xlf:mlang_labels_tablabel'
                )
            );
        $buttonBar->addButton($shortcutButton, ButtonBar::BUTTON_POSITION_RIGHT, 2);
    }

    protected function getLanguageService(): LanguageService
    {
        return $GLOBALS['LANG'];
    }

    protected function addJavascriptGlobals()
    {
        $this->pageRenderer->addInlineSetting(
            'urls',
            'contentblocks/contentBlock/edit',
            (string)$this->uriBuilder->buildUriFromRoute(
                ContentBlocksController::ROUTE_IDENTIFIER . '/contentBlock/edit'
            )
        );

        $this->pageRenderer->addInlineLanguageLabelFile(
            'EXT:content_blocks/Resources/Private/Language/locallang_module.xlf',
            '',
        );
        $this->pageRenderer->addInlineLanguageLabelFile(
            'EXT:content_blocks/Resources/Private/Language/locallang_definition.xlf',
            '',
        );
    }
}
