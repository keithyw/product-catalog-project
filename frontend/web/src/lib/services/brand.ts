import axiosClient from '@/lib/clients/axiosClient'
import { API_BRANDS_URL, API_BRANDS_BULK_URL } from '@/lib/constants'
import {
	Brand,
	CreateBrandRequest,
	CreateBulkBrandResponse,
} from '@/types/brand'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'

interface BrandService {
	bulk: (data: CreateBrandRequest[]) => Promise<CreateBulkBrandResponse>
	create: (data: CreateBrandRequest) => Promise<Brand>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<Brand>>
	get: (id: number) => Promise<Brand>
	update: (id: number, data: CreateBrandRequest) => Promise<Brand>
}

const brandService: BrandService = {
	bulk: async (
		data: CreateBrandRequest[],
	): Promise<CreateBulkBrandResponse> => {
		const res = await axiosClient.post<CreateBulkBrandResponse>(
			API_BRANDS_BULK_URL,
			data,
		)
		return res.data || ({} as CreateBulkBrandResponse)
	},
	create: async (data: CreateBrandRequest): Promise<Brand> => {
		const res = await axiosClient.post<Brand>(API_BRANDS_URL, data)
		return res.data || ({} as Brand)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_BRANDS_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<Brand>> => {
		const params: PaginationParams = { page, page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const r = await axiosClient.get<ListResponse<Brand>>(API_BRANDS_URL, {
			params,
		})
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<Brand> => {
		const r = await axiosClient.get<Brand>(`${API_BRANDS_URL}${id}/`)
		return r.data || ({} as Brand)
	},
	update: async (id: number, data: CreateBrandRequest): Promise<Brand> => {
		const r = await axiosClient.put<Brand>(`${API_BRANDS_URL}${id}/`, data)
		return r.data || ({} as Brand)
	},
}

export default brandService
