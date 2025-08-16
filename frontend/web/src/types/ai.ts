import { ProductAttributeType } from '@/types/product'

export interface SimpleBrand {
	id?: number
	name: string
	description: string
}

export interface GeneratedResponse<T> {
	status: string
	entity_type: string
	data: T[]
}

export interface GenerateBrandResponse {
	status: string
	entity_type: string
	data: SimpleBrand[]
}

export interface SimpleCategory {
	id?: number
	name: string
	description: string
	children?: SimpleCategory[]
}

export interface GenerateCategoryResponse {
	status: string
	entity_type: string
	data: SimpleCategory[]
}

export interface SimpleProductAttribute {
	id?: number
	name: string
	display_name?: string | null
	sample_values?: string | null
	description?: string | null
	type: ProductAttributeType
	is_required: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default_value?: any | null
	options?: Array<{ value: string | number; label: string }> | null
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	validation_rules: Record<string, any> | null
}

export interface GenerateProductAttributeResponse {
	status: string
	entity_type: string
	data: SimpleProductAttribute[]
}

export interface PromptHintComponentProps {
	onHandleSubmit: () => void
}
