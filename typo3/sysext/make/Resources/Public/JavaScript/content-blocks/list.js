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
import AjaxRequest from"@typo3/core/ajax/ajax-request.js";class ContentBlockList{constructor(){this.init()}init(){document.querySelectorAll("#content-blocks .content-block-download").forEach((t=>{t.addEventListener("click",(e=>{e.preventDefault(),this.downloadAction(t.getAttribute("data-name"))}))}))}downloadAction(t){new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb).post({name:t},{headers:{"Content-Type":"application/json",Accept:"application/zip"}}).then((async e=>{const o=e.raw(),n=await o.blob(),c=o.headers.get("content-disposition");let a=t+".zip";if(c){const t=c.match(/filename="?([^"]+)"?/);t&&t.length>1&&(a=t[1])}a=a.replace(/"+$/,"");const i=window.URL.createObjectURL(n),l=document.createElement("a");l.href=i,l.setAttribute("download",a),document.body.appendChild(l),l.click()})).catch((t=>{console.error(t)}))}}export default new ContentBlockList;