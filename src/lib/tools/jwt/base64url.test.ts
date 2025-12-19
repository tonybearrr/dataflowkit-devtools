import { describe, it, expect } from 'vitest';
import { base64UrlDecode, base64UrlEncode, isValidBase64Url } from './base64url';

describe('base64UrlDecode', () => {
	it('decodes a simple string', () => {
		// "hello" in Base64URL is "aGVsbG8"
		const result = base64UrlDecode('aGVsbG8');
		expect(result).toBe('hello');
	});

	it('handles URL-safe characters', () => {
		// Standard Base64 would use + and /, Base64URL uses - and _
		const result = base64UrlDecode('PDw_Pz4-');
		expect(result).toBe('<<??>>');
	});

	it('handles strings without padding', () => {
		// "a" encodes to "YQ==" in Base64, "YQ" in Base64URL
		expect(base64UrlDecode('YQ')).toBe('a');
		// "ab" encodes to "YWI=" in Base64, "YWI" in Base64URL
		expect(base64UrlDecode('YWI')).toBe('ab');
	});

	it('handles UTF-8 characters', () => {
		// "тест" in UTF-8, then Base64URL encoded
		const encoded = base64UrlEncode('тест');
		const decoded = base64UrlDecode(encoded);
		expect(decoded).toBe('тест');
	});

	it('throws on invalid Base64', () => {
		expect(() => base64UrlDecode('!!invalid!!')).toThrow('Invalid Base64URL encoding');
	});

	it('handles empty string', () => {
		expect(base64UrlDecode('')).toBe('');
	});

	it('decodes JWT header correctly', () => {
		// {"alg":"HS256","typ":"JWT"} as Base64URL
		const headerBase64 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
		const result = base64UrlDecode(headerBase64);
		expect(JSON.parse(result)).toEqual({ alg: 'HS256', typ: 'JWT' });
	});
});

describe('base64UrlEncode', () => {
	it('encodes a simple string', () => {
		const result = base64UrlEncode('hello');
		expect(result).toBe('aGVsbG8');
	});

	it('uses URL-safe characters', () => {
		const result = base64UrlEncode('<<??>>');
		expect(result).toBe('PDw_Pz4-');
		expect(result).not.toContain('+');
		expect(result).not.toContain('/');
	});

	it('removes padding', () => {
		const result = base64UrlEncode('a');
		expect(result).toBe('YQ');
		expect(result).not.toContain('=');
	});

	it('roundtrips correctly', () => {
		const original = 'The quick brown fox jumps over the lazy dog';
		const encoded = base64UrlEncode(original);
		const decoded = base64UrlDecode(encoded);
		expect(decoded).toBe(original);
	});
});

describe('isValidBase64Url', () => {
	it('returns true for valid Base64URL strings', () => {
		expect(isValidBase64Url('aGVsbG8')).toBe(true);
		expect(isValidBase64Url('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo')).toBe(true);
		expect(isValidBase64Url('MDEyMzQ1Njc4OQ')).toBe(true);
		expect(isValidBase64Url('abc-def_ghi')).toBe(true);
	});

	it('returns false for invalid characters', () => {
		expect(isValidBase64Url('abc+def')).toBe(false);
		expect(isValidBase64Url('abc/def')).toBe(false);
		expect(isValidBase64Url('abc=def')).toBe(false);
		expect(isValidBase64Url('abc def')).toBe(false);
		expect(isValidBase64Url('abc!def')).toBe(false);
	});

	it('returns true for empty string', () => {
		expect(isValidBase64Url('')).toBe(true);
	});
});

