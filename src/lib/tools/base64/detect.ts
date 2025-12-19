

import type { DetectionResult } from './types';
import { isValidBase64 } from './base64';
import { isValidBase64Url } from './base64url';
import { isValidHex } from './hex';


export function detectKind(input: string): DetectionResult {
	const trimmed = input.trim();

	// Empty or very short strings are likely text
	if (trimmed.length < 4) {
		return { kind: 'text', confidence: 'high' };
	}

	if (isLikelyHex(trimmed)) {
		return { kind: 'hex', confidence: getHexConfidence(trimmed) };
	}

	if (isLikelyBase64Url(trimmed)) {
		return { kind: 'base64url', confidence: getBase64Confidence(trimmed) };
	}

	if (isLikelyBase64(trimmed)) {
		return { kind: 'base64', confidence: getBase64Confidence(trimmed) };
	}

	return { kind: 'text', confidence: 'high' };
}


function isLikelyHex(input: string): boolean {
	// Check for 0x prefix
	if (input.toLowerCase().startsWith('0x')) {
		const hex = input.slice(2);
		return isValidHex(hex, false);
	}

	// Check if all characters are hex digits
	const cleaned = input.replace(/[\s\n\r]/g, '');
	if (!isValidHex(cleaned, false)) return false;

	// Only consider as hex if:
	// - Length is even (typical for hex)
	// - Length >= 8 (to avoid false positives like "dead", "cafe")
	// - OR contains only 0-9 and a-f (no g-z)
	const hasOnlyHexChars = /^[0-9a-fA-F\s]+$/.test(input);
	const hasLettersBeyondF = /[g-zG-Z]/.test(cleaned);

	if (hasLettersBeyondF) return false;

	// Require reasonable length for hex detection
	if (cleaned.length >= 8 && cleaned.length % 2 === 0 && hasOnlyHexChars) {
		return true;
	}

	return false;
}


function isLikelyBase64Url(input: string): boolean {
	const cleaned = input.replace(/[\s\n\r]/g, '');

	if (!isValidBase64Url(cleaned, false)) return false;

	// Must contain Base64URL-specific characters (- or _)
	// or not contain Base64-specific characters (+ or /)
	const hasUrlChars = /-|_/.test(cleaned);
	const hasStdChars = /\+|\//.test(cleaned);

	if (hasUrlChars && !hasStdChars) {
		return true;
	}

	return false;
}


function isLikelyBase64(input: string): boolean {
	const cleaned = input.replace(/[\s\n\r]/g, '');

	if (!isValidBase64(cleaned, false)) return false;

	// Strong indicators:
	// - Ends with = padding
	// - Contains + or / characters
	// - Length is divisible by 4
	const hasPadding = cleaned.endsWith('=');
	const hasStdChars = /\+|\//.test(cleaned);
	const validLength = cleaned.length % 4 === 0;

	// Strong confidence if has padding or Base64-specific chars
	if (hasPadding || hasStdChars) {
		return true;
	}

	// Medium confidence if valid length and looks like Base64
	// Minimum length to avoid false positives
	if (validLength && cleaned.length >= 12) {
		// Check if it looks like random characters
		const hasUpperLower = /[A-Z]/.test(cleaned) && /[a-z]/.test(cleaned);
		const hasNumbers = /[0-9]/.test(cleaned);
		if (hasUpperLower && hasNumbers) {
			return true;
		}
	}

	return false;
}


function getHexConfidence(input: string): 'high' | 'medium' | 'low' {
	if (input.toLowerCase().startsWith('0x')) return 'high';

	const cleaned = input.replace(/[\s\n\r]/g, '');

	// Long hex strings are likely intentional
	if (cleaned.length >= 32) return 'high';
	if (cleaned.length >= 16) return 'medium';
	return 'low';
}


function getBase64Confidence(input: string): 'high' | 'medium' | 'low' {
	const cleaned = input.replace(/[\s\n\r]/g, '');

	// Has padding = high confidence
	if (cleaned.endsWith('=')) return 'high';

	// Has Base64-specific chars
	if (/[+/_-]/.test(cleaned)) return 'medium';

	// Long strings are more likely Base64
	if (cleaned.length >= 32) return 'medium';
	return 'low';
}


export function detectInputKind(input: string): 'text' | 'base64' | 'base64url' | 'hex' {
	return detectKind(input).kind;
}

