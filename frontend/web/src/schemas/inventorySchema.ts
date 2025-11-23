import { z } from 'zod'

export const inventoryItemEditSchema = z.object({
	sku: z.string().min(1, 'SKU is required'),
	quantity: z.coerce
		.number()
		.int()
		.min(0, 'Quantity must be a non-negative integer'),
	reserved: z.coerce
		.number()
		.int()
		.min(0, 'Reserved must be a non-negative integer'),
	low_stock_threshold: z.coerce
		.number()
		.int()
		.min(0, 'Low stock threshold must be a non-negative integer'),
})

export type InventoryItemEditFormData = z.infer<typeof inventoryItemEditSchema>
