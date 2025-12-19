

import type { ConvertResult } from './types';


export function textToBytes(text: string): Uint8Array {
	const encoder = new TextEncoder();
	return encoder.encode(text);
}


export function bytesToText(bytes: Uint8Array): ConvertResult<string> {
	try {
		const decoder = new TextDecoder('utf-8', { fatal: true });
		const text = decoder.decode(bytes);
		return { ok: true, value: text };
	} catch {
		return { ok: false, error: 'Invalid UTF-8 sequence' };
	}
}

