import type { ParsedUrl, QueryParam } from './types';


export function buildUrl(base: ParsedUrl, params: QueryParam[]): string {
	let url = base.protocol + '//' + base.host + base.pathname;
	
	const enabledParams = params.filter(p => p.enabled && p.key.trim() !== '');
	
	if (enabledParams.length > 0) {
		const searchParams = new URLSearchParams();
		enabledParams.forEach(p => {
			searchParams.append(p.key, p.value);
		});
		url += '?' + searchParams.toString();
	}
	
	if (base.hash) {
		url += '#' + base.hash;
	}
	
	return url;
}


export function updateUrlComponent(
	base: ParsedUrl,
	component: 'protocol' | 'hostname' | 'port' | 'pathname' | 'hash',
	value: string
): ParsedUrl | null {
	try {
		const url = new URL(base.href);
		
		switch (component) {
			case 'protocol':
				url.protocol = value;
				break;
			case 'hostname':
				url.hostname = value;
				break;
			case 'port':
				url.port = value;
				break;
			case 'pathname':
				url.pathname = value;
				break;
			case 'hash':
				url.hash = value;
				break;
		}
		
		return {
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
	} catch {
		return null;
	}
}


export function createEmptyUrl(): ParsedUrl {
	return {
		href: '',
		protocol: 'https:',
		hostname: '',
		port: '',
		pathname: '/',
		search: '',
		hash: '',
		host: '',
		origin: ''
	};
}

