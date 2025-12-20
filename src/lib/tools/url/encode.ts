import type { DecodeResult } from './types';


export function encodeValue(value: string): string {
	return encodeURIComponent(value);
}


export function decodeValue(value: string): DecodeResult {
	try {
		const decoded = decodeURIComponent(value);
		return { ok: true, value: decoded };
	} catch {
		return { ok: false, error: 'Invalid URL encoding' };
	}
}


export function encodeUrl(url: string): string {
	return encodeURI(url);
}


export function decodeUrl(url: string): DecodeResult {
	try {
		const decoded = decodeURI(url);
		return { ok: true, value: decoded };
	} catch {
		return { ok: false, error: 'Invalid URL encoding' };
	}
}


export function isEncoded(value: string): boolean {
	return /%[0-9A-Fa-f]{2}/.test(value);
}


export function toggleEncoding(value: string): string {
	if (isEncoded(value)) {
		const result = decodeValue(value);
		return result.ok ? result.value : value;
	}
	return encodeValue(value);
}

