import { describe, it, expect } from 'vitest';
import {
	buildUrlWithQuery,
	headersToRecord,
	normalizeRequest,
	isValidUrl,
	generateId
} from './normalize';
import type { KeyValuePair, RequestModel } from './types';

describe('buildUrlWithQuery', () => {
	it('returns base URL when no params', () => {
		const result = buildUrlWithQuery('https://api.example.com', []);
		expect(result).toBe('https://api.example.com');
	});

	it('appends enabled query params', () => {
		const params: KeyValuePair[] = [
			{ id: '1', key: 'foo', value: 'bar', enabled: true },
			{ id: '2', key: 'baz', value: 'qux', enabled: true }
		];
		const result = buildUrlWithQuery('https://api.example.com', params);
		expect(result).toContain('foo=bar');
		expect(result).toContain('baz=qux');
	});

	it('skips disabled params', () => {
		const params: KeyValuePair[] = [
			{ id: '1', key: 'foo', value: 'bar', enabled: false },
			{ id: '2', key: 'baz', value: 'qux', enabled: true }
		];
		const result = buildUrlWithQuery('https://api.example.com', params);
		expect(result).not.toContain('foo=bar');
		expect(result).toContain('baz=qux');
	});

	it('skips empty keys', () => {
		const params: KeyValuePair[] = [
			{ id: '1', key: '', value: 'bar', enabled: true },
			{ id: '2', key: 'baz', value: 'qux', enabled: true }
		];
		const result = buildUrlWithQuery('https://api.example.com', params);
		expect(result).not.toContain('=bar');
		expect(result).toContain('baz=qux');
	});

	it('encodes special characters', () => {
		const params: KeyValuePair[] = [{ id: '1', key: 'q', value: 'hello world', enabled: true }];
		const result = buildUrlWithQuery('https://api.example.com', params);
		expect(result).toContain('hello+world');
	});
});

describe('headersToRecord', () => {
	it('converts enabled headers to record', () => {
		const headers: KeyValuePair[] = [
			{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
			{ id: '2', key: 'Authorization', value: 'Bearer token', enabled: true }
		];
		const result = headersToRecord(headers);
		expect(result).toEqual({
			'Content-Type': 'application/json',
			Authorization: 'Bearer token'
		});
	});

	it('skips disabled headers', () => {
		const headers: KeyValuePair[] = [
			{ id: '1', key: 'Content-Type', value: 'application/json', enabled: false },
			{ id: '2', key: 'Authorization', value: 'Bearer token', enabled: true }
		];
		const result = headersToRecord(headers);
		expect(result).toEqual({
			Authorization: 'Bearer token'
		});
	});
});

describe('normalizeRequest', () => {
	it('normalizes a complete request', () => {
		const model: RequestModel = {
			method: 'POST',
			url: 'https://api.example.com',
			query: [{ id: '1', key: 'page', value: '1', enabled: true }],
			headers: [{ id: '1', key: 'Content-Type', value: 'application/json', enabled: true }],
			body: { type: 'json', value: '{"test":true}' }
		};
		const result = normalizeRequest(model);
		expect(result.method).toBe('POST');
		expect(result.url).toContain('page=1');
		expect(result.headers['Content-Type']).toBe('application/json');
		expect(result.body).toBe('{"test":true}');
		expect(result.contentType).toBe('application/json');
	});

	it('sets body to undefined when type is none', () => {
		const model: RequestModel = {
			method: 'GET',
			url: 'https://api.example.com',
			query: [],
			headers: [],
			body: { type: 'none', value: '' }
		};
		const result = normalizeRequest(model);
		expect(result.body).toBeUndefined();
	});
});

describe('isValidUrl', () => {
	it('validates correct URLs', () => {
		expect(isValidUrl('https://api.example.com')).toBe(true);
		expect(isValidUrl('http://localhost:3000')).toBe(true);
		expect(isValidUrl('https://api.example.com/path?query=1')).toBe(true);
	});

	it('rejects empty URLs', () => {
		expect(isValidUrl('')).toBe(false);
		expect(isValidUrl('   ')).toBe(false);
	});

	it('accepts relative URLs', () => {
		expect(isValidUrl('/api/users')).toBe(true);
	});
});

describe('generateId', () => {
	it('generates unique IDs', () => {
		const ids = new Set([generateId(), generateId(), generateId()]);
		expect(ids.size).toBe(3);
	});

	it('generates string IDs', () => {
		const id = generateId();
		expect(typeof id).toBe('string');
		expect(id.length).toBeGreaterThan(0);
	});
});

