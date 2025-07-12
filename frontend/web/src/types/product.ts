export interface Product {
	id: string
	name: string
	description: string
}

export interface ProductsResponse {
	results: Product[]
	count: number
	next: number | null
	previous: number | null
}
