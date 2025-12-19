import type { JsonValue, JsonObject, JsonArray } from './types';


export function prettify(value: JsonValue, sortKeys: boolean = false): string {
	const processed = sortKeys ? sortObjectKeysDeep(value) : value;
	return JSON.stringify(processed, null, 2);
}


export function minify(value: JsonValue): string {
	return JSON.stringify(value);
}


export function sortObjectKeysDeep(value: JsonValue): JsonValue {
	if (value === null) return null;

	if (Array.isArray(value)) {
		return value.map((item) => sortObjectKeysDeep(item)) as JsonArray;
	}

	if (typeof value === 'object') {
		const sorted: JsonObject = {};
		const keys = Object.keys(value).sort();
		for (const key of keys) {
			sorted[key] = sortObjectKeysDeep((value as JsonObject)[key]);
		}
		return sorted;
	}

	return value;
}


export function countChildren(value: JsonValue): number {
	if (value === null) return 0;
	if (Array.isArray(value)) return value.length;
	if (typeof value === 'object') return Object.keys(value).length;
	return 0;
}


export function formatPrimitive(value: JsonValue): string {
	if (value === null) return 'null';
	if (typeof value === 'string') return `"${value}"`;
	return String(value);
}


export function truncateString(str: string, maxLength: number = 50): string {
	if (str.length <= maxLength) return str;
	return str.slice(0, maxLength) + '...';
}

