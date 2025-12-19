import type { NormalizedRequest, GeneratorResult } from '../types';


function escapeShell(str: string): string {
	// Replace single quotes with '\'' (end quote, escaped quote, start quote)
	return str.replace(/'/g, "'\\''");
}


export function generateCurl(req: NormalizedRequest): GeneratorResult {
	const warnings: string[] = [];
	const parts: string[] = ['curl'];

	if (req.method !== 'GET') {
		parts.push(`-X ${req.method}`);
	}

	parts.push(`'${escapeShell(req.url)}'`);

	// Headers
	for (const [key, value] of Object.entries(req.headers)) {
		parts.push(`-H '${escapeShell(key)}: ${escapeShell(value)}'`);
	}

	if (req.body) {
		parts.push(`--data-raw '${escapeShell(req.body)}'`);
	}

	let code: string;
	if (parts.length <= 3) {
		code = parts.join(' ');
	} else {
		code = parts.join(' \\\n  ');
	}

	return { code, warnings };
}

