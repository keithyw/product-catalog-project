import axiosClient from '@/lib/clients/axiosClient'
import { API_PRODUCT_ATTIBUTES_URL } from '@/lib/constants'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'
import {
	CreateProductAttributeRequest,
	ProductAttribute,
} from '@/types/product'

interface ProductAttributeService {
	create: (data: CreateProductAttributeRequest) => Promise<ProductAttribute>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<ProductAttribute>>
	get: (id: number) => Promise<ProductAttribute>
	update: (
		id: number,
		data: CreateProductAttributeRequest,
	) => Promise<ProductAttribute>
}

const productAttributeService: ProductAttributeService = {
	create: async (
		data: CreateProductAttributeRequest,
	): Promise<ProductAttribute> => {
		const res = await axiosClient.post<ProductAttribute>(
			API_PRODUCT_ATTIBUTES_URL,
			data,
		)
		return res.data || ({} as ProductAttribute)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_PRODUCT_ATTIBUTES_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<ProductAttribute>> => {
		const params: PaginationParams = { page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const res = await axiosClient.get<ListResponse<ProductAttribute>>(
			API_PRODUCT_ATTIBUTES_URL,
			{
				params,
			},
		)
		return res.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<ProductAttribute> => {
		const res = await axiosClient.get<ProductAttribute>(
			`${API_PRODUCT_ATTIBUTES_URL}${id}/`,
		)
		return res.data || ({} as ProductAttribute)
	},
	update: async (
		id: number,
		data: CreateProductAttributeRequest,
	): Promise<ProductAttribute> => {
		const res = await axiosClient.put<ProductAttribute>(
			`${API_PRODUCT_ATTIBUTES_URL}${id}/`,
			data,
		)
		return res.data || ({} as ProductAttribute)
	},
}

export default productAttributeService
