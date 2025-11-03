export interface Category {
	id: number
	name: string
	slug?: string
	description?: string
	image_url?: string
	banner_image_url?: string
	is_active: boolean
	display_order: number
	meta_title?: string
	meta_description?: string
	meta_keywords?: string
	is_ai_generated: boolean
	verification_status: string
	created_at: string
	updated_at: string
	parent: number | null
	parent_name?: string
	category_system_id?: number
	category_system_name?: string
	category_system_slug?: string
	depth?: number
	path?: string
}

export interface CreateCategoryRequest {
	name: string
	description?: string
	image_url?: string
	banner_image_url?: string
	is_ai_generated: boolean
	verification_status: string
	is_active: boolean
	display_order: number
	meta_title?: string
	meta_description?: string
	meta_keywords?: string
	parent?: number
	category_system_id: number
}

export interface CategoryTreeNode extends Category {
	children: CategoryTreeNode[]
}

export interface SimpleCategoryRequest {
	name: string
	description?: string
	category_system_id?: number
	nested_children_data: SimpleCategoryRequest[]
	is_ai_generated: boolean
	verification_status: string
}

export interface CreateBulkCategoryResponse {
	status: string
	message?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors?: any
	created_categories: Category[]
}
