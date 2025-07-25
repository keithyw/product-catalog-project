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
	created_at: string
	updated_at: string
	parent: number | null
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
