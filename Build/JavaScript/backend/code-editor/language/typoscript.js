import DocumentService from '@typo3/core/document-service';
import { StreamLanguage, LanguageSupport } from '@codemirror/language';
import { TypoScriptStreamParserFactory } from '../stream-parser/typoscript';
import { TsCodeCompletion } from '../autocomplete/ts-code-completion';
import { syntaxTree } from '@codemirror/language';
/**
 * Module: @typo3/backend/code-editor/language/typoscript
 *
 * Entry Point module for CodeMirror v6 language highlighting and code completion for TypoScript.
 * This module combines our CodeMirror v5 style typoscript parser (via the StreamLanguage shim) and
 * our CodeMirror v5 style TypoScript hinter (via an own CodeMirror v5 state shim).
 *
 * @todo: This is ideally to be replaced by an own CodeMirror v6 style parser/completion logic
 *        based on lezer.codemirror.net at some point.
 */
export function typoscript() {
    const language = StreamLanguage.define(new TypoScriptStreamParserFactory().create());
    const completion = language.data.of({
        autocomplete: complete
    });
    return new LanguageSupport(language, [completion]);
}
const tsCodeCompletionInitializer = (async () => {
    await DocumentService.ready();
    const effectivePid = parseInt(document.querySelector('input[name="effectivePid"]')?.value, 10);
    return new TsCodeCompletion(effectivePid);
})();
export async function complete(context) {
    if (!context.explicit) {
        return null;
    }
    const cm5state = parseCodeMirror5CompatibleCompletionState(context);
    const tokenPos = context.pos - (cm5state.completingAfterDot ? 1 : 0);
    const token = syntaxTree(context.state).resolveInner(tokenPos, -1);
    const tokenValue = token.name === 'Document' || cm5state.completingAfterDot ? '' : context.state.sliceDoc(token.from, tokenPos);
    const completionStart = token.name === 'Document' || cm5state.completingAfterDot ? context.pos : token.from;
    let tokenMetadata = {
        start: token.from,
        end: tokenPos,
        string: tokenValue,
        type: token.name
    };
    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(tokenValue)) {
        tokenMetadata = {
            start: context.pos,
            end: context.pos,
            string: '',
            type: tokenValue === '.' ? 'property' : null
        };
    }
    cm5state.token = tokenMetadata;
    const tsCodeCompletion = await tsCodeCompletionInitializer;
    const keywords = tsCodeCompletion.refreshCodeCompletion(cm5state);
    if ((token.name === 'string' || token.name === 'comment') && tokenIsSubStringOfKeywords(tokenValue, keywords)) {
        return null;
    }
    const completions = getCompletions(tokenValue, keywords);
    return {
        from: completionStart,
        options: completions.map((result) => {
            return { label: result, type: 'keyword' };
        })
    };
}
function parseCodeMirror5CompatibleCompletionState(context) {
    const lineCount = context.state.sliceDoc().split(context.state.lineBreak).length;
    const currentLineNumber = context.state.sliceDoc(0, context.pos).split(context.state.lineBreak).length;
    const currentLine = context.state.sliceDoc().split(context.state.lineBreak)[currentLineNumber - 1];
    const lastChar = context.state.sliceDoc(context.pos - 1, context.pos);
    const completingAfterDot = lastChar === '.';
    const lineTokens = extractCodemirror5StyleLineTokens(lineCount, context);
    return {
        lineTokens,
        currentLineNumber,
        currentLine,
        lineCount,
        completingAfterDot
    };
}
function extractCodemirror5StyleLineTokens(lineCount, context) {
    const lineTokens = Array(lineCount).fill('').map(() => []);
    let lastToken = 0;
    let lineNumber = 1;
    syntaxTree(context.state).cursor().iterate((node) => {
        const type = node.type.name || node.name;
        if (type === 'Document') {
            return;
        }
        const start = node.from;
        const end = node.to;
        // syntaxTree(..).cursor().iterate() doesn't deliver all tokens that we are interested in (like dots) – that is because our legacy
        // stream parser doesn't perform proper tokenization.
        // Insert content as null-type token into the lineToken array.
        if (lastToken < start) {
            context.state.sliceDoc(lastToken, start).split(context.state.lineBreak).forEach((part) => {
                if (part) {
                    lineTokens[Math.min(lineNumber - 1, lineCount - 1)].push({ type: null, string: part, start: lastToken, end: lastToken + part.length });
                    lineNumber++;
                    lastToken += part.length;
                }
            });
        }
        const string = context.state.sliceDoc(node.from, node.to);
        lineNumber = context.state.sliceDoc(0, node.from).split(context.state.lineBreak).length;
        lineTokens[lineNumber - 1].push({ type, string, start, end });
        lastToken = end;
    });
    if (lastToken < context.state.doc.length) {
        lineTokens[lineNumber - 1].push({ type: null, string: context.state.sliceDoc(lastToken), start: lastToken, end: context.state.doc.length });
    }
    return lineTokens;
}
function tokenIsSubStringOfKeywords(token, keywords) {
    const tokenLength = token.length;
    for (let i = 0; i < keywords.length; ++i) {
        if (token === keywords[i].substr(tokenLength)) {
            return true;
        }
    }
    return false;
}
function getCompletions(token, keywords) {
    const found = new Set();
    const maybeAdd = (str) => {
        if (str.lastIndexOf(token, 0) === 0 && !found.has(str)) {
            found.add(str);
        }
    };
    for (let i = 0, e = keywords.length; i < e; ++i) {
        maybeAdd(keywords[i]);
    }
    const completions = Array.from(found);
    completions.sort();
    return completions;
}
