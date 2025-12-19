import type { TimezoneOption, UnixPair } from './types';


export function formatIso(ms: number, timezone: TimezoneOption): string {
	const date = new Date(ms);

	if (isNaN(date.getTime())) {
		return 'Invalid date';
	}

	if (timezone === 'utc') {
		return date.toISOString();
	}

	// For local timezone, construct ISO-like string manually
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

	// Get timezone offset
	const offset = -date.getTimezoneOffset();
	const offsetSign = offset >= 0 ? '+' : '-';
	const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
	const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');

	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}


export function formatFriendly(ms: number, timezone: TimezoneOption, withMs: boolean = false): string {
	const date = new Date(ms);

	if (isNaN(date.getTime())) {
		return 'Invalid date';
	}

	const options: Intl.DateTimeFormatOptions = {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	};

	if (timezone === 'utc') {
		options.timeZone = 'UTC';
	}

	let formatted = new Intl.DateTimeFormat('en-US', options).format(date);

	if (withMs) {
		const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
		formatted += `.${milliseconds}`;
	}

	return formatted;
}


export function toUnix(ms: number): UnixPair {
	return {
		s: Math.floor(ms / 1000),
		ms: ms
	};
}


export function toDatetimeLocal(ms: number, timezone: TimezoneOption): string {
	const date = new Date(ms);

	if (isNaN(date.getTime())) {
		return '';
	}

	if (timezone === 'utc') {
		// Get UTC components
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, '0');
		const day = String(date.getUTCDate()).padStart(2, '0');
		const hours = String(date.getUTCHours()).padStart(2, '0');
		const minutes = String(date.getUTCMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	// Local timezone
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}


export function getTimezoneAbbr(timezone: TimezoneOption): string {
	if (timezone === 'utc') {
		return 'UTC';
	}

	// Get local timezone abbreviation
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZoneName: 'short'
	});
	const parts = formatter.formatToParts(new Date());
	const tzPart = parts.find(p => p.type === 'timeZoneName');
	return tzPart?.value || 'Local';
}

