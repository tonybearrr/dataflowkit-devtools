import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	splitJWT,
	parseJWT,
	isExpired,
	getTimeUntilExpiration,
	formatDuration,
	formatTimestamp,
	maskToken
} from './parse';

// Sample valid JWT (HS256)
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
const VALID_JWT =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('splitJWT', () => {
	it('splits a valid JWT into three parts', () => {
		const result = splitJWT(VALID_JWT);
		expect(result).not.toBeNull();
		expect(result!.header).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
		expect(result!.payload).toBe(
			'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'
		);
		expect(result!.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
	});

	it('returns null for string with wrong number of parts', () => {
		expect(splitJWT('only.two')).toBeNull();
		expect(splitJWT('too.many.parts.here')).toBeNull();
		expect(splitJWT('noparts')).toBeNull();
	});

	it('handles whitespace', () => {
		const result = splitJWT('  ' + VALID_JWT + '  ');
		expect(result).not.toBeNull();
	});

	it('returns null for empty parts', () => {
		expect(splitJWT('..signature')).toBeNull();
		expect(splitJWT('header..')).toBeNull();
	});
});

describe('parseJWT', () => {
	it('parses a valid JWT', () => {
		const result = parseJWT(VALID_JWT);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.header.alg).toBe('HS256');
			expect(result.data.header.typ).toBe('JWT');
			expect(result.data.payload.sub).toBe('1234567890');
			expect(result.data.payload.name).toBe('John Doe');
			expect(result.data.payload.iat).toBe(1516239022);
		}
	});

	it('returns error for empty token', () => {
		const result = parseJWT('');
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe('Token is required');
		}
	});

	it('returns error for invalid format', () => {
		const result = parseJWT('not.a.valid.jwt');
		expect(result.success).toBe(false);
	});

	it('returns error for invalid Base64URL in header', () => {
		const result = parseJWT('!!!.payload.signature');
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('Base64URL');
		}
	});

	it('returns error for invalid JSON in header', () => {
		// "notjson" in Base64URL
		const result = parseJWT('bm90anNvbg.eyJ0ZXN0IjoxfQ.sig');
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('JSON');
		}
	});

	it('returns error for header without alg', () => {
		// {"typ":"JWT"} without alg
		const result = parseJWT('eyJ0eXAiOiJKV1QifQ.eyJ0ZXN0IjoxfQ.sig');
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain('alg');
		}
	});
});

describe('isExpired', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns false when exp is undefined', () => {
		expect(isExpired(undefined)).toBe(false);
	});

	it('returns true when token is expired', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
		const expiredTime = Math.floor(new Date('2024-01-01T11:00:00Z').getTime() / 1000);
		expect(isExpired(expiredTime)).toBe(true);
	});

	it('returns false when token is not expired', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
		const futureTime = Math.floor(new Date('2024-01-01T13:00:00Z').getTime() / 1000);
		expect(isExpired(futureTime)).toBe(false);
	});
});

describe('getTimeUntilExpiration', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns null when exp is undefined', () => {
		expect(getTimeUntilExpiration(undefined)).toBeNull();
	});

	it('returns expired info for past exp', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
		const expiredTime = Math.floor(new Date('2024-01-01T11:00:00Z').getTime() / 1000);
		const result = getTimeUntilExpiration(expiredTime);
		expect(result).not.toBeNull();
		expect(result!.expired).toBe(true);
		expect(result!.formatted).toContain('ago');
	});

	it('returns valid info for future exp', () => {
		vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
		const futureTime = Math.floor(new Date('2024-01-01T13:00:00Z').getTime() / 1000);
		const result = getTimeUntilExpiration(futureTime);
		expect(result).not.toBeNull();
		expect(result!.expired).toBe(false);
		expect(result!.formatted).toContain('in');
	});
});

describe('formatDuration', () => {
	it('formats seconds only', () => {
		expect(formatDuration(45)).toBe('45s');
	});

	it('formats minutes and seconds', () => {
		expect(formatDuration(125)).toBe('2m 5s');
	});

	it('formats hours, minutes, seconds', () => {
		expect(formatDuration(3725)).toBe('1h 2m 5s');
	});

	it('formats days', () => {
		expect(formatDuration(90061)).toBe('1d 1h 1m 1s');
	});

	it('handles zero', () => {
		expect(formatDuration(0)).toBe('0s');
	});

	it('omits zero components', () => {
		expect(formatDuration(3600)).toBe('1h');
		expect(formatDuration(86400)).toBe('1d');
	});
});

describe('formatTimestamp', () => {
	it('returns null for undefined', () => {
		expect(formatTimestamp(undefined)).toBeNull();
	});

	it('formats a valid timestamp', () => {
		const result = formatTimestamp(1704067200); // 2024-01-01 00:00:00 UTC
		expect(result).not.toBeNull();
		expect(typeof result).toBe('string');
	});
});

describe('maskToken', () => {
	it('masks a long token', () => {
		const token = 'abcdefghij1234567890klmnopqrst';
		const masked = maskToken(token, 10);
		expect(masked).toBe('abcdefghij...klmnopqrst');
	});

	it('does not mask short tokens', () => {
		const token = 'short';
		const masked = maskToken(token, 10);
		expect(masked).toBe('short');
	});

	it('uses default visible chars', () => {
		const token = 'a'.repeat(50);
		const masked = maskToken(token);
		expect(masked.startsWith('aaaaaaaaaa...')).toBe(true);
		expect(masked.endsWith('...aaaaaaaaaa')).toBe(true);
	});
});

