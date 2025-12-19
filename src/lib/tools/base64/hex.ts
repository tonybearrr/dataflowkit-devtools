

import type { BytesConvertResult } from './types';


export function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}


export function hexToBytes(hex: string, strict: boolean = false): BytesConvertResult {
	try {
		let cleaned = hex;

		if (!strict) {
			// Remove 0x prefix if present
			if (cleaned.toLowerCase().startsWith('0x')) {
				cleaned = cleaned.slice(2);
			}
			// Remove whitespace and newlines
			cleaned = cleaned.replace(/[\s\n\r]/g, '');
		} else {
			// In strict mode, check for 0x prefix as invalid
			if (cleaned.startsWith('0x') || cleaned.startsWith('0X')) {
				return { ok: false, error: 'Invalid hex: 0x prefix not allowed in strict mode' };
			}
		}

		// Validate hex characters
		const validHex = /^[0-9a-fA-F]*$/;
		if (!validHex.test(cleaned)) {
			return { ok: false, error: 'Invalid hex characters' };
		}

		// Check for even length
		if (cleaned.length % 2 !== 0) {
			if (strict) {
				return { ok: false, error: 'Hex string must have even length' };
			}
			// In non-strict mode, prepend 0
			cleaned = '0' + cleaned;
		}

		// Convert hex pairs to bytes
		const bytes = new Uint8Array(cleaned.length / 2);
		for (let i = 0; i < cleaned.length; i += 2) {
			bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
		}

		return { ok: true, bytes };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Invalid hex string';
		return { ok: false, error: message };
	}
}


export function isValidHex(str: string, strict: boolean = false): boolean {
	let cleaned = str;

	if (!strict) {
		// Remove 0x prefix if present
		if (cleaned.toLowerCase().startsWith('0x')) {
			cleaned = cleaned.slice(2);
		}
		// Remove whitespace
		cleaned = cleaned.replace(/[\s\n\r]/g, '');
	}

	// Allow empty string
	if (cleaned.length === 0) return true;

	// Check for valid hex characters
	const validHex = /^[0-9a-fA-F]+$/;
	if (!validHex.test(cleaned)) return false;

	// In strict mode, require even length
	if (strict && cleaned.length % 2 !== 0) return false;

	return true;
}

