import { z } from 'zod'

export const priceCreateSchema = z.object({
	price: z
		.string()
		.regex(/^\d+\.?\d{0,2}$/, 'Invalid price format')
		.refine((val) => parseFloat(val) >= 0.01, 'Price must be at least 0.01'),
})

export type PriceCreateFormData = z.output<typeof priceCreateSchema>
