import cronstrue from 'cronstrue';
import type { CronExplainResult } from './types';
import { validateCron } from './validate';


export function explainCron(expression: string): CronExplainResult {
	const validation = validateCron(expression);
	if (!validation.valid) {
		return { success: false, error: validation.error || 'Invalid cron expression' };
	}

	try {
		const text = cronstrue.toString(expression.trim(), {
			throwExceptionOnParseError: true,
			use24HourTimeFormat: true
		});
		return { success: true, text };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to explain cron expression';
		return { success: false, error: message };
	}
}

