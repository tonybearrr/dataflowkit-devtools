import type { NormalizedRequest, GeneratorResult } from '../types';
import { isValidJson } from '../json';


export function generateAxios(req: NormalizedRequest): GeneratorResult {
	const warnings: string[] = [];
	const lines: string[] = [];

	const config: string[] = [];

	config.push(`  method: '${req.method}'`);

	config.push(`  url: '${req.url}'`);

	const headerEntries = Object.entries(req.headers);
	if (headerEntries.length > 0) {
		const headerLines = headerEntries.map(([key, value]) => {
			const escapedValue = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
			return `    '${key}': '${escapedValue}'`;
		});
		config.push(`  headers: {\n${headerLines.join(',\n')}\n  }`);
	}

	if (req.body) {
		if (req.contentType?.includes('application/json') && isValidJson(req.body)) {
			// Use object literal for valid JSON
			try {
				const parsed = JSON.parse(req.body);
				const formatted = JSON.stringify(parsed, null, 2)
					.split('\n')
					.map((line, i) => (i === 0 ? line : '    ' + line))
					.join('\n');
				config.push(`  data: ${formatted}`);
			} catch {
				config.push(`  data: ${JSON.stringify(req.body)}`);
			}
		} else {
			config.push(`  data: ${JSON.stringify(req.body)}`);
			if (req.contentType?.includes('application/json')) {
				warnings.push('Body is not valid JSON');
			}
		}
	}


	lines.push('const response = await axios.request({');
	lines.push(config.join(',\n'));
	lines.push('});');

	return { code: lines.join('\n'), warnings };
}

