import { z } from 'zod'

export const groupCreateSchema = z.object({
	name: z.string().min(3, 'Group name must be at least 3 characters long.'),
})

export type GroupCreateFormData = z.infer<typeof groupCreateSchema>
