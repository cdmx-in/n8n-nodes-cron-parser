/**
 * Options for cron parser configuration
 */
export interface CronParserOptions {
	currentDate?: Date | string;
	timezone?: string;
	iterator?: boolean;
	utc?: boolean;
	endDate?: Date | string;
}

/**
 * Result of parsing a cron expression
 */
export interface CronParseResult {
	nextRunTime: string;
	success: boolean;
	error?: string;
	cronExpression?: string;
	timezone?: string;
	currentDate?: string;
}

/**
 * Mode for calculating multiple run times
 */
export type CalculationMode = 'single' | 'multiple';

/**
 * Output format for date/time results
 */
export type OutputFormat = 'iso' | 'timestamp' | 'formatted';
