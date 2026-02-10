/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ReactNode } from 'react';

import { DynamicEntries, DynamicRangeEntry, DynamicTextEntry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { Store } from '../../react/store';
import { join } from '../../react/utility';
import { VersionedStore } from '../../react/versioned-store';

import { allRecordTypes, getAllRecords, mapRecordTypeFromGoogle, queryRecordTypes, RecordType, resolveDomainName } from '../../apis/dns-lookup';

import { setDnsResolverInputs } from './dns-records';

/* ------------------------------ Output ------------------------------ */

interface Row {
    name: string;
    types: string[];
}

interface ZoneWalkerResponseState {
    rows: Row[];
    message?: ReactNode;
    nextQuery?: string;
}

function RawZoneWalkerResponseTable({ rows, message, nextQuery }: Readonly<ZoneWalkerResponseState>): JSX.Element {
    return <>
        {
            rows.length > 0 &&
            <>
                <p className="text-center">
                    ⚠️ You click on links at your own risk! The linked websites can contain malware or disturbing content.
                </p>
                <table className="dynamic-output-pointer">
                    <thead>
                        <th>Domain name</th>
                        <th>Record types</th>
                    </thead>
                    <tbody>
                        {rows.map(row => <tr key={row.name}>
                            <td>{
                                (row.types.includes('CNAME') || row.types.includes('A') || row.types.includes('AAAA') || row.types.includes('NS')) ?
                                    <a href={'http://' + row.name.slice(0, -1)} title="Open this domain in a new browser window.">{row.name}</a> :
                                    <>{row.name}</>
                            }</td>
                            <td>{join(row.types.map(
                                type => queryRecordTypes[type] !== undefined ?
                                    <a href="#tool-lookup-dns-records" title={`Look up this record type with the DNS tool. (${queryRecordTypes[type]})`} onClick={() => setDnsResolverInputs(row.name, type as RecordType)}>{type}</a> :
                                    <span title={allRecordTypes[type] ?? 'Unsupported record type.'}>{type}</span>,
                            ))}</td>
                        </tr>)}
                    </tbody>
                </table>
            </>
        }
        {
            message &&
            <p className="text-center">{message}</p>
        }
        {
            nextQuery &&
            <p className="text-center">
                <a
                    href="#tool-lookup-zone-domains"
                    className="btn btn-sm btn-primary"
                    onClick={() => { setZoneWalkerInputFields(nextQuery); walkZone(store.getCurrentState()); }}
                >
                    Continue
                </a>
            </p>
        }
    </>;
}

const zoneWalkerResponseStore = new Store<ZoneWalkerResponseState>({ rows: [] });
const ZoneWalkerResponseTable = zoneWalkerResponseStore.injectState<{}>(RawZoneWalkerResponseTable);

function resetResponseTable(): void {
    zoneWalkerResponseStore.resetState();
}

function appendAsteriskToFirstLabel(domainName: string): string {
    const labels = domainName.split('.');
    labels[0] += '*';
    return labels.join('.');
}

const filteredTypes = ['NSEC', 'RRSIG'];

async function walkZone({ startDomain, resultLimit }: State): Promise<void> {
    const index = store.getState().index;
    let currentDomain = startDomain;
    if (!currentDomain.endsWith('.')) {
        currentDomain += '.';
    }
    let currentDomainForQuery = currentDomain;
    if (currentDomain.includes('*')) {
        currentDomain = currentDomain.replace('*', '');
    }
    resetResponseTable();
    let counter = 0;
    while (true) {
        const response = await resolveDomainName(currentDomainForQuery, 'NSEC', true);
        if (index !== store.getState().index) {
            return; // Abort if the state changed in the meantime.
        }
        const nsecRecords = getAllRecords(response, 'NSEC').filter(nsecRecord => nsecRecord.name === currentDomain);
        if (nsecRecords.length === 0) {
            if (counter > 0 && !currentDomainForQuery.includes('*')) {
                // We're in a subdomain which doesn't have NSEC records. Let's get out of it again.
                currentDomainForQuery = appendAsteriskToFirstLabel(currentDomain);
                continue;
            }
            zoneWalkerResponseStore.setState({ message: 'Could not find an NSEC record for ' + currentDomain });
            return;
        }
        const parts = nsecRecords[0].data.split(' ');
        const nextDomain = parts.shift()!;
        const types = parts.map(mapRecordTypeFromGoogle).filter(type => !filteredTypes.includes(type));
        if (counter > 0 && types.includes('SOA') && !currentDomainForQuery.includes('*')) {
            // We're in a subdomain which does have NSEC records. Let's get out of it again.
            currentDomainForQuery = appendAsteriskToFirstLabel(currentDomain);
            continue;
        }
        zoneWalkerResponseStore.setState({
            rows: [
                ...zoneWalkerResponseStore.getState().rows,
                { name: currentDomain, types },
            ],
        });
        if (types.includes('NXNAME') || nextDomain === '\\000.' + currentDomain) {
            zoneWalkerResponseStore.setState({ message: <>
                This zone uses {
                    window.location.pathname === '/internet/' ?
                    <a href="#compact-denial-of-existence">Compact Denial of Existence</a> :
                    <a href="https://datatracker.ietf.org/doc/html/rfc9824">Compact Denial of Existence (RFC 9824)</a>
                } and thus cannot be walked.
            </> });
            return;
        }
        if (currentDomain.endsWith('.' + nextDomain)) {
            zoneWalkerResponseStore.setState({ message: 'You reached the end of the zone ' + nextDomain });
            return;
        }
        counter++;
        if (counter === resultLimit) {
            zoneWalkerResponseStore.setState({ nextQuery: currentDomainForQuery });
            return;
        }
        currentDomain = nextDomain;
        currentDomainForQuery = currentDomain;
    }
}

/* ------------------------------ Input ------------------------------ */

const startDomain: DynamicTextEntry = {
    label: 'Start domain',
    tooltip: 'The domain name from which you would like to list the next domain names.',
    defaultValue: 'ef1p.com',
    inputType: 'text',
    inputWidth: 220,
    validateIndependently: input =>
        input === '' && 'The domain name may not be empty.' ||
        /\s/.test(input) && 'The domain name may not contain spaces or tabs.' || // Redundant to the regular expression, just a more specific error message.
        input.length > 253 && 'The domain name may be at most 253 characters long.' ||
        !input.split('.').every(label => label.length < 64) && 'Each label may be at most 63 characters long.' || // Redundant to the regular expression, just a more specific error message.
        // Please note that the following two lines are different from validateIndependently of domainName in dns-records.tsx because we also allow a single asterisk at the end of a label here.
        !/^[-a-z0-9_\.\*\\]+$/i.test(input) && 'You can use only English letters, digits, hyphens, underlines, dots, and backslashes.' || // Redundant to the regular expression, just a more specific error message.
        !/^(((\\000|[a-z0-9_]([-a-z0-9]{0,61}[a-z0-9])?(\\000)?)\*?\.)*[a-z][-a-z0-9]{0,61}[a-z0-9]\*?)?\.?$/i.test(input) && 'The pattern of the domain name is invalid.',
};

const resultLimit: DynamicRangeEntry = {
    label: 'Result limit',
    tooltip: 'Configure the maximum number of results to be returned.',
    defaultValue: 10,
    inputType: 'range',
    minValue: 10,
    maxValue: 100,
    stepValue: 10,
};

interface State {
    startDomain: string;
    resultLimit: number;
}

const entries: DynamicEntries<State> = {
    startDomain,
    resultLimit,
};

const store = new VersionedStore(entries, 'lookup-zone-domains', resetResponseTable);
const Input = getInput(store);

function setZoneWalkerInputFields(startDomain: string, resultLimit?: number): void {
    store.setInput('startDomain', startDomain, true);
    if (resultLimit !== undefined) {
        store.setInput('resultLimit', resultLimit, true);
    }
    store.setNewStateFromCurrentInputs(true);
}

/* ------------------------------ Tool ------------------------------ */

export const toolLookupZoneDomains: Tool = [
    <>
        <Input
            submit={{
                label: 'Walk',
                tooltip: 'List the domain names in the given zone.',
                onClick: walkZone,
            }}
        />
        <ZoneWalkerResponseTable/>
    </>,
    store,
    walkZone,
];
