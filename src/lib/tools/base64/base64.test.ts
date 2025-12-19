import { describe, it, expect } from 'vitest';
import { textToBytes, bytesToText } from './bytes';
import { bytesToBase64, base64ToBytes, isValidBase64 } from './base64';
import { bytesToBase64Url, base64UrlToBytes, base64ToBase64Url, base64UrlToBase64, isValidBase64Url } from './base64url';
import { bytesToHex, hexToBytes, isValidHex } from './hex';
import { detectInputKind } from './detect';

describe('textToBytes / bytesToText', () => {
	it('handles ASCII text', () => {
		const bytes = textToBytes('Hello');
		const result = bytesToText(bytes);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe('Hello');
		}
	});

	it('handles UTF-8 text with Cyrillic', () => {
		const text = 'Привіт';
		const bytes = textToBytes(text);
		const result = bytesToText(bytes);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe(text);
		}
	});

	it('handles emoji', () => {
		const text = '🌍🚀💻';
		const bytes = textToBytes(text);
		const result = bytesToText(bytes);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe(text);
		}
	});

	it('handles mixed content', () => {
		const text = 'Hello 世界! Привіт! 🎉';
		const bytes = textToBytes(text);
		const result = bytesToText(bytes);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe(text);
		}
	});
});

describe('bytesToBase64 / base64ToBytes', () => {
	it('encodes and decodes ASCII', () => {
		const bytes = textToBytes('Hello');
		const base64 = bytesToBase64(bytes);
		expect(base64).toBe('SGVsbG8=');

		const decoded = base64ToBytes(base64, false);
		expect(decoded.ok).toBe(true);
		if (decoded.ok) {
			const text = bytesToText(decoded.bytes);
			expect(text.ok).toBe(true);
			if (text.ok) {
				expect(text.value).toBe('Hello');
			}
		}
	});

	it('encodes and decodes UTF-8', () => {
		const text = 'Привіт';
		const bytes = textToBytes(text);
		const base64 = bytesToBase64(bytes);

		const decoded = base64ToBytes(base64, false);
		expect(decoded.ok).toBe(true);
		if (decoded.ok) {
			const result = bytesToText(decoded.bytes);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(text);
			}
		}
	});

	it('handles whitespace in non-strict mode', () => {
		const base64 = 'SGVs\nbG8=';
		const decoded = base64ToBytes(base64, false);
		expect(decoded.ok).toBe(true);
	});

	it('rejects whitespace in strict mode', () => {
		const base64 = 'SGVs\nbG8=';
		const decoded = base64ToBytes(base64, true);
		expect(decoded.ok).toBe(false);
	});

	it('handles missing padding', () => {
		const base64 = 'SGVsbG8'; // Missing =
		const decoded = base64ToBytes(base64, false);
		expect(decoded.ok).toBe(true);
	});
});

describe('Base64URL conversion', () => {
	it('converts Base64 to Base64URL', () => {
		const base64 = 'a+b/c===';
		const base64url = base64ToBase64Url(base64);
		expect(base64url).toBe('a-b_c');
	});

	it('converts Base64URL to Base64', () => {
		const base64url = 'a-b_c';
		const base64 = base64UrlToBase64(base64url);
		expect(base64).toBe('a+b/c==='); // Replaces - with + and _ with /
	});

	it('roundtrips through Base64URL', () => {
		const text = 'Hello World! 🌍';
		const bytes = textToBytes(text);
		const base64url = bytesToBase64Url(bytes);
		
		const decoded = base64UrlToBytes(base64url, false);
		expect(decoded.ok).toBe(true);
		if (decoded.ok) {
			const result = bytesToText(decoded.bytes);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(text);
			}
		}
	});

	it('handles JWT-style Base64URL', () => {
		// Typical JWT header: {"alg":"HS256","typ":"JWT"}
		const base64url = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
		const decoded = base64UrlToBytes(base64url, false);
		expect(decoded.ok).toBe(true);
		if (decoded.ok) {
			const text = bytesToText(decoded.bytes);
			expect(text.ok).toBe(true);
			if (text.ok) {
				expect(text.value).toContain('"alg"');
			}
		}
	});
});

describe('Hex encoding', () => {
	it('encodes to hex', () => {
		const bytes = new Uint8Array([0, 15, 255]);
		const hex = bytesToHex(bytes);
		expect(hex).toBe('000fff');
	});

	it('decodes hex', () => {
		const decoded = hexToBytes('48656c6c6f', false);
		expect(decoded.ok).toBe(true);
		if (decoded.ok) {
			const text = bytesToText(decoded.bytes);
			expect(text.ok).toBe(true);
			if (text.ok) {
				expect(text.value).toBe('Hello');
			}
		}
	});

	it('handles 0x prefix in non-strict mode', () => {
		const decoded = hexToBytes('0x48656c6c6f', false);
		expect(decoded.ok).toBe(true);
	});

	it('rejects 0x prefix in strict mode', () => {
		const decoded = hexToBytes('0x48656c6c6f', true);
		expect(decoded.ok).toBe(false);
	});

	it('handles uppercase hex', () => {
		const decoded = hexToBytes('48656C6C6F', false);
		expect(decoded.ok).toBe(true);
	});

	it('handles whitespace in non-strict mode', () => {
		const decoded = hexToBytes('48 65 6c 6c 6f', false);
		expect(decoded.ok).toBe(true);
	});

	it('handles odd-length hex in non-strict mode', () => {
		const decoded = hexToBytes('fff', false);
		expect(decoded.ok).toBe(true);
		if (decoded.ok) {
			// Should prepend 0, so 0fff = [0x0f, 0xff]
			expect(decoded.bytes).toEqual(new Uint8Array([0x0f, 0xff]));
		}
	});

	it('rejects odd-length hex in strict mode', () => {
		const decoded = hexToBytes('fff', true);
		expect(decoded.ok).toBe(false);
	});

	it('rejects invalid hex characters', () => {
		const decoded = hexToBytes('xyz', false);
		expect(decoded.ok).toBe(false);
	});
});

describe('validation functions', () => {
	it('validates Base64', () => {
		expect(isValidBase64('SGVsbG8=')).toBe(true);
		expect(isValidBase64('SGVsbG8')).toBe(true);
		expect(isValidBase64('!!!!')).toBe(false);
	});

	it('validates Base64URL', () => {
		expect(isValidBase64Url('SGVsbG8')).toBe(true);
		expect(isValidBase64Url('a-b_c')).toBe(true);
		expect(isValidBase64Url('a+b/c')).toBe(false);
	});

	it('validates Hex', () => {
		expect(isValidHex('48656c6c6f')).toBe(true);
		expect(isValidHex('0x48656c6c6f', false)).toBe(true);
		expect(isValidHex('xyz')).toBe(false);
	});
});

describe('detectInputKind', () => {
	it('detects text for short strings', () => {
		expect(detectInputKind('hi')).toBe('text');
	});

	it('detects hex with 0x prefix', () => {
		expect(detectInputKind('0x48656c6c6f')).toBe('hex');
	});

	it('detects long hex strings', () => {
		expect(detectInputKind('48656c6c6f576f726c6421')).toBe('hex');
	});

	it('detects Base64 with padding', () => {
		expect(detectInputKind('SGVsbG8gV29ybGQh')).toBe('base64');
	});

	it('detects Base64URL with - or _', () => {
		// This JWT header has no - or _ chars, so it's detected as base64
		expect(detectInputKind('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toBe('base64');
		// String with - (from dGVzdD4+PnRlc3Q= -> dGVzdD4-PnRlc3Q)
		expect(detectInputKind('dGVzdD4-PnRlc3Q')).toBe('base64url');
		// String with _ (from YT4/ -> YT4_)
		expect(detectInputKind('YT4_')).toBe('base64url');
	});

	it('detects text for plain words', () => {
		expect(detectInputKind('Hello World')).toBe('text');
	});
});

describe('UTF-8 roundtrip', () => {
	const testCases = [
		'Hello, World!',
		'Привіт, світ!',
		'こんにちは',
		'مرحبا',
		'🌍🚀💻🎉',
		'Mixed: Hello Привіт 🌍'
	];

	for (const text of testCases) {
		it(`roundtrips: ${text}`, () => {
			const bytes = textToBytes(text);

			// Via Base64
			const base64 = bytesToBase64(bytes);
			const fromBase64 = base64ToBytes(base64, false);
			expect(fromBase64.ok).toBe(true);
			if (fromBase64.ok) {
				const result = bytesToText(fromBase64.bytes);
				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value).toBe(text);
				}
			}

			// Via Base64URL
			const base64url = bytesToBase64Url(bytes);
			const fromBase64url = base64UrlToBytes(base64url, false);
			expect(fromBase64url.ok).toBe(true);
			if (fromBase64url.ok) {
				const result = bytesToText(fromBase64url.bytes);
				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value).toBe(text);
				}
			}

			// Via Hex
			const hex = bytesToHex(bytes);
			const fromHex = hexToBytes(hex, false);
			expect(fromHex.ok).toBe(true);
			if (fromHex.ok) {
				const result = bytesToText(fromHex.bytes);
				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value).toBe(text);
				}
			}
		});
	}
});

