import axiosClient from '@/lib/clients/axiosClient'
import { API_PRODUCT_URL } from '@/lib/constants'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'
import { CreateProductRequest, Product } from '@/types/product'

interface ProductService {
	create: (data: CreateProductRequest) => Promise<Product>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<Product>>
	get: (id: number) => Promise<Product>
	patch: (id: number, data: Partial<CreateProductRequest>) => Promise<Product>
	update: (id: number, data: CreateProductRequest) => Promise<Product>
}

const productService: ProductService = {
	create: async (data: CreateProductRequest): Promise<Product> => {
		const res = await axiosClient.post<Product>(API_PRODUCT_URL, data)
		return res.data || ({} as Product)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_PRODUCT_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<Product>> => {
		const params: PaginationParams = { page, page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const r = await axiosClient.get<ListResponse<Product>>(API_PRODUCT_URL, {
			params,
		})
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<Product> => {
		const r = await axiosClient.get<Product>(`${API_PRODUCT_URL}${id}/`)
		return r.data || ({} as Product)
	},
	patch: async (
		id: number,
		data: Partial<CreateProductRequest>,
	): Promise<Product> => {
		const r = await axiosClient.patch<Product>(`${API_PRODUCT_URL}${id}/`, data)
		return r.data || ({} as Product)
	},
	update: async (id: number, data: CreateProductRequest): Promise<Product> => {
		const r = await axiosClient.put<Product>(`${API_PRODUCT_URL}${id}/`, data)
		return r.data || ({} as Product)
	},
}

export default productService
