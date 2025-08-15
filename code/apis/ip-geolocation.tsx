/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ReactNode } from 'react';

import { fetchWithTimeout } from '../utility/fetch';

/* ------------------------------ Response types ------------------------------ */

export interface IpInfoResponse {
    ip: string;
}

// https://ipinfo.io/bogon
export interface BogonIpInfoResponse extends IpInfoResponse {
    bogon: boolean;
}

export interface CityIpInfoResponse extends IpInfoResponse {
    hostname?: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org?: string;
    postal: string;
    timezone: string;
}

export function isCityIpInfoResponse(response: IpInfoResponse): response is CityIpInfoResponse {
    return (response as CityIpInfoResponse).city !== undefined;
}

export interface CountryIpInfoResponse extends IpInfoResponse {
    asn: string;
    as_name: string;
    as_domain: string;
    country_code: string;
    country: string;
    continent_code: string;
    continent: string;
}

export function isCountryIpInfoResponse(response: IpInfoResponse): response is CountryIpInfoResponse {
    return (response as CountryIpInfoResponse).continent !== undefined;
}

/* ------------------------------ IP info API ------------------------------ */

const token = 'NmFlYzQyMThjNmNiNjBU';

const success = 200;
const forbidden = 403;
const tooManyRequests = 429;

export async function getIpInfo(ipAddress?: string): Promise<IpInfoResponse> {
    const bearer = `Bearer ${atob(token).split('').reverse().slice(1).join('')}`;
    let status: number;
    if (window.location.hostname === 'localhost') {
        status = forbidden;
    } else {
        // Main API with authentication (the limited city-level API):
        const response = await fetchWithTimeout(
            'https://ipinfo.io/' + (ipAddress ?? '') + '/json',
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': bearer,
                },
            },
        );
        status = response.status;
        if (status === success) {
            return response.json();
        }
    }
    if (status === forbidden || status === tooManyRequests) {
        // Main API without authentication (when we query from localhost or exceeded the quota):
        const response = await fetchWithTimeout('https://ipinfo.io/' + (ipAddress ?? '') + '/json');
        if (response.status === success) {
            return response.json();
        }
        // If the Main API with authentication was forbidden, then so would be the Lite API with authentication.
        if (status !== forbidden && response.status === tooManyRequests) {
            // Lite API with authentication (the unlimited country-level API):
            const response = await fetchWithTimeout(
                'https://api.ipinfo.io/lite/' + (ipAddress || 'me'),
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': bearer,
                    },
                },
            );
            if (response.status === success) {
                return response.json();
            }
        }
    }
    // Either the IP address does not exist (404 (Not Found) on the Main API or 400 (Bad Request) on the Lite API)
    // or there were too many requests to the Main API from localhost without authentication:
    throw new Error(`Failed to fetch IP info for '${ipAddress}'.`);
}

/* ------------------------------ Display response ------------------------------ */

// https://developers.google.com/maps/documentation/urls/get-started#map-action
export function getMapLink(response: IpInfoResponse): ReactNode {
    if (isCityIpInfoResponse(response)) {
        return <a href={`https://www.google.com/maps/@?api=1&map_action=map&center=${response.loc}&zoom=10`}>
            {response.city} ({response.country})
        </a>;
    } else if (isCountryIpInfoResponse(response)) {
        return <a href={`https://www.google.com/maps/search/${response.country}/`}>
            {response.country} ({response.continent})
        </a>;
    } else {
        return 'IP address reserved for special use';
    }
}

export async function getRenderedIpInfo(ipAddress?: string): Promise<ReactNode> {
    try {
        const response = await getIpInfo(ipAddress);
        return getMapLink(response);
    } catch (_) {
        return 'Error fetching IP info (adblocker disabled?)';
    }
}
