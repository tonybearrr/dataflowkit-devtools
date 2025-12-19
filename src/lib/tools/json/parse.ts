import type { ParseResult, JsonValue, BracketBalance, BracketInfo } from './types';


export function parseJson(input: string): ParseResult {
	if (!input.trim()) {
		return { ok: false, error: 'Input is empty' };
	}

	try {
		const value = JSON.parse(input) as JsonValue;
		return { ok: true, value };
	} catch (err) {
		if (err instanceof SyntaxError) {
			const { line, column } = extractPosition(err.message, input);
			return {
				ok: false,
				error: err.message,
				line,
				column
			};
		}
		return {
			ok: false,
			error: err instanceof Error ? err.message : 'Unknown error'
		};
	}
}


function extractPosition(
	message: string,
	input: string
): { line?: number; column?: number } {
	const posMatch = message.match(/at position (\d+)/i);
	if (posMatch) {
		const position = parseInt(posMatch[1], 10);
		return positionToLineColumn(input, position);
	}

	const lineColMatch = message.match(/line (\d+) column (\d+)/i);
	if (lineColMatch) {
		return {
			line: parseInt(lineColMatch[1], 10),
			column: parseInt(lineColMatch[2], 10)
		};
	}

	return {};
}


function positionToLineColumn(
	input: string,
	position: number
): { line: number; column: number } {
	const lines = input.slice(0, position).split('\n');
	const line = lines.length;
	const column = lines[lines.length - 1].length + 1;
	return { line, column };
}


export function getValueType(
	value: JsonValue
): 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' {
	if (value === null) return 'null';
	if (Array.isArray(value)) return 'array';
	return typeof value as 'object' | 'string' | 'number' | 'boolean';
}


export function estimateSize(input: string): number {
	return new Blob([input]).size;
}


export function isLargeJson(input: string): boolean {
	return estimateSize(input) > 2 * 1024 * 1024;
}


export function checkBracketBalance(input: string): BracketBalance {
	const result: BracketBalance = {
		isBalanced: true,
		brackets: { open: 0, close: 0 },
		braces: { open: 0, close: 0 },
		unclosed: [],
		unexpected: []
	};

	const stack: BracketInfo[] = [];
	let inString = false;
	let escape = false;
	let line = 1;
	let column = 1;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];

		if (char === '\n') {
			line++;
			column = 1;
			escape = false;
			continue;
		}

		if (!escape && char === '"') {
			inString = !inString;
		}
		escape = inString && !escape && char === '\\';

		if (!inString) {
			const info: BracketInfo = { char, line, column, position: i };

			if (char === '[') {
				result.brackets.open++;
				stack.push(info);
			} else if (char === '{') {
				result.braces.open++;
				stack.push(info);
			} else if (char === ']') {
				result.brackets.close++;
				const last = stack[stack.length - 1];
				if (last?.char === '[') {
					stack.pop();
				} else {
					result.unexpected.push(info);
					result.isBalanced = false;
				}
			} else if (char === '}') {
				result.braces.close++;
				const last = stack[stack.length - 1];
				if (last?.char === '{') {
					stack.pop();
				} else {
					result.unexpected.push(info);
					result.isBalanced = false;
				}
			}
		}

		column++;
	}

	if (stack.length > 0) {
		result.unclosed = stack;
		result.isBalanced = false;
	}

	return result;
}


export function getBracketBalanceMessage(balance: BracketBalance): string | null {
	if (balance.isBalanced) return null;

	const messages: string[] = [];

	if (balance.unclosed.length > 0) {
		const unclosedList = balance.unclosed
			.map((b) => `Unclosed ${b.char} at line ${b.line}, column ${b.column}`)
			.join('; ');
		messages.push(unclosedList);
	}

	if (balance.unexpected.length > 0) {
		const unexpectedList = balance.unexpected
			.map((b) => `Unexpected ${b.char} at line ${b.line}, column ${b.column}`)
			.join('; ');
		messages.push(unexpectedList);
	}

	if (balance.brackets.open !== balance.brackets.close) {
		messages.push(
			`Square brackets: ${balance.brackets.open}× "[" and ${balance.brackets.close}× "]"`
		);
	}
	if (balance.braces.open !== balance.braces.close) {
		messages.push(
			`Curly braces: ${balance.braces.open}× "{" and ${balance.braces.close}× "}"`
		);
	}

	return messages.join('. ');
}

