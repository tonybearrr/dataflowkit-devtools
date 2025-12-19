import type { NormalizedRequest, GeneratorResult } from '../types';
import { isValidJson } from '../json';


function escapeValue(str: string): string {
	// HTTPie uses shell quoting
	if (str.includes("'") || str.includes(' ') || str.includes('"')) {
		return `'${str.replace(/'/g, "'\\''")}'`;
	}
	return str;
}


export function generateHttpie(req: NormalizedRequest): GeneratorResult {
	const warnings: string[] = [];
	const parts: string[] = ['http'];

	if (req.method !== 'GET') {
		parts.push(req.method);
	}

	parts.push(escapeValue(req.url));

	// Headers (key:value format)
	for (const [key, value] of Object.entries(req.headers)) {
		// Skip Content-Type for JSON as HTTPie handles it
		if (key.toLowerCase() === 'content-type' && value.includes('application/json')) {
			continue;
		}
		parts.push(`${key}:${escapeValue(value)}`);
	}

	if (req.body) {
		if (req.contentType?.includes('application/json') && isValidJson(req.body)) {
			// HTTPie JSON syntax: key=value or key:=json_value
			try {
				const parsed = JSON.parse(req.body);
				if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
					// For simple objects, use HTTPie's native JSON syntax
					for (const [key, value] of Object.entries(parsed)) {
						if (typeof value === 'string') {
							parts.push(`${key}=${escapeValue(value)}`);
						} else {
							parts.push(`${key}:=${JSON.stringify(value)}`);
						}
					}
				} else {
					// For arrays or complex structures, use raw JSON
					parts.push(`--raw=${escapeValue(req.body)}`);
				}
			} catch {
				parts.push(`--raw=${escapeValue(req.body)}`);
			}
		} else {
			parts.push(`--raw=${escapeValue(req.body)}`);
			if (req.contentType?.includes('application/json')) {
				warnings.push('Body is not valid JSON');
			}
		}
	}

	let code: string;
	if (parts.length <= 4) {
		code = parts.join(' ');
	} else {
		code = parts.join(' \\\n  ');
	}

	return { code, warnings };
}

