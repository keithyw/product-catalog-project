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

export const imageSchema = {
	url: z.url(),
	name: z.string().optional().or(z.literal('')),
	description: z.string().optional().or(z.literal('')),
}

export const assetCreateSchema = z.object(assetSchema)
export const imageCreateSchema = z.object(imageSchema)

export type AssetCreateFormData = z.infer<typeof assetCreateSchema>
export type ImageCreateFormData = z.infer<typeof imageCreateSchema>
