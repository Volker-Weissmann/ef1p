/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { report } from '../utility/analytics';

// If the hash ends with one of the following endings, remove the ending.
const endings = ['.', ',', ':', '?', '!', ')', '.)', '?)', '!)'];
function sanitize(hash: string): string {
    for (const ending of endings) {
        if (hash.endsWith(ending)) {
            return hash.slice(0, -ending.length);
        }
    }
    return hash;
}

/* Animated scrolling to anchor with updating window title and browser history. */

export const originalTitle = document.title;

export function getTitle(hashOrElement: string | HTMLElement) {
    return originalTitle + ' at ' + $(hashOrElement as any).text();
};

export function scrollToAnchor(hash: string, trigger: 'load' | 'hash' | 'link' | 'jump' | 'expand' | 'code' = 'code'): boolean {
    if (!/^#[^ ]+$/.test(hash)) {
        return false;
    }

    const parts = hash.split('&');
    if (parts.length > 1) {
        hash = parts[0];
    }

    const anchor = trigger === 'load' ? sanitize(hash) : hash;
    const url = window.location.pathname + anchor;
    const target = document.getElementById(anchor.slice(1));
    if (!target) {
        if (trigger === 'load') {
            report('Not found', { Type: 'Anchor', Anchor: anchor });
        }
        return false;
    }

    const details = target.closest('details');
    if (details !== null) {
        details.classList.remove('d-none');
        details.open = true;
        if (anchor === '#cite-this-article') {
            report('Cite article', { Trigger: trigger });
        }
    }

    let margin = 0;
    const content = target.closest('.tabbed > *') as HTMLElement;
    if (content !== null) {
        const container = $(content.parentElement!);
        const children = container.children();
        const tabs = children.eq(0).children();
        tabs.removeClass('active');
        tabs.eq(Array.from(children).indexOf(content) - 1).addClass('active');
        children.removeClass('shown');
        $(content).addClass('shown');
        margin = 20;
    }

    const offset = $(target).offset();
    if (offset === undefined) {
        return false;
    }

    if (trigger !== 'load' && window.history && window.history.pushState) {
        document.title = getTitle(anchor);
        window.history.pushState(null, document.title, url);
    }

    // The native scrolling feels too slow for my taste and cannot be changed:
    // window.scrollTo({ top: offset.top - 75 - margin, behavior: 'smooth' });
    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('html, body').animate({ scrollTop: offset.top - 75 - margin }, prefersReduced ? 0 : 500);

    if (parts.length > 1) {
        if (window.handleToolUpdate) {
            window.handleToolUpdate(parts);
        } else {
            console.error('scrolling.ts: There is no handler for tool updates on this page.');
        }
    }

    if (trigger === 'load') {
        report('Load target', {
            Anchor: anchor,
            interactive: false, // This excludes the event from bounce-rate calculations, see https://plausible.io/docs/custom-event-goals#trigger-custom-events-manually-with-a-javascript-function.
        });
    }

    return true;
};
