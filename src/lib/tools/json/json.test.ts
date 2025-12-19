import { describe, it, expect } from 'vitest';
import { parseJson, getValueType, isLargeJson, checkBracketBalance, getBracketBalanceMessage } from './parse';
import { prettify, minify, sortObjectKeysDeep, countChildren } from './format';
import { matchesSearch, hasMatchingDescendant, highlightMatch, buildPath } from './search';

describe('parseJson', () => {
	it('parses valid JSON object', () => {
		const result = parseJson('{"name": "test"}');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual({ name: 'test' });
		}
	});

	it('parses valid JSON array', () => {
		const result = parseJson('[1, 2, 3]');
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual([1, 2, 3]);
		}
	});

	it('parses primitives', () => {
		expect(parseJson('"hello"').ok).toBe(true);
		expect(parseJson('123').ok).toBe(true);
		expect(parseJson('true').ok).toBe(true);
		expect(parseJson('null').ok).toBe(true);
	});

	it('returns error for invalid JSON', () => {
		const result = parseJson('{invalid}');
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toBeTruthy();
		}
	});

	it('returns error for empty input', () => {
		const result = parseJson('');
		expect(result.ok).toBe(false);
	});

	it('extracts position for syntax errors', () => {
		const result = parseJson('{"key": }');
		expect(result.ok).toBe(false);
	});
});

describe('getValueType', () => {
	it('identifies object', () => {
		expect(getValueType({})).toBe('object');
		expect(getValueType({ key: 'value' })).toBe('object');
	});

	it('identifies array', () => {
		expect(getValueType([])).toBe('array');
		expect(getValueType([1, 2, 3])).toBe('array');
	});

	it('identifies primitives', () => {
		expect(getValueType('string')).toBe('string');
		expect(getValueType(123)).toBe('number');
		expect(getValueType(true)).toBe('boolean');
		expect(getValueType(null)).toBe('null');
	});
});

describe('prettify', () => {
	it('formats JSON with indentation', () => {
		const result = prettify({ name: 'test' });
		expect(result).toContain('  ');
		expect(result).toContain('\n');
	});

	it('sorts keys when enabled', () => {
		const result = prettify({ z: 1, a: 2 }, true);
		const lines = result.split('\n');
		const aIndex = lines.findIndex((l) => l.includes('"a"'));
		const zIndex = lines.findIndex((l) => l.includes('"z"'));
		expect(aIndex).toBeLessThan(zIndex);
	});

	it('does not sort keys by default', () => {
		const result = prettify({ z: 1, a: 2 }, false);
		const lines = result.split('\n');
		const aIndex = lines.findIndex((l) => l.includes('"a"'));
		const zIndex = lines.findIndex((l) => l.includes('"z"'));
		expect(zIndex).toBeLessThan(aIndex);
	});
});

describe('minify', () => {
	it('removes whitespace', () => {
		const result = minify({ name: 'test', value: 123 });
		expect(result).not.toContain('\n');
		expect(result).not.toContain('  ');
		expect(result).toBe('{"name":"test","value":123}');
	});
});

describe('sortObjectKeysDeep', () => {
	it('sorts object keys alphabetically', () => {
		const result = sortObjectKeysDeep({ z: 1, a: 2, m: 3 });
		const keys = Object.keys(result as object);
		expect(keys).toEqual(['a', 'm', 'z']);
	});

	it('sorts nested objects', () => {
		const result = sortObjectKeysDeep({ z: { b: 1, a: 2 }, a: 1 }) as { z: { a: number; b: number } };
		const nestedKeys = Object.keys(result.z);
		expect(nestedKeys).toEqual(['a', 'b']);
	});

	it('preserves array order', () => {
		const result = sortObjectKeysDeep([3, 1, 2]);
		expect(result).toEqual([3, 1, 2]);
	});

	it('handles null and primitives', () => {
		expect(sortObjectKeysDeep(null)).toBe(null);
		expect(sortObjectKeysDeep('string')).toBe('string');
		expect(sortObjectKeysDeep(123)).toBe(123);
	});
});

describe('countChildren', () => {
	it('counts object keys', () => {
		expect(countChildren({ a: 1, b: 2 })).toBe(2);
	});

	it('counts array items', () => {
		expect(countChildren([1, 2, 3])).toBe(3);
	});

	it('returns 0 for primitives', () => {
		expect(countChildren(null)).toBe(0);
		expect(countChildren('string')).toBe(0);
	});
});

describe('matchesSearch', () => {
	it('matches key', () => {
		expect(matchesSearch('name', 'John', 'nam')).toBe(true);
	});

	it('matches string value', () => {
		expect(matchesSearch('key', 'hello world', 'world')).toBe(true);
	});

	it('matches number value', () => {
		expect(matchesSearch('key', 123, '12')).toBe(true);
	});

	it('is case insensitive', () => {
		expect(matchesSearch('NAME', 'value', 'name')).toBe(true);
		expect(matchesSearch('key', 'VALUE', 'value')).toBe(true);
	});

	it('returns true for empty search', () => {
		expect(matchesSearch('key', 'value', '')).toBe(true);
	});
});

describe('hasMatchingDescendant', () => {
	it('finds match in nested object', () => {
		const value = { user: { name: 'John' } };
		expect(hasMatchingDescendant(value, 'john')).toBe(true);
	});

	it('finds match in array', () => {
		const value = ['apple', 'banana'];
		expect(hasMatchingDescendant(value, 'ban')).toBe(true);
	});

	it('returns false when no match', () => {
		const value = { a: 1 };
		expect(hasMatchingDescendant(value, 'xyz')).toBe(false);
	});
});

describe('highlightMatch', () => {
	it('returns parts for match', () => {
		const result = highlightMatch('hello world', 'wor');
		expect(result).toEqual({
			before: 'hello ',
			match: 'wor',
			after: 'ld'
		});
	});

	it('returns null for no match', () => {
		const result = highlightMatch('hello', 'xyz');
		expect(result).toBe(null);
	});

	it('returns null for empty search', () => {
		const result = highlightMatch('hello', '');
		expect(result).toBe(null);
	});
});

describe('buildPath', () => {
	it('builds root path', () => {
		expect(buildPath('', 'root')).toBe('$');
	});

	it('builds object path with dot notation', () => {
		expect(buildPath('$', 'user')).toBe('$.user');
		expect(buildPath('$.user', 'name')).toBe('$.user.name');
	});

	it('builds array path with bracket notation', () => {
		expect(buildPath('$', 0)).toBe('$[0]');
		expect(buildPath('$.items', 3)).toBe('$.items[3]');
	});

	it('uses bracket notation for special keys', () => {
		expect(buildPath('$', 'my-key')).toBe('$["my-key"]');
		expect(buildPath('$', 'key with space')).toBe('$["key with space"]');
	});
});

describe('isLargeJson', () => {
	it('returns false for small JSON', () => {
		expect(isLargeJson('{"small": true}')).toBe(false);
	});

	it('returns true for large JSON', () => {
		const largeJson = '{"data": "' + 'x'.repeat(3 * 1024 * 1024) + '"}';
		expect(isLargeJson(largeJson)).toBe(true);
	});
});

describe('checkBracketBalance', () => {
	it('returns balanced for valid JSON', () => {
		const result = checkBracketBalance('{"array": [1, 2, 3]}');
		expect(result.isBalanced).toBe(true);
		expect(result.brackets.open).toBe(1);
		expect(result.brackets.close).toBe(1);
		expect(result.braces.open).toBe(1);
		expect(result.braces.close).toBe(1);
	});

	it('detects unclosed bracket', () => {
		const result = checkBracketBalance('{"array": [1, 2, 3}');
		expect(result.isBalanced).toBe(false);
		// Both { and [ are unclosed because } doesn't match [
		expect(result.unclosed.length).toBe(2);
		expect(result.unclosed[0].char).toBe('{');
		expect(result.unclosed[1].char).toBe('[');
	});

	it('detects unclosed brace', () => {
		const result = checkBracketBalance('{"nested": {"inner": true}');
		expect(result.isBalanced).toBe(false);
		expect(result.unclosed.length).toBe(1);
		expect(result.unclosed[0].char).toBe('{');
	});

	it('detects unexpected closing bracket', () => {
		const result = checkBracketBalance('{"array": 1, 2, 3]}');
		expect(result.isBalanced).toBe(false);
		expect(result.unexpected.length).toBe(1);
		expect(result.unexpected[0].char).toBe(']');
	});

	it('ignores brackets inside strings', () => {
		const result = checkBracketBalance('{"text": "has [brackets] and {braces}"}');
		expect(result.isBalanced).toBe(true);
		expect(result.brackets.open).toBe(0);
		expect(result.brackets.close).toBe(0);
		expect(result.braces.open).toBe(1);
		expect(result.braces.close).toBe(1);
	});

	it('handles escaped quotes in strings', () => {
		const result = checkBracketBalance('{"text": "quote \\" and [bracket]"}');
		expect(result.isBalanced).toBe(true);
	});

	it('tracks line and column of unclosed brackets', () => {
		const result = checkBracketBalance('{\n  "array": [\n    1\n  }\n}');
		expect(result.isBalanced).toBe(false);
		// Both { (line 1) and [ (line 2) are unclosed
		expect(result.unclosed.length).toBe(2);
		expect(result.unclosed[0].line).toBe(1);
		expect(result.unclosed[1].line).toBe(2);
	});
});

describe('getBracketBalanceMessage', () => {
	it('returns null for balanced brackets', () => {
		const balance = checkBracketBalance('{"valid": [1, 2, 3]}');
		expect(getBracketBalanceMessage(balance)).toBeNull();
	});

	it('returns message for unclosed brackets', () => {
		const balance = checkBracketBalance('{"array": [1, 2, 3');
		const message = getBracketBalanceMessage(balance);
		expect(message).toContain('Unclosed');
	});

	it('returns message with bracket counts', () => {
		const balance = checkBracketBalance('[1, 2, 3]]');
		const message = getBracketBalanceMessage(balance);
		expect(message).toContain('Square brackets');
		expect(message).toContain('1×');
		expect(message).toContain('2×');
	});
});

