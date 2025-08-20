/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { KeyboardEvent, MouseEvent } from 'react';

import { AnimationEffect, copyToClipboardWithAnimation } from '../utility/animation';

import { Children } from './utility';

async function copy(target: EventTarget & HTMLSpanElement): Promise<void> {
    if (await copyToClipboardWithAnimation(
        target.innerText + (target.dataset.newline === 'true' ? '\n' : ''),
        target,
        target.dataset.effect as AnimationEffect | undefined,
    )) {
        target.focus();
    }
}

function handleClick(event: MouseEvent<HTMLSpanElement>): void {
    copy(event.currentTarget)
}

function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        copy(event.currentTarget);
    }
}

function handleKeyUp(event: KeyboardEvent<HTMLSpanElement>): void {
    if (event.key === ' ') {
        event.preventDefault();
    }
}

export interface ClickToCopyProps {
    /**
     * The displayed title. Defaults to 'Click to copy.'.
     */
    title?: string;

    /**
     * Whether to append a newline character to the text. Defaults to false.
     */
    newline?: boolean;

    /**
     * The animation effect used to animate the span element. Defaults to 'scale150'.
     */
    effect?: AnimationEffect;
}

export function ClickToCopy({ title, newline, effect, children }: ClickToCopyProps & Children): JSX.Element {
    return <span
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className="click-to-copy"
        title={title ?? 'Click to copy.'}
        tabIndex={0}
        data-newline={newline}
        data-effect={effect}
    >
        {children}
    </span>;
}
