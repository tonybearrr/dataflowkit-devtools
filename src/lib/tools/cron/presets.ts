import type { CronPreset } from './types';

export const cronPresets: CronPreset[] = [
	{
		label: 'Every minute',
		expression: '* * * * *',
		description: 'Runs every minute'
	},
	{
		label: 'Every 5 minutes',
		expression: '*/5 * * * *',
		description: 'Runs every 5 minutes'
	},
	{
		label: 'Every hour',
		expression: '0 * * * *',
		description: 'Runs at minute 0 of every hour'
	},
	{
		label: 'Every day at 09:00',
		expression: '0 9 * * *',
		description: 'Runs daily at 9:00 AM'
	},
	{
		label: 'Every Monday',
		expression: '0 9 * * 1',
		description: 'Runs every Monday at 9:00 AM'
	}
];

