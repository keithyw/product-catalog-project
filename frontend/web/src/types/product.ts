import { Asset } from '@/types/asset'
import { SelectableItem } from '@/types/base'

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

export const VERIFICATION_STATUS_OPTIONS = [
	{ value: 'PENDING', label: 'Pending Verification' },
	{ value: 'VERIFIED', label: 'Verified' },
	{ value: 'FAILED', label: 'Failed Verification' },
	{ value: 'EXEMPT', label: 'Does not require verification' },
	{ value: 'REJECTED', label: 'Rejected' },
	{ value: 'ACCEPTED', label: 'Accepted' },
]

export const PRICE_MODIFIER_TYPES = [
	{ value: 'flat_amount', label: 'Flat Amount' },
	{ value: 'percentage', label: 'Percentage' },
	{ value: 'fixed_price', label: 'Fixed Price' },
]

export const RULE_TYPES = [
	{ value: 'always_true', label: 'Always True' },
	{ value: 'date_comparison', label: 'Date Comparison' },
	{ value: 'time_comparison', label: 'Time Comparison' },
	{ value: 'attribute_comparison', label: 'Attribute Comparison' },
]

export const COMPARISON_OPERATORS = [
	{ value: '=', label: '=' },
	{ value: '!=', label: '!=' },
	{ value: '>', label: '>' },
	{ value: '>=', label: '>=' },
	{ value: '<', label: '<' },
	{ value: '<=', label: '<=' },
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

export interface ProductAttribute extends SelectableItem {
	display_name: string
	display_order?: number | null
	sample_values?: string | null
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

export interface CreateBulkProductAttributeResponse {
	status: string
	message?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors?: any
	created_product_attributes: ProductAttribute[]
}

export interface CreateProductAttributeRequest {
	name: string
	display_name?: string | null
	display_order?: number | null
	sample_values?: string | null
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
	lookup_field: string[]
	// this should be a number; will change later
	product_type_brands?: number[] | null
	is_ai_generated: boolean
	verification_status: string
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
	product_type_brands?: number[] | null
	lookup_field?: string[] | null
	is_ai_generated?: boolean
	verification_status?: string | null
}

export interface SuggestedCorrection {
	field: string
	source: string
	original_value: string
	corrected_value: string
}

export interface Price {
	id: number
	price: number
	currency_code: string | null
	region_code: string | null
	price_source: string | null
	is_active: boolean
	valid_from: string | null
	valid_to: string | null
	created_at: string
	updated_at: string
}
export interface CreatePriceRequest {
	price: number
	currency_code?: string | null
	region_code?: string | null
	product: number
	price_source?: string | null
	valid_from?: string | null
	valid_to?: string | null
}

export interface PriceModifier {
	id: number
	name: string
	description: string | null
	amount: number
	category: number | null
	category_name: string | null
	product_attribute: number | null
	product_attribute_value: string | null
	product_attribute_name: string | null
	product_attribute_set: number | null
	product_attribute_set_name: string | null
	type: string
	priority: number
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface CreatePriceModifierRequest {
	name: string
	description?: string | null
	amount: number
	category?: number | null
	product_attribute?: number | null
	product_attribute_value?: string | null
	product_attribute_set?: number | null
	type: string
	priority: number
	is_active?: boolean
}

export interface PriceRule {
	id: number
	name: string
	description: string | null
	rule_type: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rule_config: Record<string, any> | null
	active_from: string | null
	active_to: string | null
	callback_function: string | null
	priority: number
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface CreatePriceRuleRequest {
	name: string
	description: string | null
	rule_type: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rule_config: Record<string, any> | null
	active_from: string | null
	active_to: string | null
	callback_function: string | null
	priority: number
	is_active: boolean
}
export interface Product {
	id: string
	name: string
	description: string | null
	brand: number | null
	brand_name: string | null
	category: number | null
	category_name: string | null
	assets: Asset[] | []
	attribute_set: number
	attribute_set_name: string | null
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes_data: Record<string, any> | null
	price: Price | null
	suggested_corrections: SuggestedCorrection[]
	uuid: string
	is_active: boolean
	is_ai_generated: boolean
	verification_status: string
	created_at: string
	updated_at: string
}

export interface CreateProductRequest {
	name: string
	description?: string | null
	brand?: number | null
	category?: number | null
	attribute_set: number | null
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes_data?: Record<string, any> | null
	is_active?: boolean
	is_ai_generated?: boolean
	verification_status?: string | null
}

export interface ProductsResponse {
	results: Product[]
	count: number
	next: number | null
	previous: number | null
}

export interface SimpleProduct {
	id?: number
	name: string
	brand: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes: Record<string, any>
}
export interface GenerateProductBulkResponse {
	status: string
	product_type: string
	data: SimpleProduct[]
}

export interface GeneratedProductResponse {
	status: string
	product_type: string
	data: SimpleProduct
}

export interface GeneratedDescriptionResponse {
	detail: { description: string }
}
