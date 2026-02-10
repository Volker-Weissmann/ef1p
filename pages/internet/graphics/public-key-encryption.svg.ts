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

const encryptionText = bold('Encryption');
const decryptionText = bold('Decryption');

const senderText = bold('Sender');
const recipientText = bold('Recipient');

const plaintextText = 'Plaintext';
const ciphertextText = 'Ciphertext';

const publicKeyText = ['Public key', 'of recipient'];
const privateKeyText = ['Private key', 'of recipient'];

const size = estimateTextSizeWithMargin(decryptionText);

const horizontalGap = estimateTextWidthWithMargin(ciphertextText, 3);
const verticalGap = size.y;

const elements = new Array<VisualElement>();

const encryptionRectangle = new Rectangle({ position: P(horizontalGap, -size.y / 2), size, color: 'blue' });
elements.push(...encryptionRectangle.withText(encryptionText));

const decryptionRectangle = new Rectangle({ position: P(horizontalGap + horizontalGap + size.x, -size.y / 2), size, color: 'blue' });
elements.push(...decryptionRectangle.withText(decryptionText));

const marker = 'end';

elements.unshift(...new Line({ start: P(0, 0), end: encryptionRectangle.boundingBox().pointAt('left'), marker, color: 'green' }).withText(plaintextText));
elements.unshift(...Line.connectBoxes(encryptionRectangle, 'right', decryptionRectangle, 'left', { color: 'red' }).withText(ciphertextText));
elements.unshift(...new Line({
    start: decryptionRectangle.boundingBox().pointAt('right'),
    end: P(2 * horizontalGap + horizontalGap + 2 * size.x, 0),
    marker,
    color: 'green',
}).withText(plaintextText));

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

addKeyLine(encryptionRectangle, publicKeyText);
addKeyLine(decryptionRectangle, privateKeyText);

elements.push(new Text({
    position: P(horizontalGap, (-size.y / 2 - verticalGap) / 2 - textToLineDistance),
    text: senderText,
    verticalAlignment: 'bottom',
}));

elements.push(new Text({
    position: P(horizontalGap + horizontalGap + 2 * size.x, (-size.y / 2 - verticalGap) / 2 - textToLineDistance),
    text: recipientText,
    verticalAlignment: 'bottom',
}));

printSVG(...elements);
