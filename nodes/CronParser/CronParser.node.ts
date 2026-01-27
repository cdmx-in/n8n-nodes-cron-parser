import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import {
	getNextRunTime,
	getMultipleNextRunTimes,
	getPreviousRunTime,
	validateCronExpression,
	safeParseCronExpression,
	formatDate,
} from './lib';
import type { CalculationMode, OutputFormat } from './types';

export class CronParser implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cron Parser',
		name: 'cronParser',
		icon: 'file:CronParser.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Parse cron expressions and calculate next/previous run times with timezone support',
		defaults: {
			name: 'Cron Parser',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: false,
				options: [
					{
						name: 'Get Next Run Time',
						value: 'getNext',
						description: 'Calculate the next run time from a cron expression',
						action: 'Get next run time',
					},
					{
						name: 'Get Multiple Next Run Times',
						value: 'getMultiple',
						description: 'Calculate multiple next run times from a cron expression',
						action: 'Get multiple next run times',
					},
					{
						name: 'Get Previous Run Time',
						value: 'getPrevious',
						description: 'Calculate the previous run time from a cron expression',
						action: 'Get previous run time',
					},
					{
						name: 'Validate Cron Expression',
						value: 'validate',
						description: 'Validate if a cron expression is valid',
						action: 'Validate cron expression',
					},
				],
				default: 'getNext',
			},
			{
				displayName: 'Cron Expression',
				name: 'cronExpression',
				type: 'string',
				default: '0 0 * * *',
				required: true,
				placeholder: '0 0 * * * (daily at midnight)',
				description: 'The cron expression to parse. Supports standard 5-field format (minute, hour, day, month, weekday).',
			},
			{
				displayName: 'Current Date/Time',
				name: 'currentDateTime',
				type: 'string',
				default: '',
				placeholder: 'Leave empty for current time',
				description: 'The date/time to calculate from. Accepts ISO strings, timestamps, or any valid date string. Leave empty to use current time.',
				displayOptions: {
					hide: {
						operation: ['validate'],
					},
				},
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: 'UTC',
				placeholder: 'UTC, America/New_York, Europe/London',
				description: 'The timezone for calculation. Use IANA timezone names (e.g., America/New_York, Europe/London) or UTC.',
				displayOptions: {
					hide: {
						operation: ['validate'],
					},
				},
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 5,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Number of next run times to calculate (1-100)',
				displayOptions: {
					show: {
						operation: ['getMultiple'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Output Format',
						name: 'outputFormat',
						type: 'options',
						options: [
							{
								name: 'ISO String',
								value: 'iso',
								description: 'ISO 8601 format (e.g., 2024-01-15T10:30:00.000Z)',
							},
							{
								name: 'Unix Timestamp',
								value: 'timestamp',
								description: 'Unix timestamp in milliseconds',
							},
							{
								name: 'Formatted String',
								value: 'formatted',
								description: 'Human-readable format (e.g., Mon, 15 Jan 2024 10:30:00 GMT)',
							},
						],
						default: 'iso',
						description: 'Format for the output date/time',
					},
					{
						displayName: 'Include Details',
						name: 'includeDetails',
						type: 'boolean',
						default: true,
						description: 'Whether to include additional details (cron expression, timezone, current date) in the output',
					},
					{
						displayName: 'Continue on Error',
						name: 'continueOnError',
						type: 'boolean',
						default: false,
						description: 'Whether to continue processing other items if one fails',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];
				const cronExpression = this.getNodeParameter('cronExpression', itemIndex) as string;
				const options = this.getNodeParameter('options', itemIndex, {}) as {
					outputFormat?: OutputFormat;
					includeDetails?: boolean;
					continueOnError?: boolean;
				};

				const outputFormat = options.outputFormat || 'iso';
				const includeDetails = options.includeDetails !== false;

				if (operation === 'validate') {
					// Validate cron expression
					const validation = validateCronExpression(cronExpression);
					const json: any = {
						isValid: validation.isValid,
						cronExpression,
					};

					if (!validation.isValid) {
						json.error = validation.error;
					}

					returnData.push({
						json,
						pairedItem: { item: itemIndex },
					});
				} else {
					// Operations that require date/time calculation
					const currentDateTime = this.getNodeParameter('currentDateTime', itemIndex, '') as string;
					const timezone = this.getNodeParameter('timezone', itemIndex, 'UTC') as string;

					// Validate cron expression first
					const validation = validateCronExpression(cronExpression);
					if (!validation.isValid) {
						throw new NodeOperationError(
							this.getNode(),
							`Invalid cron expression: ${validation.error}`,
							{ itemIndex },
						);
					}

					let json: any = {};

					switch (operation) {
						case 'getNext': {
							const nextRunTime = getNextRunTime(
								cronExpression,
								currentDateTime || undefined,
								timezone,
							);
							const nextDate = new Date(nextRunTime);
							
							json.next_run_time = formatDate(nextDate, outputFormat);
							
							if (includeDetails) {
								json.cron_expression = cronExpression;
								json.timezone = timezone;
								json.current_date_time = currentDateTime || new Date().toISOString();
							}
							break;
						}

						case 'getMultiple': {
							const count = this.getNodeParameter('count', itemIndex, 5) as number;
							const nextRunTimes = getMultipleNextRunTimes(
								cronExpression,
								count,
								currentDateTime || undefined,
								timezone,
							);
							
							json.next_run_times = nextRunTimes.map(time => 
								formatDate(new Date(time), outputFormat)
							);
							json.count = nextRunTimes.length;
							
							if (includeDetails) {
								json.cron_expression = cronExpression;
								json.timezone = timezone;
								json.current_date_time = currentDateTime || new Date().toISOString();
							}
							break;
						}

						case 'getPrevious': {
							const previousRunTime = getPreviousRunTime(
								cronExpression,
								currentDateTime || undefined,
								timezone,
							);
							const prevDate = new Date(previousRunTime);
							
							json.previous_run_time = formatDate(prevDate, outputFormat);
							
							if (includeDetails) {
								json.cron_expression = cronExpression;
								json.timezone = timezone;
								json.current_date_time = currentDateTime || new Date().toISOString();
							}
							break;
						}

						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unknown operation: ${operation}`,
								{ itemIndex },
							);
					}

					returnData.push({
						json,
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				const options = this.getNodeParameter('options', itemIndex, {}) as {
					continueOnError?: boolean;
				};

				if (options.continueOnError) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
							success: false,
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw error;
				}

				throw new NodeOperationError(
					this.getNode(),
					error instanceof Error ? error.message : 'Failed to parse cron expression',
					{ itemIndex },
				);
			}
		}

		return [returnData];
	}
}
