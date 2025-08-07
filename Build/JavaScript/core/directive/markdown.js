import { marked } from 'marked';
import dompurify, {} from 'dompurify';
import { html } from 'lit';
import { until } from 'lit/directives/until';
import { unsafeHTML } from 'lit/directives/unsafe-html';
/**
 * Parse `markdown` as markdown and render as lit HTML.
 *
 * @example
 *
 * ```
 *   html`<div class="description">${markdown(myDescription, 'minimal')}</div>`
 * ```
 *
 * @internal
 */
export const markdown = (markdown, profile = 'default') => html `${until(render(markdown, profiles[profile]), markdown)}`;
dompurify.addHook('afterSanitizeAttributes', (node) => {
    if ('target' in node && !node.hasAttribute('target')) {
        node.setAttribute('target', '_blank');
    }
});
const profiles = {
    minimal: {
        markdown: {
            gfm: true,
            pedantic: false,
        },
        dompurify: {
            ALLOWED_TAGS: ['a', 'blockquote', 'br', 'code', 'kbd', 'li', 'p', 'pre', 'strong', 'ul', 'ol'],
            ALLOWED_ATTR: ['href', 'target', 'title', 'role'],
        },
    },
    default: {
        markdown: {
            gfm: true,
            pedantic: false,
        },
        dompurify: {
            USE_PROFILES: {
                html: true,
            },
        },
    },
};
async function render(markdown, config) {
    let parsed, sanitized;
    try {
        parsed = await marked.parse(markdown, {
            async: true,
            ...config.markdown,
        });
    }
    catch (e) {
        console.error('Invalid Markdown', markdown, e);
        return markdown;
    }
    try {
        sanitized = dompurify.sanitize(parsed, config.dompurify);
    }
    catch (e) {
        console.error('Invalid HTML', parsed, e);
        return markdown;
    }
    return unsafeHTML(sanitized);
}
