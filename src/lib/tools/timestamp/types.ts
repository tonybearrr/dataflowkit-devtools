export type TimestampUnit = 's' | 'ms';
export type TimezoneOption = 'local' | 'utc';

export interface ParseSuccess {
	ok: true;
	ms: number;
}

export interface ParseError {
	ok: false;
	error: string;
}

export type ParseResult = ParseSuccess | ParseError;

export interface UnixPair {
	s: number;
	ms: number;
}

export interface TimestampState {
	ms: number | null;
	error: string | null;
}

