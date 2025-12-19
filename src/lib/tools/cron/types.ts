export interface CronValidationResult {
	valid: boolean;
	error?: string;
}

export interface CronExplanation {
	success: true;
	text: string;
}

export interface CronExplanationError {
	success: false;
	error: string;
}

export type CronExplainResult = CronExplanation | CronExplanationError;

export interface NextRunsResult {
	success: true;
	runs: Date[];
}

export interface NextRunsError {
	success: false;
	error: string;
}

export type CronNextRunsResult = NextRunsResult | NextRunsError;

export type TimezoneOption = 'local' | 'UTC';

export interface CronPreset {
	label: string;
	expression: string;
	description: string;
}

