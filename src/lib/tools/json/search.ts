import type { JsonValue, JsonObject } from './types';


export function matchesSearch(
	key: string,
	value: JsonValue,
	searchTerm: string
): boolean {
	if (!searchTerm.trim()) return true;

	const term = searchTerm.toLowerCase();

	// Check key
	if (key.toLowerCase().includes(term)) return true;

	// Check primitive values
	if (value === null) return 'null'.includes(term);
	if (typeof value === 'boolean') return String(value).includes(term);
	if (typeof value === 'number') return String(value).includes(term);
	if (typeof value === 'string') return value.toLowerCase().includes(term);

	return false;
}


export function hasMatchingDescendant(
	value: JsonValue,
	searchTerm: string
): boolean {
	if (!searchTerm.trim()) return true;

	const term = searchTerm.toLowerCase();

	if (value === null) return 'null'.includes(term);
	if (typeof value === 'boolean') return String(value).includes(term);
	if (typeof value === 'number') return String(value).includes(term);
	if (typeof value === 'string') return value.toLowerCase().includes(term);

	if (Array.isArray(value)) {
		return value.some((item, index) => {
			if (String(index).includes(term)) return true;
			return hasMatchingDescendant(item, searchTerm);
		});
	}

	if (typeof value === 'object') {
		return Object.entries(value as JsonObject).some(([key, val]) => {
			if (key.toLowerCase().includes(term)) return true;
			return hasMatchingDescendant(val, searchTerm);
		});
	}

	return false;
}


export function highlightMatch(
	text: string,
	searchTerm: string
): { before: string; match: string; after: string } | null {
	if (!searchTerm.trim()) return null;

	const lowerText = text.toLowerCase();
	const lowerTerm = searchTerm.toLowerCase();
	const index = lowerText.indexOf(lowerTerm);

	if (index === -1) return null;

	return {
		before: text.slice(0, index),
		match: text.slice(index, index + searchTerm.length),
		after: text.slice(index + searchTerm.length)
	};
}


export function buildPath(parentPath: string, key: string | number): string {
	if (!parentPath) return `$`;

	if (typeof key === 'number') {
		return `${parentPath}[${key}]`;
	}

	// Use dot notation for simple keys, bracket notation for others
	if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
		return `${parentPath}.${key}`;
	}

	return `${parentPath}["${key}"]`;
}

