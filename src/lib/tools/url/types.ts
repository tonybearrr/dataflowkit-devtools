
export interface ParsedUrl {
	href: string;
	protocol: string;
	hostname: string;
	port: string;
	pathname: string;
	search: string;
	hash: string;
	host: string;
	origin: string;
}


export interface QueryParam {
	id: string;
	key: string;
	value: string;
	enabled: boolean;
}


export interface ParseSuccess {
	ok: true;
	value: ParsedUrl;
	params: QueryParam[];
}


export interface ParseError {
	ok: false;
	error: string;
}


export type ParseResult = ParseSuccess | ParseError;


export interface DecodeSuccess {
	ok: true;
	value: string;
}


export interface DecodeError {
	ok: false;
	error: string;
}


export type DecodeResult = DecodeSuccess | DecodeError;

