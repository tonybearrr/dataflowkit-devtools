import { CronExpressionParser } from 'cron-parser';
import type { CronValidationResult } from './types';


export function validateCron(expression: string): CronValidationResult {
	if (!expression || typeof expression !== 'string') {
		return { valid: false, error: 'Cron expression is required' };
	}

	const trimmed = expression.trim();
	if (!trimmed) {
		return { valid: false, error: 'Cron expression is required' };
	}

	const fields = trimmed.split(/\s+/);
	if (fields.length !== 5) {
		return {
			valid: false,
			error: `Expected 5 fields (minute hour day month weekday), got ${fields.length}`
		};
	}

	try {
		CronExpressionParser.parse(trimmed);
		return { valid: true };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Invalid cron expression';
		return { valid: false, error: message };
	}
}


export function looksLikeCron(expression: string): boolean {
	if (!expression) return false;
	const fields = expression.trim().split(/\s+/);
	return fields.length === 5;
}
