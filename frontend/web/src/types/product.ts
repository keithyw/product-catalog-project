export const ATTRIBUTE_TYPE_OPTIONS = [
	{ value: 'text', label: 'Text Input' },
	{ value: 'textarea', label: 'Text Area' },
	{ value: 'number', label: 'Number' },
	{ value: 'boolean', label: 'Boolean (Yes/No)' },
	{ value: 'select', label: 'Dropdown Select' },
	{ value: 'multiselect', label: 'Multi-select Dropdown' },
	{ value: 'date', label: 'Date' },
	{ value: 'datetime', label: 'Date & Time' },
	{ value: 'json', label: 'JSON (Raw)' },
]

export type ProductAttributeType =
	| 'text'
	| 'textarea'
	| 'number'
	| 'boolean'
	| 'select'
	| 'multiselect'
	| 'date'
	| 'datetime'
	| 'json'

export interface ProductAttribute {
	id: number
	name: string
	code: string
	description?: string
	type: ProductAttributeType
	is_required: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default_value?: any | null
	options?: Array<{ value: string | number; label: string }> | null
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	validation_rules: Record<string, any> | null
	created_at: string
	updated_at: string
}

export interface CreateProductAttributeRequest {
	name: string
	description?: string | null
	type: ProductAttributeType
	is_required?: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default_value?: any | null
	options?: Array<{ value: string | number; label: string }> | null
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	validation_rules: Record<string, any> | null
}

export interface ProductAttributeSet {
	id: number
	name: string
	code: string
	description: string | null
	attributes: number[]
	attributes_detail: ProductAttribute[]
	category: number | null
	category_name: string | null
	brand: number | null
	brand_name: string | null
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface CreateProductAttributeSetRequest {
	name: string
	description?: string | null
	attributes: number[]
	category?: number | null
	brand?: number | null
	is_active?: boolean
}

export interface Product {
	id: string
	name: string
	description: string
	brand: number | null
	brand_name: string | null
	category: number | null
	category_name: string | null
	attribute_set: number | null
	attribute_set_name: string | null
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes_data: Record<string, any> | null
	uuid: string
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface CreateProductRequest {
	name: string
	description?: string | null
	brand?: number | null
	category?: number | null
	attribute_set?: number | null
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes_data?: Record<string, any> | null
	is_active?: boolean
}

export interface ProductsResponse {
	results: Product[]
	count: number
	next: number | null
	previous: number | null
}
