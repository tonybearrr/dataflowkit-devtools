

export type InputKind = 'auto' | 'text' | 'base64' | 'base64url' | 'hex';

export interface ConvertSuccess<T> {
	ok: true;
	value: T;
}

export interface ConvertError {
	ok: false;
	error: string;
}

export type ConvertResult<T> = ConvertSuccess<T> | ConvertError;

export interface BytesResult {
	ok: true;
	bytes: Uint8Array;
}

export type BytesConvertResult = BytesResult | ConvertError;

export interface ConversionOutput {
	text: ConvertResult<string>;
	base64: ConvertResult<string>;
	base64url: ConvertResult<string>;
	hex: ConvertResult<string>;
}

export interface DetectionResult {
	kind: Exclude<InputKind, 'auto'>;
	confidence: 'high' | 'medium' | 'low';
}

