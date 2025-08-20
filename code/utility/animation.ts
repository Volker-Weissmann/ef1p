/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { copyToClipboard } from './clipboard';

// See https://www.sitepoint.com/css3-animation-javascript-event-handlers/ (oanimationend is Opera):
const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

export type AnimationEffect = 'scale125' | 'scale150' | 'scale200' | 'scale400';

export async function copyToClipboardWithAnimation(
    text: string,
    target: HTMLElement,
    effect: AnimationEffect = 'scale150',
): Promise<boolean> {
    if (await copyToClipboard(text)) {
        const element = $(target);
        element.addClass(effect).one(animationEnd, () => element.removeClass(effect));
        return true;
    } else {
        return false;
    }
}
