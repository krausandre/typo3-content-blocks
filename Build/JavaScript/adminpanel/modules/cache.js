"use strict";
(() => {
    class AdminPanelCache {
        constructor() {
            this.buttons = document.querySelectorAll('[data-typo3-role="clearCacheButton"]');
            this.buttons.forEach((element) => {
                element.addEventListener('click', () => {
                    const url = element.dataset.typo3AjaxUrl;
                    const request = new XMLHttpRequest();
                    request.open('GET', url);
                    request.send();
                    request.onload = () => {
                        location.reload();
                    };
                });
            });
        }
    }
    window.addEventListener('load', () => new AdminPanelCache(), false);
})();
