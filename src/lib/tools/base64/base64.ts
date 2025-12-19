

import type { BytesConvertResult } from './types';


export function bytesToBase64(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}


export function base64ToBytes(b64: string, strict: boolean = false): BytesConvertResult {
	try {
		let cleaned = b64;

		if (!strict) {
			cleaned = b64.replace(/[\s\n\r]/g, '');
		}

		if (strict) {
			const validBase64 = /^[A-Za-z0-9+/]*={0,2}$/;
			if (!validBase64.test(cleaned)) {
				return { ok: false, error: 'Invalid Base64 characters' };
			}
		}

		if (cleaned.length % 4 !== 0) {
			const paddingNeeded = 4 - (cleaned.length % 4);
			if (paddingNeeded !== 4) {
				cleaned += '='.repeat(paddingNeeded);
			}
		}

		const binary = atob(cleaned);
		const bytes = new Uint8Array(binary.length);

		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}

		return { ok: true, bytes };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Invalid Base64 string';
		return { ok: false, error: message };
	}
}


export function isValidBase64(str: string, strict: boolean = false): boolean {
	const cleaned = strict ? str : str.replace(/[\s\n\r]/g, '');

	if (cleaned.length === 0) return true;

	const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;

	if (!base64Pattern.test(cleaned)) return false;

	const paddingIndex = cleaned.indexOf('=');
	if (paddingIndex !== -1 && paddingIndex < cleaned.length - 2) {
		return false;
	}

	return true;
}

