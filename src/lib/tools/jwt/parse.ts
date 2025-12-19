import { base64UrlDecode, isValidBase64Url } from './base64url';
import type { JWTResult, JWTHeader, JWTPayload, ParsedJWT } from './types';


export function splitJWT(token: string): { header: string; payload: string; signature: string } | null {
	const trimmed = token.trim();
	const parts = trimmed.split('.');

	if (parts.length !== 3) {
		return null;
	}

	const [header, payload, signature] = parts;

	if (!header || !payload) {
		return null;
	}

	return { header, payload, signature };
}


function safeJsonParse<T>(json: string): T | null {
	try {
		return JSON.parse(json) as T;
	} catch {
		return null;
	}
}


export function parseJWT(token: string): JWTResult {
	if (!token || typeof token !== 'string') {
		return { success: false, error: 'Token is required' };
	}

	const parts = splitJWT(token);
	if (!parts) {
		return { success: false, error: 'Invalid JWT format. Expected header.payload.signature' };
	}

	const { header: rawHeader, payload: rawPayload, signature: rawSignature } = parts;

	// Validate Base64URL format
	if (!isValidBase64Url(rawHeader)) {
		return { success: false, error: 'Invalid Base64URL encoding in header' };
	}
	if (!isValidBase64Url(rawPayload)) {
		return { success: false, error: 'Invalid Base64URL encoding in payload' };
	}

	// Decode header
	let headerJson: string;
	try {
		headerJson = base64UrlDecode(rawHeader);
	} catch {
		return { success: false, error: 'Failed to decode header' };
	}

	const header = safeJsonParse<JWTHeader>(headerJson);
	if (!header) {
		return { success: false, error: 'Header is not valid JSON' };
	}

	if (typeof header !== 'object' || !header.alg) {
		return { success: false, error: 'Header must contain "alg" field' };
	}

	// Decode payload
	let payloadJson: string;
	try {
		payloadJson = base64UrlDecode(rawPayload);
	} catch {
		return { success: false, error: 'Failed to decode payload' };
	}

	const payload = safeJsonParse<JWTPayload>(payloadJson);
	if (!payload) {
		return { success: false, error: 'Payload is not valid JSON' };
	}

	const parsed: ParsedJWT = {
		header,
		payload,
		signature: rawSignature,
		raw: {
			header: rawHeader,
			payload: rawPayload,
			signature: rawSignature
		}
	};

	return { success: true, data: parsed };
}


export function isExpired(exp: number | undefined): boolean {
	if (exp === undefined) return false;
	return Date.now() / 1000 > exp;
}


export function getTimeUntilExpiration(exp: number | undefined): {
	expired: boolean;
	seconds: number;
	formatted: string;
} | null {
	if (exp === undefined) return null;

	const now = Date.now() / 1000;
	const diff = exp - now;

	if (diff <= 0) {
		return {
			expired: true,
			seconds: Math.abs(diff),
			formatted: formatDuration(Math.abs(diff)) + ' ago'
		};
	}

	return {
		expired: false,
		seconds: diff,
		formatted: 'in ' + formatDuration(diff)
	};
}


export function formatDuration(seconds: number): string {
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	const parts: string[] = [];

	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

	return parts.join(' ');
}


export function formatTimestamp(timestamp: number | undefined): string | null {
	if (timestamp === undefined) return null;

	try {
		const date = new Date(timestamp * 1000);
		return date.toLocaleString();
	} catch {
		return null;
	}
}


export function maskToken(token: string, visibleChars: number = 10): string {
	if (token.length <= visibleChars * 2) {
		return token;
	}
	const start = token.slice(0, visibleChars);
	const end = token.slice(-visibleChars);
	return `${start}...${end}`;
}

