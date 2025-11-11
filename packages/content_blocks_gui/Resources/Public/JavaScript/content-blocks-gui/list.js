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
import k from"@typo3/core/ajax/ajax-request.js";import v from"@typo3/backend/modal.js.js";import{lll as f}from"@typo3/core/lit-helper.js";import{SeverityEnum as g}from"@typo3/backend/enum/severity.js";class w{constructor(){console.log("[ContentBlockList] Constructor called"),this.init()}init(){document.querySelectorAll("#content-blocks .content-block-download").forEach(e=>{e.addEventListener("click",n=>{n.preventDefault(),this.downloadAction(e.getAttribute("data-name"))})}),document.querySelectorAll("#content-blocks .content-block-delete").forEach(e=>{e.addEventListener("click",n=>{n.preventDefault(),this.handleRemove(e.getAttribute("href"))})}),document.querySelectorAll("#content-blocks .content-block-duplicate").forEach(e=>{e.addEventListener("click",n=>{n.preventDefault();const t=e.getAttribute("data-name"),o=e.getAttribute("data-extension"),i=e.getAttribute("href");this.handleDuplicate(t,o,i)})})}downloadAction(l){new k(TYPO3.settings.ajaxUrls.content_blocks_gui_download_cb).post({name:l},{headers:{"Content-Type":"application/json",Accept:"application/zip"}}).then(async a=>{const e=a.raw(),n=await e.blob(),t=e.headers.get("content-disposition");let o=l+".zip";if(t){const c=t.match(/filename="?([^"]+)"?/);c&&c.length>1&&(o=c[1])}o=o.replace(/"+$/,"");const i=window.URL.createObjectURL(n),r=document.createElement("a");r.href=i,r.setAttribute("download",o),document.body.appendChild(r),r.click()}).catch(a=>{console.error(a)})}handleRemove(l){const a=v.confirm(f("make.remove.confirm.title"),f("make.remove.confirm.message"),g.warning,[{text:f("make.remove.button.close"),active:!0,btnClass:"btn-default",name:"cancel"},{text:f("make.remove.button.ok"),btnClass:"btn-warning remove-button",name:"delete"}]);a.addEventListener("button.clicked",e=>{e.target.getAttribute("name")==="delete"&&(window.location.href=l),a.hideModal()})}handleDuplicate(l,a,e){const n=l.split("/"),t=n[0]||"",o=n[1]||"",i=document.createElement("div");i.innerHTML=`
      <form id="duplicate-content-block-form">
        <div class="form-group mb-3">
          <label for="duplicate-extension" class="form-label">Extension</label>
          <input type="text" class="form-control" id="duplicate-extension" name="extension" value="${a}" required>
          <div class="form-text">The extension where the duplicated content block will be stored</div>
        </div>
        <div class="form-group mb-3">
          <label for="duplicate-vendor" class="form-label">Vendor Name</label>
          <input type="text" class="form-control" id="duplicate-vendor" name="vendor" value="${t}" required pattern="[a-z0-9\\-]+">
          <div class="form-text">Lowercase letters, numbers, and hyphens only</div>
        </div>
        <div class="form-group mb-3">
          <label for="duplicate-name" class="form-label">Content Block Name</label>
          <input type="text" class="form-control" id="duplicate-name" name="name" value="${o}-copy" required pattern="[a-z0-9\\-]+">
          <div class="form-text">Lowercase letters, numbers, and hyphens only</div>
          <div id="duplicate-name-error" class="text-danger d-none">The new name must be different from the original</div>
        </div>
      </form>
    `;const r=v.advanced({title:"Duplicate Content Block",content:i,severity:g.info,size:v.sizes.medium,buttons:[{text:"Cancel",active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>{r.hideModal()}},{text:"Duplicate",btnClass:"btn-primary",name:"duplicate",trigger:()=>{this.validateAndSubmitDuplicate(l,t,o,e,r)&&r.hideModal()}}]})}validateAndSubmitDuplicate(l,a,e,n,t){const o=t.querySelector("#duplicate-content-block-form");if(!o)return!1;const i=t.querySelector("#duplicate-extension"),r=t.querySelector("#duplicate-vendor"),c=t.querySelector("#duplicate-name"),d=t.querySelector("#duplicate-name-error"),s=t.querySelector("#duplicate-name"),b=i?.value,u=r?.value,m=c?.value;if(!b||!u||!m)return console.error("[ContentBlockList] Missing form values"),!1;const h=/^[a-z0-9\-]+$/;if(!h.test(u)||!h.test(m))return console.error("[ContentBlockList] Invalid pattern"),o.checkValidity()||o.reportValidity(),!1;if(u===a&&m===e)return d&&d.classList.remove("d-none"),s&&(s.classList.add("is-invalid"),s.focus()),!1;d&&d.classList.add("d-none"),s&&s.classList.remove("is-invalid");const p=new URL(n,window.location.origin);return p.searchParams.append("targetExtension",b),p.searchParams.append("targetVendor",u),p.searchParams.append("targetName",m),window.location.href=p.toString(),!0}}var x=new w;export{x as default};
