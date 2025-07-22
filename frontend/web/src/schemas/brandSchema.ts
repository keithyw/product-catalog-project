import { z } from 'zod'

export const brandCreateSchema = z.object({
	name: z.string().min(1, 'Brand name must be at least 1 characters long.'),
	description: z.string().optional().or(z.literal('')),
	logo_url: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.pipe(z.url('Invalid URL.').optional()),
	website_url: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.pipe(z.url('Invalid URL.').optional()),
	contact_email: z
		.string()
		.optional()
		.transform((val) => (val === '' ? undefined : val))
		.pipe(z.email('Invalid email address.').optional()),
})

export type BrandCreateFormData = z.infer<typeof brandCreateSchema>
