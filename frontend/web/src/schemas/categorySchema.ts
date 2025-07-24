import { z } from 'zod'

export const categoryCreateSchema = z.object({
	name: z.string().min(3, 'Category name must be at least 3 characters long.'),
	description: z.string().optional().or(z.literal('')),
	image_url: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.pipe(z.url('Invalid URL.').optional()),
	banner_image_url: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.pipe(z.url('Invalid URL.').optional()),
	is_active: z.boolean(),
	display_order: z.number().min(1, 'Display order must be at least 1'),
	meta_title: z.string().optional().or(z.literal('')),
	meta_description: z.string().optional().or(z.literal('')),
	meta_keywords: z.string().optional().or(z.literal('')),
	parent: z.number().optional(),
	category_system_id: z.number(),
})

export type CategoryCreateFormData = z.infer<typeof categoryCreateSchema>
