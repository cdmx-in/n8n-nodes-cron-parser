# Cron Parser Examples

This document provides practical examples for using the Cron Parser node in n8n workflows.

## Basic Examples

### Example 1: Simple Next Run Time

**Node Configuration:**
```
Operation: Get Next Run Time
Cron Expression: 0 0 * * *
Current Date/Time: (empty - uses current time)
Timezone: UTC
```

**Output:**
```json
{
  "next_run_time": "2024-01-16T00:00:00.000Z",
  "cron_expression": "0 0 * * *",
  "timezone": "UTC",
  "current_date_time": "2024-01-15T14:23:45.123Z"
}
```

### Example 2: Using Data from Previous Node

**Previous Node Output:**
```json
{
  "job_name": "Daily Backup",
  "cron_schedule": "0 2 * * *",
  "last_run": "2024-01-15T02:00:00.000Z"
}
```

**Cron Parser Configuration:**
```
Cron Expression: {{ $json.cron_schedule }}
Current Date/Time: {{ $json.last_run }}
Timezone: America/New_York
```

**Output:**
```json
{
  "next_run_time": "2024-01-16T02:00:00.000Z",
  "cron_expression": "0 2 * * *",
  "timezone": "America/New_York",
  "current_date_time": "2024-01-15T02:00:00.000Z"
}
```

## Advanced Examples

### Example 3: Multiple Run Times for Planning

Calculate the next 10 execution times for a weekly report:

**Configuration:**
```
Operation: Get Multiple Next Run Times
Cron Expression: 0 9 * * 1
Count: 10
Timezone: Europe/London
```

**Output:**
```json
{
  "next_run_times": [
    "2024-01-22T09:00:00.000Z",
    "2024-01-29T09:00:00.000Z",
    "2024-02-05T09:00:00.000Z",
    "2024-02-12T09:00:00.000Z",
    "2024-02-19T09:00:00.000Z",
    "2024-02-26T09:00:00.000Z",
    "2024-03-04T09:00:00.000Z",
    "2024-03-11T09:00:00.000Z",
    "2024-03-18T09:00:00.000Z",
    "2024-03-25T09:00:00.000Z"
  ],
  "count": 10,
  "cron_expression": "0 9 * * 1"
}
```

### Example 4: Check if Job is Overdue

**Workflow:**
```
[Get Job Data] → [Cron Parser] → [If Node] → [Send Alert]
```

**Cron Parser Output:**
```json
{
  "next_run_time": "2024-01-15T10:00:00.000Z"
}
```

**If Node Condition:**
```javascript
{{ new Date($json.next_run_time) < new Date() }}
```

### Example 5: Timezone Conversion

Calculate next run time in different timezones:

**Input Data:**
```json
{
  "cron": "0 9 * * *",
  "timezones": ["UTC", "America/New_York", "Asia/Tokyo"]
}
```

**Loop through timezones and use Cron Parser:**
```
For each timezone:
  Operation: Get Next Run Time
  Cron Expression: {{ $json.cron }}
  Timezone: {{ $item.timezone }}
```

### Example 6: Validation Before Scheduling

**Workflow:**
```
[User Input] → [Cron Parser - Validate] → [If Valid] → [Create Schedule]
                                        ↓
                                   [If Invalid] → [Return Error]
```

**Cron Parser Configuration:**
```
Operation: Validate Cron Expression
Cron Expression: {{ $json.user_cron_input }}
```

**Output (Valid):**
```json
{
  "isValid": true,
  "cronExpression": "0 0 * * *"
}
```

**Output (Invalid):**
```json
{
  "isValid": false,
  "cronExpression": "invalid cron 123",
  "error": "Invalid cron expression"
}
```

## Real-World Use Cases

### Use Case 1: Database Backup Monitor

**Scenario:** Monitor if database backups are running on schedule.

**Workflow:**
1. Get list of scheduled backup jobs (cron expressions)
2. Calculate next run time for each
3. Compare with current time
4. Alert if any backup is overdue

```javascript
// In Function node after Cron Parser
const nextRun = new Date($json.next_run_time);
const now = new Date();
const timeDiff = (now - nextRun) / (1000 * 60); // minutes

if (timeDiff > 60) {
  return {
    alert: true,
    message: `Backup overdue by ${Math.floor(timeDiff)} minutes`,
    job: $json.cron_expression
  };
}
```

### Use Case 2: Multi-Region Schedule Coordinator

**Scenario:** Coordinate scheduled tasks across different regions/timezones.

**Workflow:**
```
[Get Regions] 
  → [Cron Parser - Calculate for each timezone]
  → [Aggregate Results]
  → [Send Schedule to Teams]
```

**Example Code:**
```javascript
const regions = [
  { name: "US East", timezone: "America/New_York", cron: "0 9 * * *" },
  { name: "Europe", timezone: "Europe/London", cron: "0 9 * * *" },
  { name: "Asia Pacific", timezone: "Asia/Tokyo", cron: "0 9 * * *" }
];

// Process each region with Cron Parser
// Shows when 9 AM in each region is in UTC
```

### Use Case 3: Recurring Event Scheduler

**Scenario:** Generate calendar events for recurring meetings.

**Configuration:**
```
Operation: Get Multiple Next Run Times
Cron Expression: 0 14 * * 2,4 (Tuesdays and Thursdays at 2 PM)
Count: 20
Timezone: America/Los_Angeles
```

**Post-Processing:**
```javascript
// Convert to calendar events
const events = $json.next_run_times.map((time, index) => ({
  title: "Team Standup",
  start: time,
  duration: 30, // minutes
  attendees: ["team@company.com"]
}));

return { events };
```

## Common Patterns

### Pattern 1: Error Handling with Continue on Error

```
Options:
  Continue on Error: ✓
  Include Details: ✓
```

**Output on Error:**
```json
{
  "error": "Invalid cron expression: unexpected character",
  "success": false
}
```

### Pattern 2: Custom Date Format

Use output format option:

```
Options:
  Output Format: Unix Timestamp
```

**Output:**
```json
{
  "next_run_time": 1705318200000
}
```

### Pattern 3: Chaining Multiple Operations

```
[Input] 
  → [Cron Parser - Validate]
  → [If Valid]
     → [Cron Parser - Get Next Run Time]
     → [Cron Parser - Get Multiple Run Times]
  → [Process Results]
```

## Tips and Best Practices

1. **Always validate** cron expressions from user input before using them
2. **Use timezone-aware** calculations for global applications
3. **Cache results** when calculating the same cron expression multiple times
4. **Handle errors gracefully** with the "Continue on Error" option
5. **Test expressions** with different timezones to ensure correct behavior
6. **Use ISO format** for date/time inputs for consistency
7. **Document cron expressions** in your workflow for maintainability

## Troubleshooting

### Issue: Unexpected next run time

**Solution:** Check the timezone setting. Ensure it matches your expected timezone.

### Issue: Validation fails for seemingly valid cron

**Solution:** Verify the cron format is 5-field (minute hour day month weekday), not 6-field (with seconds).

### Issue: Times don't match expected schedule

**Solution:** Remember that cron times are in the specified timezone, and output is in ISO (UTC) format.
