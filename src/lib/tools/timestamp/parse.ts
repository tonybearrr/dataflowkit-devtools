import type { ParseResult, TimestampUnit, TimezoneOption } from './types';

// Reasonable timestamp bounds
const MIN_TIMESTAMP_S = 0; // 1970-01-01
const MAX_TIMESTAMP_S = 32503680000; // 3000-01-01
const MAX_TIMESTAMP_MS = MAX_TIMESTAMP_S * 1000;


export function parseUnix(input: string, unit: TimestampUnit): ParseResult {
	const trimmed = input.trim();

	if (!trimmed) {
		return { ok: false, error: 'Timestamp is required' };
	}

	// Allow negative for dates before 1970
	const num = Number(trimmed);

	if (!Number.isFinite(num)) {
		return { ok: false, error: 'Invalid number format' };
	}

	let ms: number;

	if (unit === 's') {
		if (num < -MAX_TIMESTAMP_S || num > MAX_TIMESTAMP_S) {
			return { ok: false, error: 'Timestamp out of valid range' };
		}
		ms = Math.round(num * 1000);
	} else {
		if (num < -MAX_TIMESTAMP_MS || num > MAX_TIMESTAMP_MS) {
			return { ok: false, error: 'Timestamp out of valid range' };
		}
		ms = Math.round(num);
	}

	// Validate the resulting date
	const date = new Date(ms);
	if (isNaN(date.getTime())) {
		return { ok: false, error: 'Invalid timestamp value' };
	}

	return { ok: true, ms };
}


export function detectUnit(input: string): TimestampUnit {
	const trimmed = input.trim();
	const num = Math.abs(Number(trimmed));

	if (isNaN(num)) return 's';

	// 13+ digits typically means milliseconds
	// Current timestamp in seconds is ~10 digits
	// In milliseconds it's ~13 digits
	if (num > 9999999999) {
		return 'ms';
	}
	return 's';
}


export function parseIso(input: string, timezone: TimezoneOption): ParseResult {
	const trimmed = input.trim();

	if (!trimmed) {
		return { ok: false, error: 'Date/time is required' };
	}

	let date: Date;

	if (timezone === 'utc') {
		// If input doesn't have timezone info, treat as UTC
		if (!trimmed.includes('Z') && !trimmed.includes('+') && !trimmed.match(/-\d{2}:\d{2}$/)) {
			date = new Date(trimmed + 'Z');
		} else {
			date = new Date(trimmed);
		}
	} else {
		// Local timezone - datetime-local gives us YYYY-MM-DDTHH:mm format
		date = new Date(trimmed);
	}

	if (isNaN(date.getTime())) {
		return { ok: false, error: 'Invalid date/time format' };
	}

	const ms = date.getTime();

	if (ms < -MAX_TIMESTAMP_MS || ms > MAX_TIMESTAMP_MS) {
		return { ok: false, error: 'Date out of valid range' };
	}

	return { ok: true, ms };
}


export function parseDatetimeLocal(input: string, timezone: TimezoneOption): ParseResult {
	const trimmed = input.trim();

	if (!trimmed) {
		return { ok: false, error: 'Date/time is required' };
	}

	let date: Date;

	if (timezone === 'utc') {
		// Treat the input as UTC time
		date = new Date(trimmed + ':00.000Z');
	} else {
		// Treat as local time
		date = new Date(trimmed);
	}

	if (isNaN(date.getTime())) {
		return { ok: false, error: 'Invalid date/time format' };
	}

	return { ok: true, ms: date.getTime() };
}

