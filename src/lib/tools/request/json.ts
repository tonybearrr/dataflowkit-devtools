
export function safeJsonParse(input: string): { ok: true; data: unknown } | { ok: false; error: string } {
	try {
		const data = JSON.parse(input);
		return { ok: true, data };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Invalid JSON';
		return { ok: false, error: message };
	}
}


export function prettifyJson(input: string): { ok: true; result: string } | { ok: false; error: string } {
	const parsed = safeJsonParse(input);
	if (!parsed.ok) {
		return parsed;
	}
	return { ok: true, result: JSON.stringify(parsed.data, null, 2) };
}


export function minifyJson(input: string): { ok: true; result: string } | { ok: false; error: string } {
	const parsed = safeJsonParse(input);
	if (!parsed.ok) {
		return parsed;
	}
	return { ok: true, result: JSON.stringify(parsed.data) };
}


export function validateJson(input: string): { valid: true } | { valid: false; error: string } {
	const parsed = safeJsonParse(input);
	if (!parsed.ok) {
		return { valid: false, error: parsed.error };
	}
	return { valid: true };
}


export function isValidJson(input: string): boolean {
	return safeJsonParse(input).ok;
}

