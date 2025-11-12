import { z } from 'zod'

export const priceModifierCreateSchema = z.object({
	name: z.string().min(1, 'Name is required.'),
	description: z.string().nullable().optional(),
	amount: z
		.string()
		.regex(/^-?\d+\.?\d{0,2}$/, 'Invalid price format')
		.refine((val) => {
			const num = parseFloat(val)
			return !isNaN(num)
		}, 'Amount must be a number'),
	category: z.number().int().positive().nullable().optional(),
	product_attribute: z.number().int().positive().nullable().optional(),
	product_attribute_value: z.string().nullable().optional(),
	product_attribute_set: z.number().int().positive().nullable().optional(),
	type: z.string(),
	priority: z.number().int().positive().nullable().optional(),
})

export type PriceModifierCreateFormData = z.infer<
	typeof priceModifierCreateSchema
>
