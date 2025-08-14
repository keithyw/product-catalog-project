import { z } from 'zod'

export const productAttributeSetCreateSchema = z.object({
	name: z.string().min(1, 'Name is required.'),
	description: z.string().nullable().optional(),
	is_active: z.boolean().default(true).optional(),
	category: z.number().int().positive().nullable().optional(),
	brand: z.number().int().positive().nullable().optional(),
})

export type ProductAttributeSetFormData = z.infer<
	typeof productAttributeSetCreateSchema
>
