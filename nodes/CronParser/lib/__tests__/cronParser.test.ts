import {
	getNextRunTime,
	getMultipleNextRunTimes,
	getPreviousRunTime,
	validateCronExpression,
	safeParseCronExpression,
	formatDate,
} from '../cronParser';

describe('CronParser Library', () => {
	describe('validateCronExpression', () => {
		it('should validate a correct cron expression', () => {
			const result = validateCronExpression('0 0 * * *');
			expect(result.isValid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should invalidate an incorrect cron expression', () => {
			const result = validateCronExpression('invalid cron');
			expect(result.isValid).toBe(false);
			expect(result.error).toBeDefined();
		});

		it('should validate complex cron expressions', () => {
			const expressions = [
				'*/5 * * * *', // Every 5 minutes
				'0 0 1 * *', // First day of month at midnight
				'0 9-17 * * 1-5', // Every hour from 9am to 5pm on weekdays
			];

			expressions.forEach((expr) => {
				const result = validateCronExpression(expr);
				expect(result.isValid).toBe(true);
			});
		});
	});

	describe('getNextRunTime', () => {
		it('should calculate next run time for daily cron at midnight', () => {
			const cronExpression = '0 0 * * *'; // Daily at midnight UTC
			const currentDate = new Date('2024-01-15T10:30:00.000Z');
			const nextRun = getNextRunTime(cronExpression, currentDate, 'UTC');

			const expected = new Date('2024-01-16T00:00:00.000Z');
			expect(new Date(nextRun).toISOString()).toBe(expected.toISOString());
		});

		it('should handle timezone correctly', () => {
			const cronExpression = '0 0 * * *'; // Daily at midnight
			const currentDate = new Date('2024-01-15T10:30:00.000Z');
			const nextRun = getNextRunTime(cronExpression, currentDate, 'America/New_York');

			// Should calculate based on America/New_York timezone
			expect(nextRun).toBeDefined();
			expect(typeof nextRun).toBe('string');
		});

		it('should use current date if not provided', () => {
			const cronExpression = '0 0 * * *';
			const nextRun = getNextRunTime(cronExpression);

			expect(nextRun).toBeDefined();
			expect(typeof nextRun).toBe('string');
			// Next run should be in the future
			expect(new Date(nextRun).getTime()).toBeGreaterThan(Date.now());
		});
	});

	describe('getMultipleNextRunTimes', () => {
		it('should calculate multiple next run times', () => {
			const cronExpression = '0 0 * * *'; // Daily at midnight
			const currentDate = new Date('2024-01-15T10:30:00.000Z');
			const count = 3;
			const nextRuns = getMultipleNextRunTimes(cronExpression, count, currentDate, 'UTC');

			expect(nextRuns).toHaveLength(3);
			expect(new Date(nextRuns[0]).toISOString()).toBe('2024-01-16T00:00:00.000Z');
			expect(new Date(nextRuns[1]).toISOString()).toBe('2024-01-17T00:00:00.000Z');
			expect(new Date(nextRuns[2]).toISOString()).toBe('2024-01-18T00:00:00.000Z');
		});

		it('should handle hourly cron expressions', () => {
			const cronExpression = '0 * * * *'; // Every hour
			const currentDate = new Date('2024-01-15T10:30:00.000Z');
			const count = 5;
			const nextRuns = getMultipleNextRunTimes(cronExpression, count, currentDate, 'UTC');

			expect(nextRuns).toHaveLength(5);
			// Each run should be 1 hour apart
			for (let i = 1; i < nextRuns.length; i++) {
				const diff = new Date(nextRuns[i]).getTime() - new Date(nextRuns[i - 1]).getTime();
				expect(diff).toBe(60 * 60 * 1000); // 1 hour in milliseconds
			}
		});
	});

	describe('getPreviousRunTime', () => {
		it('should calculate previous run time', () => {
			const cronExpression = '0 0 * * *'; // Daily at midnight UTC
			const currentDate = new Date('2024-01-15T10:30:00.000Z');
			const prevRun = getPreviousRunTime(cronExpression, currentDate, 'UTC');

			const expected = new Date('2024-01-15T00:00:00.000Z');
			expect(new Date(prevRun).toISOString()).toBe(expected.toISOString());
		});

		it('should handle timezone correctly for previous run', () => {
			const cronExpression = '0 0 * * *';
			const currentDate = new Date('2024-01-15T10:30:00.000Z');
			const prevRun = getPreviousRunTime(cronExpression, currentDate, 'America/New_York');

			expect(prevRun).toBeDefined();
			expect(typeof prevRun).toBe('string');
			// Previous run should be in the past
			expect(new Date(prevRun).getTime()).toBeLessThan(currentDate.getTime());
		});
	});

	describe('safeParseCronExpression', () => {
		it('should return success result for valid cron expression', () => {
			const cronExpression = '0 0 * * *';
			const currentDate = '2024-01-15T10:30:00.000Z';
			const result = safeParseCronExpression(cronExpression, currentDate, 'UTC');

			expect(result.success).toBe(true);
			expect(result.nextRunTime).toBeDefined();
			expect(result.error).toBeUndefined();
			expect(result.cronExpression).toBe(cronExpression);
			expect(result.timezone).toBe('UTC');
		});

		it('should return error result for invalid cron expression', () => {
			const cronExpression = 'invalid';
			const result = safeParseCronExpression(cronExpression, undefined, 'UTC');

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.nextRunTime).toBe('');
		});
	});

	describe('formatDate', () => {
		const testDate = new Date('2024-01-15T10:30:00.000Z');

		it('should format date as ISO string', () => {
			const formatted = formatDate(testDate, 'iso');
			expect(formatted).toBe('2024-01-15T10:30:00.000Z');
		});

		it('should format date as timestamp', () => {
			const formatted = formatDate(testDate, 'timestamp');
			expect(formatted).toBe(testDate.getTime());
			expect(typeof formatted).toBe('number');
		});

		it('should format date as formatted string', () => {
			const formatted = formatDate(testDate, 'formatted');
			expect(typeof formatted).toBe('string');
			expect(formatted).toContain('2024');
		});
	});
});
