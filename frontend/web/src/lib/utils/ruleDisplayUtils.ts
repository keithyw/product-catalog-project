import { PriceRule } from '@/types/product' // Ensure you import your PriceRule type

/**
 * Parses the rule_config JSON and generates a human-readable summary string.
 * This function should be extended whenever a new rule_type is introduced.
 *
 * @param rule The PriceRule object containing the type and configuration JSON.
 * @returns A string summarizing the rule condition.
 */
export const getRuleConfigDisplaySummary = (rule: PriceRule): string => {
	// Defensive check for missing or null config
	if (!rule.rule_config || typeof rule.rule_config !== 'string') {
		if (rule.rule_type === 'always_true') {
			return 'Always applies (No configuration needed)'
		}
		return 'Configuration Missing or Invalid'
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let config: any
	try {
		config = JSON.parse(rule.rule_config)
	} catch (e: unknown) {
		console.error(e)
		return 'Configuration Parsing Error (Invalid JSON)'
	}

	// --- Main Logic: Use a switch for extensibility ---
	switch (rule.rule_type) {
		case 'always_true':
			return 'Always applies (No configuration needed)'

		case 'attribute_comparison':
			// Requires: comparison_operator, compared_value
			const op = config.comparison_operator || 'is'
			const value =
				config.compared_value !== undefined && config.compared_value !== null
					? String(config.compared_value)
					: '[Value Missing]'

			return `Compare: [Attribute] ${op} "${value}"`

		// --- FUTURE RULE TYPES GO HERE ---
		case 'time_comparison':
			// Example for future:
			const timeStart = config.start_time || 'midnight'
			const timeEnd = config.end_time || 'midnight'
			return `Time is between ${timeStart} and ${timeEnd}`

		case 'customer_group_check':
			// Example for future:
			const groups = config.groups.join(', ')
			return `Customer is in group(s): ${groups}`

		default:
			return 'Unrecognized Rule Type'
	}
}
