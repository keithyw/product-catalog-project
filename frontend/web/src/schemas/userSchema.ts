import { z } from 'zod'

export const userCreateSchema = z
	.object({
		username: z.string().min(3, 'Username must be at least 3 characters long.'),
		email: z.string().email('Invalid email address.'),
		first_name: z.string().optional().or(z.literal('')), // Optional, can be empty string
		last_name: z.string().optional().or(z.literal('')), // Optional, can be empty string
		password: z.string().min(7, 'Password must be at least 7 characters long.'),
		password_confirm: z.string(),
	})
	.refine((data) => data.password === data.password_confirm, {
		message: 'Passwords do not match',
		path: ['password_confirm'],
	})

export type UserCreateFormData = z.infer<typeof userCreateSchema>
