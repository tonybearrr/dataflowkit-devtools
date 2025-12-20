import { describe, it, expect } from 'vitest';
import { parseUrl, isValidUrl, parseQueryParams } from './parse';
import { buildUrl, createEmptyUrl, updateUrlComponent } from './build';
import { encodeValue, decodeValue, isEncoded, toggleEncoding, encodeUrl, decodeUrl } from './encode';

describe('URL Parsing', () => {
	describe('parseUrl', () => {
		it('parses a complete URL with all components', () => {
			const result = parseUrl('https://api.example.com:8080/v1/users?id=42&active=true#section');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.protocol).toBe('https:');
				expect(result.value.hostname).toBe('api.example.com');
				expect(result.value.port).toBe('8080');
				expect(result.value.pathname).toBe('/v1/users');
				expect(result.value.search).toBe('id=42&active=true');
				expect(result.value.hash).toBe('section');
				expect(result.params).toHaveLength(2);
				expect(result.params[0].key).toBe('id');
				expect(result.params[0].value).toBe('42');
				expect(result.params[1].key).toBe('active');
				expect(result.params[1].value).toBe('true');
			}
		});

		it('parses URL without protocol by adding https://', () => {
			const result = parseUrl('example.com/path');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.protocol).toBe('https:');
				expect(result.value.hostname).toBe('example.com');
				expect(result.value.pathname).toBe('/path');
			}
		});

		it('parses URL with http protocol', () => {
			const result = parseUrl('http://localhost:3000/api');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.protocol).toBe('http:');
				expect(result.value.hostname).toBe('localhost');
				expect(result.value.port).toBe('3000');
			}
		});

		it('parses URL with IPv4 address', () => {
			const result = parseUrl('http://192.168.1.1:8080/');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.hostname).toBe('192.168.1.1');
				expect(result.value.port).toBe('8080');
			}
		});

		it('parses URL with IPv6 address', () => {
			const result = parseUrl('http://[::1]:8080/');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.hostname).toBe('[::1]');
				expect(result.value.port).toBe('8080');
			}
		});

		it('parses URL with encoded query parameters', () => {
			const result = parseUrl('https://example.com?name=John%20Doe&city=New%20York');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.params[0].value).toBe('John Doe');
				expect(result.params[1].value).toBe('New York');
			}
		});

		it('returns error for empty input', () => {
			const result = parseUrl('');
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBe('URL cannot be empty');
			}
		});

		it('returns error for invalid URL', () => {
			const result = parseUrl('not a valid url :::');
			expect(result.ok).toBe(false);
		});

		it('handles URL with only hash', () => {
			const result = parseUrl('https://example.com#section');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.hash).toBe('section');
				expect(result.params).toHaveLength(0);
			}
		});

		it('handles URL with empty query string', () => {
			const result = parseUrl('https://example.com?');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.search).toBe('');
				expect(result.params).toHaveLength(0);
			}
		});
	});

	describe('isValidUrl', () => {
		it('returns true for valid URLs', () => {
			expect(isValidUrl('https://example.com')).toBe(true);
			expect(isValidUrl('http://localhost:3000')).toBe(true);
			expect(isValidUrl('example.com')).toBe(true);
		});

		it('returns false for invalid URLs', () => {
			expect(isValidUrl('')).toBe(false);
			expect(isValidUrl('   ')).toBe(false);
		});
	});

	describe('parseQueryParams', () => {
		it('parses query string into params', () => {
			const params = parseQueryParams('id=1&name=test');
			expect(params).toHaveLength(2);
			expect(params[0].key).toBe('id');
			expect(params[0].value).toBe('1');
			expect(params[1].key).toBe('name');
			expect(params[1].value).toBe('test');
		});

		it('returns empty array for empty string', () => {
			const params = parseQueryParams('');
			expect(params).toHaveLength(0);
		});

		it('handles encoded values', () => {
			const params = parseQueryParams('name=John%20Doe');
			expect(params[0].value).toBe('John Doe');
		});
	});
});

describe('URL Building', () => {
	describe('buildUrl', () => {
		it('builds URL from components and params', () => {
			const base = {
				href: 'https://example.com/',
				protocol: 'https:',
				hostname: 'example.com',
				port: '',
				pathname: '/api',
				search: '',
				hash: '',
				host: 'example.com',
				origin: 'https://example.com'
			};
			const params = [
				{ id: '1', key: 'id', value: '42', enabled: true },
				{ id: '2', key: 'active', value: 'true', enabled: true }
			];
			
			const url = buildUrl(base, params);
			expect(url).toBe('https://example.com/api?id=42&active=true');
		});

		it('excludes disabled params', () => {
			const base = createEmptyUrl();
			base.protocol = 'https:';
			base.host = 'example.com';
			base.pathname = '/';
			
			const params = [
				{ id: '1', key: 'keep', value: '1', enabled: true },
				{ id: '2', key: 'skip', value: '2', enabled: false }
			];
			
			const url = buildUrl(base, params);
			expect(url).toBe('https://example.com/?keep=1');
		});

		it('excludes params with empty keys', () => {
			const base = createEmptyUrl();
			base.protocol = 'https:';
			base.host = 'example.com';
			base.pathname = '/';
			
			const params = [
				{ id: '1', key: 'valid', value: '1', enabled: true },
				{ id: '2', key: '', value: 'empty-key', enabled: true }
			];
			
			const url = buildUrl(base, params);
			expect(url).toBe('https://example.com/?valid=1');
		});

		it('preserves hash', () => {
			const base = createEmptyUrl();
			base.protocol = 'https:';
			base.host = 'example.com';
			base.pathname = '/';
			base.hash = 'section';
			
			const url = buildUrl(base, []);
			expect(url).toBe('https://example.com/#section');
		});

		it('encodes special characters in params', () => {
			const base = createEmptyUrl();
			base.protocol = 'https:';
			base.host = 'example.com';
			base.pathname = '/';
			
			const params = [
				{ id: '1', key: 'name', value: 'John Doe', enabled: true }
			];
			
			const url = buildUrl(base, params);
			expect(url).toContain('name=John+Doe');
		});
	});

	describe('updateUrlComponent', () => {
		it('updates hostname', () => {
			const base = {
				href: 'https://example.com/',
				protocol: 'https:',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: '',
				host: 'example.com',
				origin: 'https://example.com'
			};
			
			const updated = updateUrlComponent(base, 'hostname', 'new.example.com');
			expect(updated?.hostname).toBe('new.example.com');
		});

		it('updates port', () => {
			const base = createEmptyUrl();
			base.href = 'https://example.com/';
			base.protocol = 'https:';
			base.hostname = 'example.com';
			base.host = 'example.com';
			
			const updated = updateUrlComponent(base, 'port', '8080');
			expect(updated?.port).toBe('8080');
		});

		it('handles protocol update', () => {
			const base = {
				href: 'https://example.com/',
				protocol: 'https:',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: '',
				host: 'example.com',
				origin: 'https://example.com'
			};
			
			const updated = updateUrlComponent(base, 'protocol', 'http:');
			expect(updated?.protocol).toBe('http:');
		});
	});

	describe('createEmptyUrl', () => {
		it('creates empty URL structure', () => {
			const empty = createEmptyUrl();
			expect(empty.protocol).toBe('https:');
			expect(empty.hostname).toBe('');
			expect(empty.pathname).toBe('/');
		});
	});
});

describe('URL Encoding', () => {
	describe('encodeValue', () => {
		it('encodes special characters', () => {
			expect(encodeValue('hello world')).toBe('hello%20world');
			expect(encodeValue('a=b&c=d')).toBe('a%3Db%26c%3Dd');
			expect(encodeValue('foo?bar')).toBe('foo%3Fbar');
		});

		it('preserves safe characters', () => {
			expect(encodeValue('abc123')).toBe('abc123');
			expect(encodeValue('hello-world_test')).toBe('hello-world_test');
		});

		it('encodes unicode characters', () => {
			expect(encodeValue('こんにちは')).toBe('%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF');
		});
	});

	describe('decodeValue', () => {
		it('decodes encoded characters', () => {
			const result = decodeValue('hello%20world');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe('hello world');
			}
		});

		it('returns error for invalid encoding', () => {
			const result = decodeValue('%ZZ');
			expect(result.ok).toBe(false);
		});

		it('handles already decoded strings', () => {
			const result = decodeValue('hello world');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe('hello world');
			}
		});
	});

	describe('isEncoded', () => {
		it('detects encoded strings', () => {
			expect(isEncoded('hello%20world')).toBe(true);
			expect(isEncoded('%3F')).toBe(true);
		});

		it('returns false for non-encoded strings', () => {
			expect(isEncoded('hello world')).toBe(false);
			expect(isEncoded('abc123')).toBe(false);
		});
	});

	describe('toggleEncoding', () => {
		it('encodes non-encoded string', () => {
			expect(toggleEncoding('hello world')).toBe('hello%20world');
		});

		it('decodes encoded string', () => {
			expect(toggleEncoding('hello%20world')).toBe('hello world');
		});
	});

	describe('encodeUrl', () => {
		it('encodes URL preserving structure', () => {
			const encoded = encodeUrl('https://example.com/path with spaces');
			expect(encoded).toBe('https://example.com/path%20with%20spaces');
		});
	});

	describe('decodeUrl', () => {
		it('decodes URL', () => {
			const result = decodeUrl('https://example.com/path%20with%20spaces');
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe('https://example.com/path with spaces');
			}
		});

		it('returns error for invalid encoding', () => {
			const result = decodeUrl('https://example.com/%ZZ');
			expect(result.ok).toBe(false);
		});
	});
});

