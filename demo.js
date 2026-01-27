const {
	getNextRunTime,
	getMultipleNextRunTimes,
	getPreviousRunTime,
	validateCronExpression,
	safeParseCronExpression,
} = require('./dist/nodes/CronParser/lib/cronParser');

console.log('=== n8n Cron Parser Demo ===\n');

// Example 1: Get Next Run Time (matching user's requirement)
console.log('1. Get Next Run Time (daily at midnight):');
const cron_exp = '0 0 * * *'; // Daily at midnight
const CurrentDateTime = '2024-01-15T10:30:00.000Z';
const nextRun = getNextRunTime(cron_exp, CurrentDateTime);
console.log({
	next_run_time: nextRun,
	cron_expression: cron_exp,
	current_date_time: CurrentDateTime,
});
console.log();

// Example 2: Multiple Next Run Times
console.log('2. Get Multiple Next Run Times (every hour):');
const hourlyNextRuns = getMultipleNextRunTimes('0 * * * *', 5, CurrentDateTime, 'UTC');
console.log('Next 5 run times:', hourlyNextRuns);
console.log();

// Example 3: With Timezone
console.log('3. Get Next Run Time with Timezone (New York):');
const nyNextRun = getNextRunTime('0 9 * * 1-5', CurrentDateTime, 'America/New_York');
console.log('Next weekday 9 AM (NY):', nyNextRun);
console.log();

// Example 4: Get Previous Run Time
console.log('4. Get Previous Run Time:');
const prevRun = getPreviousRunTime('0 0 * * *', CurrentDateTime, 'UTC');
console.log('Previous run:', prevRun);
console.log();

// Example 5: Validate Cron Expression
console.log('5. Validate Cron Expressions:');
console.log('Valid:', validateCronExpression('0 0 * * *'));
console.log('Invalid:', validateCronExpression('invalid cron'));
console.log();

// Example 6: Safe Parse (won't throw errors)
console.log('6. Safe Parse Cron Expression:');
const safeResult = safeParseCronExpression('*/5 * * * *', CurrentDateTime, 'UTC');
console.log('Safe parse result:', safeResult);
console.log();

// Example 7: Common Cron Patterns
console.log('7. Common Cron Patterns:');
const patterns = [
	{ expr: '*/5 * * * *', desc: 'Every 5 minutes' },
	{ expr: '0 * * * *', desc: 'Every hour' },
	{ expr: '0 0 * * *', desc: 'Daily at midnight' },
	{ expr: '0 0 * * 0', desc: 'Every Sunday at midnight' },
	{ expr: '0 0 1 * *', desc: 'First day of month' },
	{ expr: '0 9-17 * * 1-5', desc: '9am-5pm weekdays' },
];

patterns.forEach(({ expr, desc }) => {
	const next = getNextRunTime(expr, CurrentDateTime, 'UTC');
	console.log(`${desc}: ${next}`);
});

console.log('\n=== Demo Complete ===');
