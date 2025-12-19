export interface JWTHeader {
	alg: string;
	typ?: string;
	kid?: string;
	[key: string]: unknown;
}

export interface JWTPayload {
	iss?: string;
	sub?: string;
	aud?: string | string[];
	exp?: number;
	nbf?: number;
	iat?: number;
	jti?: string;
	[key: string]: unknown;
}

export interface ParsedJWT {
	header: JWTHeader;
	payload: JWTPayload;
	signature: string;
	raw: {
		header: string;
		payload: string;
		signature: string;
	};
}

export interface JWTParseResult {
	success: true;
	data: ParsedJWT;
}

export interface JWTParseError {
	success: false;
	error: string;
}

export type JWTResult = JWTParseResult | JWTParseError;

export interface JWTHistoryItem {
	id: string;
	token: string;
	maskedToken: string;
	timestamp: number;
	headerAlg?: string;
	subject?: string;
}

export interface JWTHistorySettings {
	saveToHistory: boolean;
	maskTokens: boolean;
}

