export interface InventoryItem {
	id?: number
	product_name?: string
	product?: number
	sku?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes_data?: Record<string, any> | null
	quantity?: number
	reserved?: number
	low_stock_threshold?: number
	is_active?: boolean
	created_at?: string
	updated_at?: string
}

export interface CreateInventoryItemRequest {
	product: number
	sku: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes_data?: Record<string, any> | null
	quantity: number
	reserved: number
	low_stock_threshold: number
	is_active: boolean
}
