import type { NormalizedRequest, GeneratorResult } from '../types';
import { isValidJson } from '../json';


export function generateFetchTs(req: NormalizedRequest): GeneratorResult {
	const warnings: string[] = [];
	const lines: string[] = [];

	const options: string[] = [];
	options.push(`  method: '${req.method}'`);

	const headerEntries = Object.entries(req.headers);
	if (headerEntries.length > 0) {
		const headerLines = headerEntries.map(([key, value]) => {
			const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
			return `    '${key}': '${escapedValue}'`;
		});
		options.push(`  headers: {\n${headerLines.join(',\n')}\n  }`);
	}

	if (req.body) {
		if (req.contentType?.includes('application/json') && isValidJson(req.body)) {
			// Pretty format the JSON for readability
			try {
				const parsed = JSON.parse(req.body);
				const formatted = JSON.stringify(parsed, null, 2)
					.split('\n')
					.map((line, i) => (i === 0 ? line : '    ' + line))
					.join('\n');
				options.push(`  body: JSON.stringify(${formatted})`);
			} catch {
				options.push(`  body: ${JSON.stringify(req.body)}`);
			}
		} else {
			options.push(`  body: ${JSON.stringify(req.body)}`);
			if (req.contentType?.includes('application/json')) {
				warnings.push('Body is not valid JSON');
			}
		}
	}

	lines.push(`const response = await fetch('${req.url}', {`);
	lines.push(options.join(',\n'));
	lines.push('});');
	lines.push('');
	lines.push('const data = await response.json();');

	return { code: lines.join('\n'), warnings };
}

