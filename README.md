# n8n-nodes-cron-parser

[![npm version](https://badge.fury.io/js/n8n-nodes-cron-parser.svg)](https://www.npmjs.com/package/n8n-nodes-cron-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Parse cron expressions and calculate next/previous run times with timezone support for [n8n](https://n8n.io/) workflows.

## Features

- ⏰ **Next Run Time** - Calculate when a cron job will run next
- 📅 **Multiple Run Times** - Get multiple upcoming execution times
- ⏮️ **Previous Run Time** - Calculate when a cron job last ran
- ✅ **Validation** - Validate cron expressions before use
- 🌍 **Timezone Support** - Full IANA timezone database support
- 📊 **Multiple Output Formats** - ISO strings, timestamps, or formatted dates
- 🔧 **Flexible Input** - Use expressions to pull data from previous nodes

## Installation

### Community Nodes Installation

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-cron-parser` in the search field
4. Click **Install**

### Manual Installation

For self-hosted n8n instances:

```bash
npm install n8n-nodes-cron-parser
```

Then restart your n8n instance.

## Usage

### Get Next Run Time

Calculate when a cron job will execute next:

**Input:**
- Cron Expression: `0 0 * * *` (daily at midnight)
- Current Date/Time: `2024-01-15T10:30:00.000Z`
- Timezone: `UTC`

**Output:**
```json
{
  "next_run_time": "2024-01-16T00:00:00.000Z",
  "cron_expression": "0 0 * * *",
  "timezone": "UTC",
  "current_date_time": "2024-01-15T10:30:00.000Z"
}
```

### Using with Previous Node Data

You can reference data from previous nodes using n8n expressions:

**Cron Expression:** `{{ $json.cron_expression }}`  
**Current Date/Time:** `{{ $json.current_date_time }}`  
**Timezone:** `{{ $json.timezone }}`

Example workflow:
```javascript
// Previous node output
{
  "cron_expression": "0 0 * * *",
  "current_date_time": "2024-01-15T10:30:00.000Z",
  "timezone": "America/New_York"
}

// Cron Parser node will calculate next run time
```

### Get Multiple Next Run Times

Calculate multiple upcoming execution times:

**Settings:**
- Cron Expression: `0 * * * *` (every hour)
- Count: `5`
- Current Date/Time: `2024-01-15T10:30:00.000Z`

**Output:**
```json
{
  "next_run_times": [
    "2024-01-15T11:00:00.000Z",
    "2024-01-15T12:00:00.000Z",
    "2024-01-15T13:00:00.000Z",
    "2024-01-15T14:00:00.000Z",
    "2024-01-15T15:00:00.000Z"
  ],
  "count": 5,
  "cron_expression": "0 * * * *",
  "timezone": "UTC"
}
```

### Get Previous Run Time

Calculate when a cron job last executed:

**Input:**
- Cron Expression: `0 0 * * *`
- Current Date/Time: `2024-01-15T10:30:00.000Z`

**Output:**
```json
{
  "previous_run_time": "2024-01-15T00:00:00.000Z",
  "cron_expression": "0 0 * * *",
  "timezone": "UTC"
}
```

### Validate Cron Expression

Check if a cron expression is valid:

**Input:**
- Cron Expression: `0 0 * * *`

**Output:**
```json
{
  "isValid": true,
  "cronExpression": "0 0 * * *"
}
```

For invalid expression:
```json
{
  "isValid": false,
  "cronExpression": "invalid cron",
  "error": "Invalid cron expression"
}
```

## Cron Expression Format

This node uses standard 5-field cron format:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

### Common Examples

| Expression | Description |
|------------|-------------|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Every day at midnight |
| `0 0 * * 0` | Every Sunday at midnight |
| `0 0 1 * *` | First day of every month |
| `*/5 * * * *` | Every 5 minutes |
| `0 9-17 * * 1-5` | Every hour from 9am-5pm on weekdays |
| `0 0 1 1 *` | January 1st at midnight (yearly) |

## Timezone Support

The node supports all IANA timezone names:

- **UTC** (default)
- **America/New_York**
- **America/Los_Angeles**
- **Europe/London**
- **Europe/Paris**
- **Asia/Tokyo**
- **Australia/Sydney**
- And many more...

[Full timezone list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## Output Formats

Choose how to format the output dates:

### ISO String (default)
```json
{
  "next_run_time": "2024-01-15T10:30:00.000Z"
}
```

### Unix Timestamp
```json
{
  "next_run_time": 1705318200000
}
```

### Formatted String
```json
{
  "next_run_time": "Mon, 15 Jan 2024 10:30:00 GMT"
}
```

## Options

### Include Details
Include additional information about the calculation (enabled by default):
- Cron expression used
- Timezone used
- Current date/time used for calculation

### Continue on Error
When enabled, the node will continue processing other items even if one fails, outputting error information instead of stopping the workflow.

## Use Cases

### 1. Schedule Notifications
Calculate when the next maintenance window occurs and send reminders.

### 2. Job Monitoring
Check if scheduled jobs are running on time by comparing actual run times with expected cron schedules.

### 3. Report Generation
Calculate multiple upcoming report generation times for scheduling purposes.

### 4. Multi-timezone Operations
Calculate job execution times across different timezones for global operations.

### 5. Cron Expression Testing
Validate and test cron expressions before deploying them to production systems.

## Example Workflow

```
[Get Scheduled Jobs] 
    → [Cron Parser - Get Next Run Time] 
    → [Compare with Current Time] 
    → [Send Alert if Overdue]
```

## Error Handling

The node provides detailed error messages:

- **Invalid cron expression:** Clear explanation of what's wrong
- **Invalid timezone:** Notification if timezone name is not recognized
- **Invalid date format:** Help with accepted date formats

Enable "Continue on Error" option to handle errors gracefully and continue processing.

## Development

### Build
```bash
npm install
npm run build
```

### Test
```bash
npm test
npm run test:coverage
```

### Lint
```bash
npm run lint
npm run lint:fix
```

## Dependencies

- [cron-parser](https://github.com/harrisiirak/cron-parser) - Robust cron expression parser

## License

MIT

## Support

- [GitHub Issues](https://github.com/cdmx-in/n8n-nodes-cron-parser/issues)
- [n8n Community Forum](https://community.n8n.io/)

## Author

**Roney Dsilva**
- Email: roney.dsilva@cdmx.in
- GitHub: [@cdmx-in](https://github.com/cdmx-in)

## Related Packages

- [@cdmx/n8n-nodes-schema-validator](https://www.npmjs.com/package/@cdmx/n8n-nodes-schema-validator) - JSON Schema validation for n8n
