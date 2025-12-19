export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export interface ParseSuccess {
	ok: true;
	value: JsonValue;
}

export interface ParseError {
	ok: false;
	error: string;
	line?: number;
	column?: number;
}

export type ParseResult = ParseSuccess | ParseError;

export interface TreeNode {
	key: string;
	value: JsonValue;
	path: string;
	type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
	children?: TreeNode[];
	childCount?: number;
}

export interface BracketInfo {
	char: string;
	line: number;
	column: number;
	position: number;
}

export interface BracketBalance {
	isBalanced: boolean;
	brackets: {
		open: number;
		close: number;
	};
	braces: {
		open: number;
		close: number;
	};
	unclosed: BracketInfo[];
	unexpected: BracketInfo[];
}

