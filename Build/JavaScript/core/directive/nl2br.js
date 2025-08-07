import { html } from 'lit';
/**
 * Render a multiline string by replacing \n with <br> as lit HTML.
 *
 * @example
 *
 * ```
 *   html`<div class="description">${nl2br(myDescription)}</div>`
 * ```
 *
 * @internal
 */
export const nl2br = (text) => html `${text.split('\n').map((line, index) => index === 0 ? line : html `<br>${line}`)}`;
