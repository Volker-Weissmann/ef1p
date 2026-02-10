/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { generateFragmentFromRange, GenerateFragmentStatus } from 'text-fragments-polyfill/dist/fragment-generation-utils.js';

function getPreviousSiblingWithTextContent(node: Node): Node {
    if (node.previousSibling !== null) {
        if (node.previousSibling.textContent!.trim() !== '' && node.previousSibling.nodeName.toLowerCase() !== 'svg') {
            return node.previousSibling;
        } else {
            return getPreviousSiblingWithTextContent(node.previousSibling);
        }
    } else  {
        return getPreviousSiblingWithTextContent(node.parentNode!);
    }
}

export function generateTextFragmentFromCurrentSelection(): string | null {
    const selection = window.getSelection();
    if (selection === null || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    // If you triple-click a block element in Chrome, the selection ends at the start of the next block,
    // which causes text-fragments-polyfill to include the whole next block in the selection as well.
    if (range.endOffset === 0) {
        range.setEnd(getPreviousSiblingWithTextContent(range.endContainer), 1);
    }
    // If you triple-click a block element in Firefox which ends with a character or a period (and not a question mark, colon, newline, etc.),
    // text-fragments-polyfill changes the selection to the last word of the block element when generating the fragment from the range.
    if (range.startOffset === 0 && range.startContainer.nodeType === Node.ELEMENT_NODE) {
        range.startContainer.appendChild(document.createTextNode(' '));
    }

    const result = generateFragmentFromRange(range);
    if (result.status !== GenerateFragmentStatus.SUCCESS || result.fragment === undefined) {
        return null;
    }

    const { prefix, textStart, textEnd, suffix } = result.fragment;

    // 'text-fragments-polyfill' gives inconsistent results depending on the generation path.
    // By replacing newlines and lowercasing ourselves, we ensure consistent behavior.
    const normalize = (s: string) => s.normalize('NFKD').replace(/\s+/g, ' ').trim().toLowerCase();

    // We also encode '-', ',', '&' inside terms because they are directive syntax characters.
    const encode = (s: string) => encodeURIComponent(normalize(s)).replace(/-/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%26');

    let fragment = ':~:text=';
    if (prefix) {
        fragment += encode(prefix) + '-,';
    }
    fragment += encode(textStart);
    if (textEnd) {
        fragment += ',' + encode(textEnd);
    }
    if (suffix) {
        fragment += ',-' + encode(suffix);
    }
    return fragment;
}
