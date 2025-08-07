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
import d from"@typo3/core/ajax/ajax-request.js";import m from"@typo3/backend/modal.js";import{lll as c}from"@typo3/core/lit-helper.js";import{SeverityEnum as b}from"@typo3/backend/enum/severity.js";class f{constructor(){this.init()}init(){document.querySelectorAll("#content-blocks .content-block-download").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault(),this.downloadAction(e.getAttribute("data-name"))})}),document.querySelectorAll("#content-blocks .content-block-delete").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault(),this.handleRemove(e.getAttribute("href"))})})}downloadAction(e){new d(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb).post({name:e},{headers:{"Content-Type":"application/json",Accept:"application/zip"}}).then(async t=>{const n=t.raw(),l=await n.blob(),r=n.headers.get("content-disposition");let o=e+".zip";if(r){const i=r.match(/filename="?([^"]+)"?/);i&&i.length>1&&(o=i[1])}o=o.replace(/"+$/,"");const s=window.URL.createObjectURL(l),a=document.createElement("a");a.href=s,a.setAttribute("download",o),document.body.appendChild(a),a.click()}).catch(t=>{console.error(t)})}handleRemove(e){const t=m.confirm(c("make.remove.confirm.title"),c("make.remove.confirm.message"),b.warning,[{text:c("make.remove.button.close"),active:!0,btnClass:"btn-default",name:"cancel"},{text:c("make.remove.button.ok"),btnClass:"btn-warning remove-button",name:"delete"}]);t.addEventListener("button.clicked",n=>{n.target.getAttribute("name")==="delete"&&(window.location.href=e),t.hideModal()})}}var p=new f;export{p as default};
