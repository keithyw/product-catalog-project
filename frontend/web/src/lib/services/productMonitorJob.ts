import axiosClient from '@/lib/clients/axiosClient'
import { API_PRODUCT_MONITOR_JOB_URL } from '@/lib/constants'
import { FilterParams } from '@/types/filters'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'
import {
	CreateProductMonitorJobRequest,
	ProductMonitorJob,
} from '@/types/product'

interface ProductMonitorJobService {
	create: (data: CreateProductMonitorJobRequest) => Promise<ProductMonitorJob>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
		filters?: FilterParams,
	) => Promise<ListResponse<ProductMonitorJob>>
	get: (id: number) => Promise<ProductMonitorJob>
	patch: (
		id: number,
		data: Partial<CreateProductMonitorJobRequest>,
	) => Promise<ProductMonitorJob>
}

const productMonitorJobService: ProductMonitorJobService = {
	create: async (
		data: CreateProductMonitorJobRequest,
	): Promise<ProductMonitorJob> => {
		const res = await axiosClient.post<ProductMonitorJob>(
			API_PRODUCT_MONITOR_JOB_URL,
			data,
		)
		return res.data || ({} as ProductMonitorJob)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_PRODUCT_MONITOR_JOB_URL}/${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
		filters?: FilterParams,
	): Promise<ListResponse<ProductMonitorJob>> => {
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
		const r = await axiosClient.get<ListResponse<ProductMonitorJob>>(
			API_PRODUCT_MONITOR_JOB_URL,
			{ params },
		)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<ProductMonitorJob> => {
		const r = await axiosClient.get<ProductMonitorJob>(
			`${API_PRODUCT_MONITOR_JOB_URL}/${id}/`,
		)
		return r.data || ({} as ProductMonitorJob)
	},
	patch: async (
		id: number,
		data: Partial<CreateProductMonitorJobRequest>,
	): Promise<ProductMonitorJob> => {
		const r = await axiosClient.patch<ProductMonitorJob>(
			`${API_PRODUCT_MONITOR_JOB_URL}/${id}/`,
			data,
		)
		return r.data || ({} as ProductMonitorJob)
	},
}

export default productMonitorJobService
