import { z } from 'zod'

export const priceRuleCreateSchema = z.object({
	name: z.string().min(1, 'Name is required.'),
	description: z.string().nullable().optional(),
	rule_type: z.string(),
	rule_config: z.string().nullable().optional(),
	callback_function: z.string().nullable().optional(),
	priority: z.number().int().positive().nullable().optional(),
})

export type PriceRuleCreateFormData = z.infer<typeof priceRuleCreateSchema>
