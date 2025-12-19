import { describe, it, expect } from 'vitest';
import { formatIso, formatFriendly, toUnix, toDatetimeLocal, getTimezoneAbbr } from './format';

describe('formatIso', () => {
	it('formats UTC correctly', () => {
		const ms = new Date('2024-12-18T12:00:00Z').getTime();
		const result = formatIso(ms, 'utc');
		expect(result).toBe('2024-12-18T12:00:00.000Z');
	});

	it('formats local timezone with offset', () => {
		const ms = new Date('2024-12-18T12:00:00Z').getTime();
		const result = formatIso(ms, 'local');
		// Should contain a timezone offset like +XX:XX or -XX:XX
		expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}/);
	});

	it('returns "Invalid date" for NaN', () => {
		const result = formatIso(NaN, 'utc');
		expect(result).toBe('Invalid date');
	});
});

describe('formatFriendly', () => {
	it('formats date in friendly format', () => {
		const ms = new Date('2024-12-18T12:00:00Z').getTime();
		const result = formatFriendly(ms, 'utc', false);
		expect(result).toContain('Dec');
		expect(result).toContain('18');
		expect(result).toContain('2024');
	});

	it('includes milliseconds when requested', () => {
		const ms = new Date('2024-12-18T12:00:00.123Z').getTime();
		const result = formatFriendly(ms, 'utc', true);
		expect(result).toContain('.123');
	});

	it('returns "Invalid date" for NaN', () => {
		const result = formatFriendly(NaN, 'utc', false);
		expect(result).toBe('Invalid date');
	});
});

describe('toUnix', () => {
	it('converts ms to seconds and ms pair', () => {
		const result = toUnix(1734540000000);
		expect(result.s).toBe(1734540000);
		expect(result.ms).toBe(1734540000000);
	});

	it('handles non-round milliseconds', () => {
		const result = toUnix(1734540000500);
		expect(result.s).toBe(1734540000);
		expect(result.ms).toBe(1734540000500);
	});
});

describe('toDatetimeLocal', () => {
	it('formats for datetime-local input in UTC', () => {
		const ms = new Date('2024-12-18T12:00:00Z').getTime();
		const result = toDatetimeLocal(ms, 'utc');
		expect(result).toBe('2024-12-18T12:00');
	});

	it('formats for datetime-local input in local timezone', () => {
		const ms = new Date('2024-12-18T12:00:00Z').getTime();
		const result = toDatetimeLocal(ms, 'local');
		// Should be in YYYY-MM-DDTHH:mm format
		expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
	});

	it('returns empty string for invalid date', () => {
		const result = toDatetimeLocal(NaN, 'utc');
		expect(result).toBe('');
	});
});

describe('getTimezoneAbbr', () => {
	it('returns UTC for utc timezone', () => {
		const result = getTimezoneAbbr('utc');
		expect(result).toBe('UTC');
	});

	it('returns a string for local timezone', () => {
		const result = getTimezoneAbbr('local');
		expect(typeof result).toBe('string');
		expect(result.length).toBeGreaterThan(0);
	});
});

