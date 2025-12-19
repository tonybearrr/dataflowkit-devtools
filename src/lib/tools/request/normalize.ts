import type { RequestModel, NormalizedRequest, KeyValuePair } from './types';


export function buildUrlWithQuery(baseUrl: string, query: KeyValuePair[]): string {
	const enabledParams = query.filter((p) => p.enabled && p.key.trim());

	if (enabledParams.length === 0) {
		return baseUrl;
	}

	try {
		const url = new URL(baseUrl);
		enabledParams.forEach((param) => {
			url.searchParams.append(param.key.trim(), param.value);
		});
		return url.toString();
	} catch {
		const queryString = enabledParams
			.map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`)
			.join('&');

		const separator = baseUrl.includes('?') ? '&' : '?';
		return `${baseUrl}${separator}${queryString}`;
	}
}


export function headersToRecord(headers: KeyValuePair[]): Record<string, string> {
	const result: Record<string, string> = {};
	headers
		.filter((h) => h.enabled && h.key.trim())
		.forEach((h) => {
			result[h.key.trim()] = h.value;
		});
	return result;
}


export function getContentType(headers: Record<string, string>): string | undefined {
	const key = Object.keys(headers).find((k) => k.toLowerCase() === 'content-type');
	return key ? headers[key] : undefined;
}


export function shouldHaveBody(method: string): boolean {
	return ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
}


export function normalizeRequest(model: RequestModel): NormalizedRequest {
	const headers = headersToRecord(model.headers);
	const url = buildUrlWithQuery(model.url, model.query);

	let body: string | undefined;

	if (model.body.type !== 'none' && model.body.value.trim()) {
		if (model.body.type === 'form') {
			body = model.body.value;
		} else {
			body = model.body.value;
		}
	}

	return {
		method: model.method,
		url,
		headers,
		body,
		contentType: getContentType(headers)
	};
}


export function isValidUrl(url: string): boolean {
	if (!url.trim()) return false;

	try {
		new URL(url);
		return true;
	} catch {
		return url.startsWith('/') || url.startsWith('http') || url.includes('localhost');
	}
}


export function generateId(): string {
	return Math.random().toString(36).slice(2, 9);
}

