export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type BodyType = 'none' | 'json' | 'raw' | 'form';

export interface KeyValuePair {
	id: string;
	key: string;
	value: string;
	enabled: boolean;
}

export interface RequestBody {
	type: BodyType;
	value: string;
}

export interface RequestModel {
	method: HttpMethod;
	url: string;
	query: KeyValuePair[];
	headers: KeyValuePair[];
	body: RequestBody;
}

export interface NormalizedRequest {
	method: HttpMethod;
	url: string;
	headers: Record<string, string>;
	body: string | undefined;
	contentType: string | undefined;
}

export type GeneratorType = 'curl' | 'fetch' | 'axios' | 'httpie';

export interface GeneratorResult {
	code: string;
	warnings: string[];
}

