

import type { BytesConvertResult } from './types';
import { bytesToBase64, base64ToBytes } from './base64';


export function base64ToBase64Url(b64: string): string {
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}


export function base64UrlToBase64(b64url: string): string {
	// Replace URL-safe characters with standard Base64 characters
	let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');

	const paddingNeeded = (4 - (b64.length % 4)) % 4;
	b64 += '='.repeat(paddingNeeded);

	return b64;
}


export function bytesToBase64Url(bytes: Uint8Array): string {
	const b64 = bytesToBase64(bytes);
	return base64ToBase64Url(b64);
}


export function base64UrlToBytes(b64url: string, strict: boolean = false): BytesConvertResult {
	try {
		let cleaned = b64url;

		if (!strict) {
			// Remove whitespace and newlines in non-strict mode
			cleaned = b64url.replace(/[\s\n\r]/g, '');
		}

		if (strict) {
			const validBase64Url = /^[A-Za-z0-9_-]*={0,2}$/;
			if (!validBase64Url.test(cleaned)) {
				return { ok: false, error: 'Invalid Base64URL characters' };
			}
		}

		// Convert to standard Base64 and decode
		const b64 = base64UrlToBase64(cleaned);
		return base64ToBytes(b64, true); // Already cleaned, use strict internally
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Invalid Base64URL string';
		return { ok: false, error: message };
	}
}


export function isValidBase64Url(str: string, strict: boolean = false): boolean {
	const cleaned = strict ? str : str.replace(/[\s\n\r]/g, '');

	// Allow empty string
	if (cleaned.length === 0) return true;

	// Base64URL pattern (no padding typically, but we accept it)
	const base64UrlPattern = /^[A-Za-z0-9_-]+={0,2}$/;

	return base64UrlPattern.test(cleaned);
}

