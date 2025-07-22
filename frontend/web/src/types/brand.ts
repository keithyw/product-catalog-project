export interface Brand {
	id: number
	name: string
	description?: string
	logo_url?: string
	website_url?: string
	contact_email?: string
}

export interface CreateBrandRequest {
	name: string
	description?: string
	logo_url?: string
	website_url?: string
	contact_email?: string
}

export interface BrandsResponse {
	results: Brand[]
	count: number
	next: number | null
	previous: number | null
}
