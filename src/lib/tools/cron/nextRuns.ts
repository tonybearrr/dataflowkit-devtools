import { CronExpressionParser } from 'cron-parser';
import type { CronNextRunsResult, TimezoneOption } from './types';
import { validateCron } from './validate';


export function getNextRuns(
	expression: string,
	count: number = 10,
	timezone: TimezoneOption = 'local'
): CronNextRunsResult {
	const validation = validateCron(expression);
	if (!validation.valid) {
		return { success: false, error: validation.error || 'Invalid cron expression' };
	}

	try {
		const options: { tz?: string } = {};

		if (timezone === 'UTC') {
			options.tz = 'UTC';
		}

		const interval = CronExpressionParser.parse(expression.trim(), options);
		const runs: Date[] = [];

		for (let i = 0; i < count; i++) {
			const next = interval.next();
			runs.push(next.toDate());
		}

		return { success: true, runs };
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to calculate next runs';
		return { success: false, error: message };
	}
}


export function formatRunTime(date: Date, timezone: TimezoneOption = 'local'): string {
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	};

	if (timezone === 'UTC') {
		options.timeZone = 'UTC';
	}

	return date.toLocaleString('en-US', options);
}
