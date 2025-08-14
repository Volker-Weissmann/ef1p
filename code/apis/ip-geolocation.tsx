/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ReactNode } from 'react';

import { fetchWithErrorAndTimeout } from '../utility/fetch';

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

export async function getIpInfo(ipAddress?: string): Promise<IpInfoResponse> {
    const bearer = `Bearer ${atob(token).split('').reverse().slice(1).join('')}`;
    console.log(bearer);
    // Main API with authentication (the limited city-level API):
    try {
        const response = await fetchWithErrorAndTimeout(
            'https://ipinfo.io/' + (ipAddress ?? '') + '/json',
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': bearer,
                },
            },
        );
        return response.json();
    } catch (error) {
        console.warn('Could not retrieve IP info from ipinfo.io with authentication.', error);
    }
    // Main API without authentication (when we exceeded the quota):
    try {
        const response = await fetchWithErrorAndTimeout('https://ipinfo.io/' + (ipAddress ?? '') + '/json');
        return response.json();
    } catch (error) {
        console.warn('Could not retrieve IP info from ipinfo.io without authentication.', error);
    }
    // Lite API with authentication (the unlimited country-level API):
    try {
        const response = await fetchWithErrorAndTimeout(
            'https://api.ipinfo.io/lite/' + (ipAddress || 'me'),
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': bearer,
                },
            },
        );
        return response.json();
    } catch (error) {
        console.warn('Could not retrieve IP info from api.ipinfo.io/lite/ with authentication.', error);
        throw error;
    }
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
        return 'Error fetching IP info (disable your adblocker?)';
    }
}
