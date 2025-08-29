import { z } from 'zod'

export const assetSchema = {
	url: z.url(),
	name: z.string().optional().or(z.literal('')),
	type: z.string(),
	filepath: z.string().optional().or(z.literal('')),
	extension: z.string().optional().or(z.literal('')),
	dimensions: z.string().optional().or(z.literal('')),
	description: z.string().optional().or(z.literal('')),
}

export const assetCreateSchema = z.object(assetSchema)

export type AssetCreateFormData = z.infer<typeof assetCreateSchema>
