export interface Brand {
	id?: number
	name: string
	description?: string
	logo_url?: string
	website_url?: string
	contact_email?: string
}

export interface CreateBrandRequest {
	name: string
	description?: string
	logo_url?: string | null
	website_url?: string | null
	contact_email?: string
}

export interface CreateBulkBrandResponse {
	status: string
	message?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors?: any // cheesing this for now
	created_brands: Brand[]
}

export interface BrandsResponse {
	results: Brand[]
	count: number
	next: number | null
	previous: number | null
}
