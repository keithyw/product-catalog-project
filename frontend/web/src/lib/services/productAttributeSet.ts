import axiosClient from '@/lib/clients/axiosClient'
import {
	API_PRODUCT_ATTRIBUTE_SETS_URL,
	DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'
import {
	CreateProductAttributeSetRequest,
	ProductAttributeSet,
} from '@/types/product'

interface ProductAttributeSetService {
	create: (
		data: CreateProductAttributeSetRequest,
	) => Promise<ProductAttributeSet>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<ProductAttributeSet>>
	get: (id: number) => Promise<ProductAttributeSet>
	update: (
		id: number,
		data: CreateProductAttributeSetRequest,
	) => Promise<ProductAttributeSet>
}

const productAttributeSetService: ProductAttributeSetService = {
	create: async (
		data: CreateProductAttributeSetRequest,
	): Promise<ProductAttributeSet> => {
		const res = await axiosClient.post<ProductAttributeSet>(
			API_PRODUCT_ATTRIBUTE_SETS_URL,
			data,
		)
		return res.data || ({} as ProductAttributeSet)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_PRODUCT_ATTRIBUTE_SETS_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<ProductAttributeSet>> => {
		const params: PaginationParams = { page_size: DEFAULT_PAGE_SIZE }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const res = await axiosClient.get<ListResponse<ProductAttributeSet>>(
			API_PRODUCT_ATTRIBUTE_SETS_URL,
			{
				params,
			},
		)
		return res.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<ProductAttributeSet> => {
		const res = await axiosClient.get<ProductAttributeSet>(
			`${API_PRODUCT_ATTRIBUTE_SETS_URL}${id}/`,
		)
		return res.data || ({} as ProductAttributeSet)
	},
	update: async (
		id: number,
		data: CreateProductAttributeSetRequest,
	): Promise<ProductAttributeSet> => {
		const res = await axiosClient.put<ProductAttributeSet>(
			`${API_PRODUCT_ATTRIBUTE_SETS_URL}${id}/`,
			data,
		)
		return res.data || ({} as ProductAttributeSet)
	},
}

export default productAttributeSetService
