/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { doubleLineWithMarginHeight } from '../../../code/svg/utility/constants';
import { P } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, colorize, estimateTextSizeWithMargin, T, TextLine } from '../../../code/svg/elements/text';

const gap = 32;
const y = doubleLineWithMarginHeight + gap / 2;
let x = 0;

const elements = new Array<VisualElement>();

function addRectangle(textLines: TextLine[], increase = true, y = 0): Rectangle {
    const rectangle = new Rectangle({ position: P(x, y), size: estimateTextSizeWithMargin(textLines) });
    elements.push(...rectangle.withText(textLines, { horizontalAlignment: 'left' }));
    if (increase) {
        x += rectangle.props.size.x + gap;
    }
    return rectangle;
}

const application = addRectangle([bold('Application'), '(own cache)']);
const stubResolver = addRectangle([bold('Stub resolver'), 'on your device']);
const forwardingResolver = addRectangle([bold('Forwarding resolver'), 'on your Wi-Fi router']);
const recursiveResolver = addRectangle([bold('Recursive resolver'), T('of your ISP; ', colorize('green', 'DNSSEC'))]);
const rootAuthoritativeServer = addRectangle([bold('Authoritative server'), 'of the root zone'], false, -y);
const comAuthoritativeServer = addRectangle([bold('Authoritative server'), 'of the .com zone'], false);
const ef1pAuthoritativeServer = addRectangle([bold('Authoritative server'), 'of the ef1p.com zone'], false, y);

elements.unshift(Line.connectBoxes(application, 'right', stubResolver, 'left', { color: 'blue' }));
elements.unshift(Line.connectBoxes(stubResolver, 'right', forwardingResolver, 'left', { color: 'blue' }));
elements.unshift(Line.connectBoxes(forwardingResolver, 'right', recursiveResolver, 'left', { color: 'blue' }));
elements.unshift(Line.connectBoxes(recursiveResolver, 'right', rootAuthoritativeServer, 'left', { color: 'green'}));
elements.unshift(Line.connectBoxes(recursiveResolver, 'right', comAuthoritativeServer, 'left', { color: 'green'}));
elements.unshift(Line.connectBoxes(recursiveResolver, 'right', ef1pAuthoritativeServer, 'left', { color: 'green'}));

printSVG(...elements);
