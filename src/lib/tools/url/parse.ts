import type { ParsedUrl, ParseResult, QueryParam } from './types';

function generateId(): string {
	return Math.random().toString(36).substring(2, 9);
}


export function parseUrl(input: string): ParseResult {
	const trimmed = input.trim();
	
	if (!trimmed) {
		return { ok: false, error: 'URL cannot be empty' };
	}

	let urlString = trimmed;
	
	if (!urlString.includes('://')) {
		if (!urlString.startsWith('//')) {
			urlString = 'https://' + urlString;
		} else {
			urlString = 'https:' + urlString;
		}
	}

	try {
		const url = new URL(urlString);
		
		const parsedUrl: ParsedUrl = {
			href: url.href,
			protocol: url.protocol,
			hostname: url.hostname,
			port: url.port,
			pathname: url.pathname,
			search: url.search.slice(1),
			hash: url.hash.slice(1),
			host: url.host,
			origin: url.origin
		};

		const params: QueryParam[] = [];
		url.searchParams.forEach((value, key) => {
			params.push({
				id: generateId(),
				key,
				value,
				enabled: true
			});
		});

		return { ok: true, value: parsedUrl, params };
	} catch {
		if (!trimmed.includes('://')) {
			try {
				const url = new URL('http://' + trimmed);
				
				const parsedUrl: ParsedUrl = {
					href: url.href,
					protocol: url.protocol,
					hostname: url.hostname,
					port: url.port,
					pathname: url.pathname,
					search: url.search.slice(1),
					hash: url.hash.slice(1),
					host: url.host,
					origin: url.origin
				};

				const params: QueryParam[] = [];
				url.searchParams.forEach((value, key) => {
					params.push({
						id: generateId(),
						key,
						value,
						enabled: true
					});
				});

				return { ok: true, value: parsedUrl, params };
			} catch {
				// Ignore and fall through to error
			}
		}
		
		return { ok: false, error: 'Invalid URL format' };
	}
}


export function parseQueryParams(search: string): QueryParam[] {
	if (!search) return [];
	
	const params: QueryParam[] = [];
	const searchParams = new URLSearchParams(search);
	
	searchParams.forEach((value, key) => {
		params.push({
			id: generateId(),
			key,
			value,
			enabled: true
		});
	});
	
	return params;
}


export function isValidUrl(input: string): boolean {
	const result = parseUrl(input);
	return result.ok;
}

