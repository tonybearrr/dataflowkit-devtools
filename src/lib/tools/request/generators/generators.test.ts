import { describe, it, expect } from 'vitest';
import { generateCurl } from './curl';
import { generateFetchTs } from './fetch';
import { generateAxios } from './axios';
import { generateHttpie } from './httpie';
import type { NormalizedRequest } from '../types';

const basicGetRequest: NormalizedRequest = {
	method: 'GET',
	url: 'https://api.example.com/users',
	headers: {},
	body: undefined,
	contentType: undefined
};

const postJsonRequest: NormalizedRequest = {
	method: 'POST',
	url: 'https://api.example.com/users',
	headers: {
		'Content-Type': 'application/json',
		Authorization: 'Bearer token123'
	},
	body: '{"name":"John","age":30}',
	contentType: 'application/json'
};

const requestWithQueryParams: NormalizedRequest = {
	method: 'GET',
	url: 'https://api.example.com/search?q=test&limit=10',
	headers: {},
	body: undefined,
	contentType: undefined
};

describe('generateCurl', () => {
	it('generates basic GET request', () => {
		const result = generateCurl(basicGetRequest);
		expect(result.code).toContain("curl 'https://api.example.com/users'");
		expect(result.code).not.toContain('-X GET');
	});

	it('generates POST request with headers and body', () => {
		const result = generateCurl(postJsonRequest);
		expect(result.code).toContain('-X POST');
		expect(result.code).toContain("-H 'Content-Type: application/json'");
		expect(result.code).toContain("-H 'Authorization: Bearer token123'");
		expect(result.code).toContain('--data-raw');
	});

	it('includes query params in URL', () => {
		const result = generateCurl(requestWithQueryParams);
		expect(result.code).toContain('q=test');
		expect(result.code).toContain('limit=10');
	});

	it('escapes single quotes in body', () => {
		const req: NormalizedRequest = {
			...postJsonRequest,
			body: "{'name':'O'Brien'}"
		};
		const result = generateCurl(req);
		// curl escapes ' as '\'' (close quote, escaped quote, open quote)
		expect(result.code).toContain("'\\''");
	});
});

describe('generateFetchTs', () => {
	it('generates basic GET request', () => {
		const result = generateFetchTs(basicGetRequest);
		expect(result.code).toContain('await fetch');
		expect(result.code).toContain("method: 'GET'");
		expect(result.code).toContain('https://api.example.com/users');
	});

	it('generates POST request with headers', () => {
		const result = generateFetchTs(postJsonRequest);
		expect(result.code).toContain("method: 'POST'");
		expect(result.code).toContain("'Content-Type': 'application/json'");
		expect(result.code).toContain('JSON.stringify');
	});

	it('uses raw string for invalid JSON body', () => {
		const req: NormalizedRequest = {
			...postJsonRequest,
			body: 'not valid json'
		};
		const result = generateFetchTs(req);
		expect(result.warnings).toContain('Body is not valid JSON');
	});

	it('includes response handling', () => {
		const result = generateFetchTs(basicGetRequest);
		expect(result.code).toContain('await response.json()');
	});
});

describe('generateAxios', () => {
	it('generates basic GET request', () => {
		const result = generateAxios(basicGetRequest);
		expect(result.code).toContain('axios.request');
		expect(result.code).toContain("method: 'GET'");
		expect(result.code).toContain("url: 'https://api.example.com/users'");
	});

	it('generates POST request with data', () => {
		const result = generateAxios(postJsonRequest);
		expect(result.code).toContain("method: 'POST'");
		expect(result.code).toContain('data:');
	});

	it('uses object literal for valid JSON', () => {
		const result = generateAxios(postJsonRequest);
		// Should parse JSON and output as object, not string
		expect(result.code).toContain('"name"');
		expect(result.code).toContain('"John"');
	});
});

describe('generateHttpie', () => {
	it('generates basic GET request', () => {
		const result = generateHttpie(basicGetRequest);
		expect(result.code).toContain('http');
		expect(result.code).toContain('https://api.example.com/users');
		expect(result.code).not.toContain('GET'); // GET is default
	});

	it('generates POST request', () => {
		const result = generateHttpie(postJsonRequest);
		expect(result.code).toContain('http');
		expect(result.code).toContain('POST');
	});

	it('uses key=value syntax for JSON objects', () => {
		const result = generateHttpie(postJsonRequest);
		// HTTPie uses key=value for string values
		expect(result.code).toMatch(/name=/);
	});
});

