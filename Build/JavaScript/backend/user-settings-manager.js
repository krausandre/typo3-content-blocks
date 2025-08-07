/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read theÍ
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
import { BroadcastMessage } from '@typo3/backend/broadcast-message';
import BroadcastService from '@typo3/backend/broadcast-service';
var Identifier;
(function (Identifier) {
    Identifier["colorSchemeSwitch"] = "typo3-backend-color-scheme-switch";
})(Identifier || (Identifier = {}));
class UserSettingsManager {
    constructor() {
        // triggered by
        //  * <typo3-backend-color-scheme-switch> (topbar) or
        //  * User setup module (via BackendUtility::setUpdateSignal('updateColorScheme', …))
        document.addEventListener('typo3:color-scheme:update', e => this.onColorSchemeUpdate(e.detail));
        //  triggered by user setup module (via BackendUtility::setUpdateSignal('updateColorScheme', …))
        document.addEventListener('typo3:theme:update', e => this.onThemeUpdate(e.detail));
        //  triggered by user setup module (via BackendUtility::setUpdateSignal('updateTitleFormat', …))
        document.addEventListener('typo3:title-format:update', e => this.onTitleFormatUpdate(e.detail));
        //  triggered by user setup module (via BackendUtility::setUpdateSignal('updateBackendLanguage', …))
        document.addEventListener('typo3:backend-language:update', e => this.onBackendLanguageFormatUpdate(e.detail));
        // broadcast message by other instances
        document.addEventListener('typo3:color-scheme:broadcast', e => this.activateColorScheme(e.detail.payload.colorScheme));
        document.addEventListener('typo3:theme:broadcast', e => this.activateTheme(e.detail.payload.theme));
        document.addEventListener('typo3:title-format:broadcast', e => this.activateTitleFormat(e.detail.payload.format));
        document.addEventListener('typo3:backend-language:broadcast', e => this.updateBackendLanguage(e.detail.payload.language, e.detail.payload.direction));
    }
    onColorSchemeUpdate(data) {
        const { colorScheme } = data;
        this.activateColorScheme(colorScheme);
        // broadcast to other instances
        BroadcastService.post(new BroadcastMessage('color-scheme', 'broadcast', { colorScheme }));
    }
    onThemeUpdate(data) {
        const { theme } = data;
        this.activateTheme(theme);
        // broadcast to other instances
        BroadcastService.post(new BroadcastMessage('theme', 'broadcast', { theme }));
    }
    onTitleFormatUpdate(data) {
        const { format } = data;
        this.activateTitleFormat(format);
        // broadcast to other instances
        BroadcastService.post(new BroadcastMessage('title-format', 'broadcast', { format }));
    }
    onBackendLanguageFormatUpdate(data) {
        const { language, direction } = data;
        this.updateBackendLanguage(language, direction);
        // broadcast to other instances
        BroadcastService.post(new BroadcastMessage('language-update', 'broadcast', { language, direction }));
    }
    activateColorScheme(colorScheme) {
        const colorSchemeSwitch = document.querySelector(Identifier.colorSchemeSwitch);
        if (colorSchemeSwitch) {
            colorSchemeSwitch.activeColorScheme = colorScheme;
        }
        this.setStyleChangingDocumentAttribute('data-color-scheme', colorScheme);
    }
    activateTheme(theme) {
        this.setStyleChangingDocumentAttribute('data-theme', theme);
    }
    activateTitleFormat(format) {
        if (format === 'sitenameFirst') {
            document.querySelector('typo3-backend-module-router')?.setAttribute('sitename-first', '');
        }
        else {
            document.querySelector('typo3-backend-module-router')?.removeAttribute('sitename-first');
        }
    }
    updateBackendLanguage(language, direction) {
        const rootEl = document.documentElement;
        const frame = window.frames.list_frame?.document.documentElement;
        rootEl.setAttribute('lang', language);
        frame?.setAttribute('lang', language);
        if (direction !== null) {
            rootEl.setAttribute('dir', direction);
            frame?.setAttribute('dir', direction);
        }
        else {
            rootEl.removeAttribute('dir');
            frame?.removeAttribute('dir');
        }
    }
    async setStyleChangingDocumentAttribute(attributeName, attributeValue) {
        const rootEl = document.documentElement;
        const frame = window.frames.list_frame?.document.documentElement;
        const action = () => {
            rootEl.classList.add('t3js-disable-transitions');
            frame?.classList.add('t3js-disable-transitions');
            rootEl.setAttribute(attributeName, attributeValue);
            frame?.setAttribute(attributeName, attributeValue);
        };
        const cleanup = () => {
            rootEl.classList.remove('t3js-disable-transitions');
            frame?.classList.remove('t3js-disable-transitions');
        };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            // The fallback condition in the next line (currently needed for firefox) can be removed
            // once view transitions enter baseline "Widely available":
            // https://webstatus.dev/features/view-transitions?q=view+transition
            !('startViewTransition' in document) || typeof document.startViewTransition !== 'function') {
            action();
            // await animation frame in order for the transition disable to be
            // considered by the time the change-transitions are being started.
            await new Promise(resolve => requestAnimationFrame(resolve));
            if (frame) {
                await new Promise(resolve => window.frames.list_frame.requestAnimationFrame(resolve));
            }
            cleanup();
            return;
        }
        await document.startViewTransition(action).finished;
        cleanup();
    }
}
export default new UserSettingsManager();
