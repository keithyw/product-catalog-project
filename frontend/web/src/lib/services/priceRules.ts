import axiosClient from '@/lib/clients/axiosClient'
import { API_PRICE_RULES_URL } from '@/lib/constants'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'
import { CreatePriceRuleRequest, PriceRule } from '@/types/product'

interface PriceRuleService {
	create: (data: CreatePriceRuleRequest) => Promise<PriceRule>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<PriceRule>>
	get: (id: number) => Promise<PriceRule>
	patch: (
		id: number,
		data: Partial<CreatePriceRuleRequest>,
	) => Promise<PriceRule>
}

const priceRuleService: PriceRuleService = {
	create: async (data: CreatePriceRuleRequest): Promise<PriceRule> => {
		const res = await axiosClient.post<PriceRule>(API_PRICE_RULES_URL, data)
		return res.data || ({} as PriceRule)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_PRICE_RULES_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<PriceRule>> => {
		const params: PaginationParams = { page, page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const r = await axiosClient.get<ListResponse<PriceRule>>(
			API_PRICE_RULES_URL,
			{
				params,
			},
		)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<PriceRule> => {
		const r = await axiosClient.get<PriceRule>(`${API_PRICE_RULES_URL}${id}/`)
		return r.data || ({} as PriceRule)
	},
	patch: async (
		id: number,
		data: Partial<CreatePriceRuleRequest>,
	): Promise<PriceRule> => {
		const r = await axiosClient.patch<PriceRule>(
			`${API_PRICE_RULES_URL}${id}/`,
			data,
		)
		return r.data || ({} as PriceRule)
	},
}

export default priceRuleService
