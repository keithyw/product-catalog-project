import { z } from 'zod'

export const productCreateSchema = z.object({
	name: z.string().min(1, 'Name is required.'),
	description: z.string().nullable().optional(),
	brand: z.number().int().positive().nullable().optional(),
	category: z.number().int().positive().nullable().optional(),
	attribute_set: z
		.union([z.number().min(1), z.null()])
		.refine((val) => val !== null, {
			message: 'Attribute set is required',
		}),
	is_active: z.boolean().default(false).optional(),
})

export type ProductCreateFormData = z.infer<typeof productCreateSchema>

export const attributesDataSchema = z.object({
	attributes_data: z.record(z.string(), z.any()).nullable().optional(),
})

export type AttributesDataFormData = z.infer<typeof attributesDataSchema>
