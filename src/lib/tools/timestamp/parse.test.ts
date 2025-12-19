import { describe, it, expect } from 'vitest';
import { parseUnix, parseIso, parseDatetimeLocal, detectUnit } from './parse';

describe('parseUnix', () => {
	it('parses seconds correctly', () => {
		const result = parseUnix('1734540000', 's');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.ms).toBe(1734540000000);
		}
	});

	it('parses milliseconds correctly', () => {
		const result = parseUnix('1734540000000', 'ms');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.ms).toBe(1734540000000);
		}
	});

	it('returns error for empty input', () => {
		const result = parseUnix('', 's');
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Timestamp is required');
		}
	});

	it('returns error for non-numeric input', () => {
		const result = parseUnix('not-a-number', 's');
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBe('Invalid number format');
		}
	});

	it('returns error for timestamp out of range', () => {
		const result = parseUnix('999999999999999', 's');
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('out of');
		}
	});

	it('handles negative timestamps (before 1970)', () => {
		const result = parseUnix('-1000000', 's');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.ms).toBe(-1000000000);
		}
	});

	it('handles decimal seconds', () => {
		const result = parseUnix('1734540000.5', 's');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.ms).toBe(1734540000500); // 0.5s = 500ms
		}
	});
});

describe('detectUnit', () => {
	it('detects seconds for 10-digit numbers', () => {
		expect(detectUnit('1734540000')).toBe('s');
	});

	it('detects milliseconds for 13-digit numbers', () => {
		expect(detectUnit('1734540000000')).toBe('ms');
	});

	it('defaults to seconds for invalid input', () => {
		expect(detectUnit('not-a-number')).toBe('s');
	});

	it('detects seconds for small numbers', () => {
		expect(detectUnit('1000')).toBe('s');
	});
});

describe('parseIso', () => {
	it('parses ISO string in UTC', () => {
		const result = parseIso('2024-12-18T12:00:00Z', 'utc');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.ms).toBe(new Date('2024-12-18T12:00:00Z').getTime());
		}
	});

	it('parses ISO string without Z as UTC when timezone is utc', () => {
		const result = parseIso('2024-12-18T12:00:00', 'utc');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.ms).toBe(new Date('2024-12-18T12:00:00Z').getTime());
		}
	});

	it('returns error for invalid ISO string', () => {
		const result = parseIso('not-a-date', 'utc');
		expect(result.ok).toBe(false);
	});

	it('returns error for empty input', () => {
		const result = parseIso('', 'utc');
		expect(result.ok).toBe(false);
	});
});

describe('parseDatetimeLocal', () => {
	it('parses datetime-local format', () => {
		const result = parseDatetimeLocal('2024-12-18T12:00', 'local');
		expect(result.ok).toBe(true);
	});

	it('parses datetime-local as UTC when specified', () => {
		const result = parseDatetimeLocal('2024-12-18T12:00', 'utc');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.ms).toBe(new Date('2024-12-18T12:00:00.000Z').getTime());
		}
	});

	it('returns error for empty input', () => {
		const result = parseDatetimeLocal('', 'local');
		expect(result.ok).toBe(false);
	});
});

