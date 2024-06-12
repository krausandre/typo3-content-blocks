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
import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import Modal from"@typo3/backend/modal.js";import{lll}from"@typo3/core/lit-helper.js";import{SeverityEnum}from"@typo3/backend/enum/severity.js";class ContentBlockList{constructor(){this.init()}init(){document.querySelectorAll("#content-blocks .content-block-download").forEach((e=>{e.addEventListener("click",(t=>{t.preventDefault(),this.downloadAction(e.getAttribute("data-name"))}))})),document.querySelectorAll("#content-blocks .content-block-delete").forEach((e=>{e.addEventListener("click",(t=>{t.preventDefault(),this.handleRemove(e.getAttribute("href"))}))}))}downloadAction(e){new AjaxRequest(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb).post({name:e},{headers:{"Content-Type":"application/json",Accept:"application/zip"}}).then((async t=>{const o=t.raw(),n=await o.blob(),l=o.headers.get("content-disposition");let a=e+".zip";if(l){const e=l.match(/filename="?([^"]+)"?/);e&&e.length>1&&(a=e[1])}a=a.replace(/"+$/,"");const c=window.URL.createObjectURL(n),r=document.createElement("a");r.href=c,r.setAttribute("download",a),document.body.appendChild(r),r.click()})).catch((e=>{console.error(e)}))}handleRemove(e){const t=Modal.confirm(lll("make.remove.confirm.title"),lll("make.remove.confirm.message"),SeverityEnum.warning,[{text:lll("make.remove.button.close"),active:!0,btnClass:"btn-default",name:"cancel"},{text:lll("make.remove.button.ok"),btnClass:"btn-warning remove-button",name:"delete"}]);t.addEventListener("button.clicked",(o=>{"delete"===o.target.getAttribute("name")&&(window.location.href=e),t.hideModal()}))}}export default new ContentBlockList;