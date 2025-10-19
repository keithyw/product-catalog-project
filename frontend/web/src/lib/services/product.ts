import { AxiosError } from 'axios'
import axiosClient from '@/lib/clients/axiosClient'
import {
	API_PRODUCT_URL,
	API_PRODUCTS_BULK_URL,
	API_PRODUCTS_GENERATE_URL,
} from '@/lib/constants'
import { AIServiceException } from '@/lib/services/aiTools'
import { FilterParams } from '@/types/filters'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'
import {
	CreateProductRequest,
	GenerateProductBulkResponse,
	Product,
} from '@/types/product'

interface ProductService {
	bulk: (data: CreateProductRequest[]) => Promise<Product[]>
	create: (data: CreateProductRequest) => Promise<Product>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
		filters?: FilterParams,
	) => Promise<ListResponse<Product>>
	generate: (
		productType: string,
		prompt: string,
	) => Promise<GenerateProductBulkResponse>
	get: (id: number) => Promise<Product>
	patch: (id: number, data: Partial<CreateProductRequest>) => Promise<Product>
	update: (id: number, data: CreateProductRequest) => Promise<Product>
}

const productService: ProductService = {
	bulk: async (data: CreateProductRequest[]): Promise<Product[]> => {
		const res = await axiosClient.post<Product[]>(API_PRODUCTS_BULK_URL, data)
		return res.data || ([] as Product[])
	},
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
		filters?: FilterParams,
	): Promise<ListResponse<Product>> => {
		const params: PaginationParams & FilterParams = {
			page,
			page_size: pageSize,
			...(filters || {}),
		}
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		Object.keys(params).forEach((k) =>
			params[k] === undefined ? delete params[k] : {},
		)
		const r = await axiosClient.get<ListResponse<Product>>(API_PRODUCT_URL, {
			params,
		})
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	generate: async (
		productType: string,
		prompt: string,
	): Promise<GenerateProductBulkResponse> => {
		try {
			const res = await axiosClient.post<GenerateProductBulkResponse>(
				API_PRODUCTS_GENERATE_URL,
				{
					product_type: productType,
					prompt: prompt,
				},
			)
			return res.data
		} catch (e: unknown) {
			if (e instanceof AxiosError) {
				if (e.response) {
					throw new AIServiceException(
						e.response.data.message,
						e.response.status,
					)
				}
			}
		}
		throw new AIServiceException('Unknown error', 500)
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
