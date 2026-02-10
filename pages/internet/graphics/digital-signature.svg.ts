/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { textToLineDistance } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, colorize, estimateTextSizeWithMargin, estimateTextWidthWithMargin, T, Text, TextLine } from '../../../code/svg/elements/text';

const signingText = bold('Signing');
const verifyingText = bold('Verifying');

const signerText = bold('Signer');
const verifierText = bold('Verifier');

const messageText = 'Message';
const messageSignatureText = 'Message, signature';
const validOrInvalidText = T(colorize('green', 'Valid'), ' or ', colorize('red', 'invalid'));

const privateKeyText = ['Private key', 'of signer'];
const publicKeyText = ['Public key', 'of signer'];

const size = estimateTextSizeWithMargin(verifyingText);

const horizontalGap1 = estimateTextWidthWithMargin(validOrInvalidText, 3);
const horizontalGap2 = estimateTextWidthWithMargin(messageSignatureText, 3);
const verticalGap = size.y;

const elements = new Array<VisualElement>();

const signingRectangle = new Rectangle({ position: P(horizontalGap1, -size.y / 2), size, color: 'blue' });
elements.push(...signingRectangle.withText(signingText));

const verifyingRectangle = new Rectangle({ position: P(horizontalGap1 + horizontalGap2 + size.x, -size.y / 2), size, color: 'blue' });
elements.push(...verifyingRectangle.withText(verifyingText));

const marker = 'end';

elements.unshift(...new Line({ start: P(0, 0), end: signingRectangle.boundingBox().pointAt('left'), marker }).withText(messageText));
elements.unshift(...Line.connectBoxes(signingRectangle, 'right', verifyingRectangle, 'left').withText(messageSignatureText));
elements.unshift(...new Line({
    start: verifyingRectangle.boundingBox().pointAt('right'),
    end: P(2 * horizontalGap1 + horizontalGap2 + 2 * size.x, 0),
    marker,
}).withText(validOrInvalidText));

function addKeyLine(rectangle: Rectangle, text: TextLine | TextLine[]): void {
    const end = rectangle.boundingBox().pointAt('top');
    const start = P(end.x, end.y - verticalGap);
    elements.unshift(new Line({ start, end, marker }));
    elements.unshift(new Text({
        position: start.subtractY(textToLineDistance),
        text,
        verticalAlignment: 'bottom',
    }));
}

addKeyLine(signingRectangle, privateKeyText);
addKeyLine(verifyingRectangle, publicKeyText);

elements.push(new Text({
    position: P(horizontalGap1, (-size.y / 2 - verticalGap) / 2 - textToLineDistance),
    text: signerText,
    verticalAlignment: 'bottom',
}));

elements.push(new Text({
    position: P(horizontalGap1 + horizontalGap2 + 2 * size.x, (-size.y / 2 - verticalGap) / 2 - textToLineDistance),
    text: verifierText,
    verticalAlignment: 'bottom',
}));

printSVG(...elements);
