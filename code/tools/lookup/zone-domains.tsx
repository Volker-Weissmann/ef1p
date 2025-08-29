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

import { domainName, setDnsResolverInputs } from './dns-records';

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
                This zone uses <a href="https://datatracker.ietf.org/doc/draft-ietf-dnsop-compact-denial-of-existence/07/">Compact Denial of Existence</a> and thus cannot be walked.
            </> });
            return;
        }
        if (currentDomain.endsWith(nextDomain)) {
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
    ...domainName,
    label: 'Start domain',
    tooltip: 'The domain name from which you would like to list the next domain names.',
};

const resultLimit: DynamicRangeEntry = {
    label: 'Result limit',
    tooltip: 'Configure the maximum number of results to be returned.',
    defaultValue: 20,
    inputType: 'range',
    minValue: 10,
    maxValue: 150,
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
    store.setNewStateFromCurrentInputs();
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
