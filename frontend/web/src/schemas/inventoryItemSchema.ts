import { z } from 'zod'

export const inventoryItemSchema = z.object({
	sku: z.string().optional(),
	quantity: z.coerce.number().int().nullable().optional(),
	reserved: z.coerce.number().int().nullable().optional(),
	low_stock_threshold: z.coerce.number().int().nullable().optional(),
})

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>
