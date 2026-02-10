/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { fetchWithErrorAndTimeout } from '../utility/fetch';
import { normalizeToArray } from '../utility/normalization';

/* ------------------------------ Record types ------------------------------ */

const internalQueryRecordTypes = {
    A: 'A: IPv4 address',
    AAAA: 'AAAA: IPv6 address',
    ANY: 'ANY: return all types',
    CAA: 'CAA: CA authorization',
    CNAME: 'CNAME: canonical name',
    MX: 'MX: mail exchange',
    NS: 'NS: name server',
    OPENPGPKEY: 'OPENPGPKEY',
    PTR: 'PTR: pointer resource',
    SMIMEA: 'SMIMEA: S/MIME cert',
    SOA: 'SOA: start of authority',
    SPF: 'SPF: an obsolete type',
    SRV: 'SRV: service host',
    SSHFP: 'SSHFP: SSH fingerprint',
    TLSA: 'TLSA: DANE certificate',
    TXT: 'TXT: unstructured text',
    DNSKEY: 'DNSKEY: DNS public key',
    DS: 'DS: delegation signer',
    RRSIG: 'RRSIG: record signature',
    NSEC: 'NSEC: next secure record',
    NSEC3: 'NSEC3: NSEC version 3',
    NSEC3PARAM: 'NSEC3PARAM[eters]',
    CDS: 'CDS: DS in child zone',
    CDNSKEY: 'CDNSKEY: child DNSKEY',
    SVCB: 'SVCB: service binding',
    HTTPS: 'HTTPS: SVCB for HTTPS',
};

/**
 * Record types which you can query with the DNS resolver tool.
 * See https://en.wikipedia.org/wiki/List_of_DNS_record_types.
 */
export const queryRecordTypes: Record<string, string> = internalQueryRecordTypes;

const internalReplyRecordTypes = {
    BIND: 'BIND: DNSSEC operations',
    CERT: 'CERT: certificate (RFC 4398)',
    HINFO: 'HINFO: host information (RFC 1035)',
    HIP: 'HIP: Host Identity Protocol (RFC 8005)',
    LOC: 'LOC: geographic location (RFC 1876)',
    NAPTR: 'NAPTR: Naming Authority Pointer (RFC 3403)',
    NXNAME: 'NXNAME: NXDOMAIN indicator for Compact Denial of Existence',
    URI: 'URI: Uniform Resource Identifier (RFC 7553)',
    ZONEMD: 'ZONEMD: Zone Message Digest (RFC 8976)',
};

/**
 * Record types which can appear in DNS replies when you query ANY, NSEC, or NSEC3.
 */
export const replyRecordTypes: Record<string, string> = internalReplyRecordTypes;

const internalAllRecordTypes = { ...internalQueryRecordTypes, ...internalReplyRecordTypes };

export const allRecordTypes: Record<string, string> = internalAllRecordTypes;

export type RecordType = keyof typeof internalAllRecordTypes;

// https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4
export const recordTypesById: { [key: number]: RecordType | undefined } = {
    255: 'ANY',
    1: 'A',
    28: 'AAAA',
    257: 'CAA',
    5: 'CNAME',
    15: 'MX',
    2: 'NS',
    61: 'OPENPGPKEY',
    12: 'PTR',
    53: 'SMIMEA',
    6: 'SOA',
    99: 'SPF',
    33: 'SRV',
    44: 'SSHFP',
    52: 'TLSA',
    16: 'TXT',
    48: 'DNSKEY',
    43: 'DS',
    46: 'RRSIG',
    47: 'NSEC',
    50: 'NSEC3',
    51: 'NSEC3PARAM',
    59: 'CDS',
    60: 'CDNSKEY',
    65534: 'BIND',
    37: 'CERT',
    13: 'HINFO',
    55: 'HIP',
    65: 'HTTPS',
    29: 'LOC',
    35: 'NAPTR',
    128: 'NXNAME',
    64: 'SVCB',
    256: 'URI',
    63: 'ZONEMD',
}

// Construct the reverse lookup table (with ids as strings).
const idsByRecordType: { [K in RecordType]?: string } = {};
for (const [id, recordType] of Object.entries(recordTypesById)) {
    idsByRecordType[recordType!] = id;
}

const recordTypesNotUnderstoodByGoogle: RecordType[] = ['OPENPGPKEY', 'SMIMEA', 'HIP', 'LOC', 'URI', 'NXNAME', 'ZONEMD'];

function mapRecordTypeToGoogle(type: RecordType): string {
    if (recordTypesNotUnderstoodByGoogle.includes(type)) {
        return 'TYPE' + idsByRecordType[type];
    }
    return type;
}

/**
 * Note that unknown record types are returned as 'TYPE' + id,
 * which means you don't find them in `allRecordTypes`.
 */
export function mapRecordTypeFromGoogle(type: string): RecordType | string {
    if (type.startsWith('TYPE')) {
        const recordType = recordTypesById[parseInt(type.slice(4), 10)];
        if (recordType !== undefined) {
            return recordType;
        }
    }
    return type;
}

// See https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6.
export const responseStatusCodes: { [key: number]: string | undefined } = {
    0: 'The status code of the response says that no error occurred.',
    2: 'The status code of the response says that there was a server failure. This might be due to invalid DNSSEC records or non-responding name servers.',
    3: 'The status code of the response says that no such domain exists.',
}

/* ------------------------------ Response types ------------------------------ */

export interface DnsQuestion {
    name: string;
    type: RecordType;
}

export interface DnsRecord {
    name: string;
    ttl: number;
    type: RecordType | number;
    data: string; // Removed quotes for SPF and TXT records, original (but trimmed) string otherwise.
}

export interface DnsResponse {
    status: number;
    question: DnsQuestion;
    answer: DnsRecord[]; // Can be empty.
    authority: DnsRecord[]; // Can be empty.
}

/* ------------------------------ Utility functions ------------------------------ */

export function getAllRecords(response: DnsResponse, type: RecordType): DnsRecord[] {
    return response.answer.concat(response.authority).filter(record => record.type === type);
}

export function isAuthenticated(response: DnsResponse, domain: string, type: RecordType, cname: boolean = true): boolean {
    return response.answer.filter(record =>
        record.name === (domain.endsWith('.') ? domain : domain + '.') &&
        record.type === 'RRSIG' &&
        (record.data.startsWith(mapRecordTypeToGoogle(type).toLowerCase() + ' ') || (cname && record.data.startsWith('cname '))),
    ).length === 1;
}

/**
 * This function supports both IPv4 and IPv6 addresses.
 */
export function getReverseLookupDomain(ipAddress: string): string {
    // Normalize to lowercase and remove (IPv6) zone id (e.g., %eth0).
    let address = ipAddress.toLowerCase().split('%')[0].trim();

    // It's an IPv4 address if it doesn't contain a colon (':').
    if (!address.includes(':')) {
        return address.split('.').reverse().join('.') + '.in-addr.arpa';
    }

    // Handle embedded IPv4 at the end (e.g., '::ffff:192.0.2.128')
    if (address.includes('.')) {
        // There is at least one colon, as the address would have been handled as an IPv4 address otherwise.
        const indexOfLastColon = address.lastIndexOf(':');
        const embeddedIPv4Address = address.slice(indexOfLastColon + 1);
        const octetStrings = embeddedIPv4Address.split('.');
        if (octetStrings.length !== 4) {
            throw new Error(`The IPv6 address '${address}' ends with an invalid IPv4 part. (${octetStrings.length} octets instead of 4.)`);
        }
        const octetNumbers = octetStrings.map(octetString => {
            if (!/^\d{1,3}$/.test(octetString)) {
                throw new Error(`The IPv6 address '${address}' contains the invalid IPv4 octet '${octetString}'.`);
            }
            const octetNumber = Number(octetString);
            if (octetNumber < 0 || octetNumber > 255) {
                throw new Error(`The IPv6 address '${address}' contains the IPv4 octet '${octetNumber}', which is out of range.`);
            }
            return octetNumber;
        });
        const hexString = octetNumbers.map(octetNumber => octetNumber.toString(16).padStart(2, '0')).join('');
        address = address.slice(0, indexOfLastColon + 1) + hexString.slice(0, 4) + ':' + hexString.slice(4, 8);
    }

    // Split on '::' to expand zero compression.
    const doubleColonParts = address.split('::');
    if (doubleColonParts.length > 2) {
        throw new Error(`The IPv6 address '${address}' contains more than one double colon ('::').`);
    }

    const hextetsLeftOfDoubleColon = doubleColonParts[0] !== '' ? doubleColonParts[0].split(':') : [];
    if (doubleColonParts.length === 1 && hextetsLeftOfDoubleColon.length !== 8) {
        throw new Error(`The uncompressed IPv6 address '${address}' consists of ${hextetsLeftOfDoubleColon.length} hextets instead of 8.`);
    }

    const hextetsRightOfDoubleColon = doubleColonParts.length === 2 && doubleColonParts[1] !== '' ? doubleColonParts[1].split(':') : [];
    const hextetCount = hextetsLeftOfDoubleColon.length + hextetsRightOfDoubleColon.length;
    if (doubleColonParts.length === 2 && hextetCount > 6) { // Zero compression replaces at least two zero hextets.
        throw new Error(`The compressed IPv6 address '${address}' consists of more hextets than allowed.`);
    }

    // Combine the hextets to the left and to the right of the double colon without zero compression.
    const combinedHextets = [
        ...hextetsLeftOfDoubleColon,
        ...Array<string>(8 - hextetCount).fill('0'),
        ...hextetsRightOfDoubleColon,
    ];

    // Pad all hextets with leading zeros.
    const paddedHextets = combinedHextets.map(hextet => {
        if (!/^[0-9a-f]{1,4}$/i.test(hextet)) {
            throw new Error(`The hextet ${hextet} in the IPv6 address '${address}' is invalid.`);
        }
        return hextet.padStart(4, '0');
    });

    // Create the nibble-reversed domain.
    const nibbles = paddedHextets.join('').split('');
    return nibbles.reverse().join('.') + '.ip6.arpa';
}

/* ------------------------------ Google DNS API ------------------------------ */

interface GoogleDnQuestion {
    name: string;
    type: number;
}

interface GoogleDnsRecord {
    name: string;
    type: number;
    TTL: number;
    data: string;
}

interface GoogleDnsResponse {
    Status: number;
    Question: GoogleDnQuestion[];
    Answer?: GoogleDnsRecord[];
    Authority?: GoogleDnsRecord[];
}

// https://developers.google.com/speed/public-dns/docs/doh/json
const endpoint = 'https://dns.google/resolve?';

function normalizeRecord(record: GoogleDnsRecord): DnsRecord {
    const name = record.name;
    const type = recordTypesById[record.type] ?? record.type;
    const live = record.TTL;
    const data = ((type === 'SPF' || type === 'TXT') && record.data.startsWith('"') && record.data.endsWith('"')) ? record.data.slice(1, -1).replace(/""/g, '') : record.data;
    return { name, type, ttl: live, data: data.trim() };
}

export async function resolveDomainName(domain: string, type: RecordType, dnssec: boolean = false): Promise<DnsResponse> {
    const parameters = {
        name: domain,
        type: mapRecordTypeToGoogle(type),
        do: dnssec.toString(),
    };
    const response = await fetchWithErrorAndTimeout(endpoint + new URLSearchParams(parameters).toString());
    const json: GoogleDnsResponse = await response.json();
    const status = json.Status;
    const recordType = recordTypesById[json.Question[0].type];
    if (recordType === undefined) {
        throw new Error(`Unsupported record type ${json.Question[0].type}.`);
    }
    const question = { name: json.Question[0].name, type: recordType };
    const answer = normalizeToArray(json.Answer).map(normalizeRecord);
    const authority = normalizeToArray(json.Authority).map(normalizeRecord);
    return { status, question, answer, authority };
}

export async function getDataOfFirstRecord(domainName: string, recordType: RecordType): Promise<string> {
    const response = await resolveDomainName(domainName, recordType);
    const records = response.answer.filter(record => record.type === recordType);
    if (records.length > 0) {
        return records[0].data;
    } else {
        throw new Error(`Domain ${domainName} has no record of type ${recordType}.`);
    }
}
