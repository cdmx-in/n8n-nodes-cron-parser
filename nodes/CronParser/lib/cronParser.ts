import cronParser from 'cron-parser';
import type { CronParseResult } from '../types';

/**
 * Parses a cron expression and returns the next run time
 * @param cronExpression The cron expression to parse
 * @param currentDate The current date/time to calculate from
 * @param timezone The timezone for calculation (default: UTC)
 * @returns The next run time as ISO string
 */
export function getNextRunTime(
	cronExpression: string,
	currentDate?: Date | string,
	timezone = 'UTC',
): string {
	const options = {
		currentDate: currentDate ? new Date(currentDate) : new Date(),
		tz: timezone,
	};

	const interval = cronParser.parseExpression(cronExpression, options);
	return interval.next().toDate().toISOString();
}

/**
 * Parses a cron expression and returns multiple next run times
 * @param cronExpression The cron expression to parse
 * @param count Number of next run times to calculate
 * @param currentDate The current date/time to calculate from
 * @param timezone The timezone for calculation (default: UTC)
 * @returns Array of next run times as ISO strings
 */
export function getMultipleNextRunTimes(
	cronExpression: string,
	count: number,
	currentDate?: Date | string,
	timezone = 'UTC',
): string[] {
	const options = {
		currentDate: currentDate ? new Date(currentDate) : new Date(),
		tz: timezone,
	};

	const interval = cronParser.parseExpression(cronExpression, options);
	const nextRuns: string[] = [];

	for (let i = 0; i < count; i++) {
		try {
			nextRuns.push(interval.next().toDate().toISOString());
		} catch (error) {
			// Stop if we can't get more run times (e.g., reached end date)
			break;
		}
	}

	return nextRuns;
}

/**
 * Validates if a cron expression is valid
 * @param cronExpression The cron expression to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateCronExpression(cronExpression: string): {
	isValid: boolean;
	error?: string;
} {
	try {
		cronParser.parseExpression(cronExpression);
		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : 'Invalid cron expression',
		};
	}
}

/**
 * Gets the previous run time from a cron expression
 * @param cronExpression The cron expression to parse
 * @param currentDate The current date/time to calculate from
 * @param timezone The timezone for calculation (default: UTC)
 * @returns The previous run time as ISO string
 */
export function getPreviousRunTime(
	cronExpression: string,
	currentDate?: Date | string,
	timezone = 'UTC',
): string {
	const options = {
		currentDate: currentDate ? new Date(currentDate) : new Date(),
		tz: timezone,
	};

	const interval = cronParser.parseExpression(cronExpression, options);
	return interval.prev().toDate().toISOString();
}

/**
 * Safely parses a cron expression and returns a result object
 * @param cronExpression The cron expression to parse
 * @param currentDate The current date/time to calculate from
 * @param timezone The timezone for calculation
 * @returns CronParseResult object with success status and data or error
 */
export function safeParseCronExpression(
	cronExpression: string,
	currentDate?: Date | string,
	timezone = 'UTC',
): CronParseResult {
	try {
		const nextRunTime = getNextRunTime(cronExpression, currentDate, timezone);
		return {
			nextRunTime,
			success: true,
			cronExpression,
			timezone,
			currentDate: currentDate
				? new Date(currentDate).toISOString()
				: new Date().toISOString(),
		};
	} catch (error) {
		return {
			nextRunTime: '',
			success: false,
			error: error instanceof Error ? error.message : 'Failed to parse cron expression',
			cronExpression,
			timezone,
			currentDate: currentDate
				? new Date(currentDate).toISOString()
				: new Date().toISOString(),
		};
	}
}

/**
 * Formats a date according to the specified format
 * @param date The date to format
 * @param format The output format (iso, timestamp, formatted)
 * @returns Formatted date string or timestamp
 */
export function formatDate(date: Date, format: 'iso' | 'timestamp' | 'formatted'): string | number {
	switch (format) {
		case 'iso':
			return date.toISOString();
		case 'timestamp':
			return date.getTime();
		case 'formatted':
			return date.toUTCString();
		default:
			return date.toISOString();
	}
}
