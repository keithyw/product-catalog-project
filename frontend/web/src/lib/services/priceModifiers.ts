import axiosClient from '@/lib/clients/axiosClient'
import { API_PRICE_MODIFIERS_URL } from '@/lib/constants'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'
import { PriceModifier, CreatePriceModifierRequest } from '@/types/product'

interface PriceModifiersService {
	create: (data: CreatePriceModifierRequest) => Promise<PriceModifier>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<PriceModifier>>
	get: (id: number) => Promise<PriceModifier>
	patch: (
		id: number,
		data: Partial<CreatePriceModifierRequest>,
	) => Promise<PriceModifier>
}

const priceModifiersService: PriceModifiersService = {
	create: async (data: CreatePriceModifierRequest): Promise<PriceModifier> => {
		const res = await axiosClient.post<PriceModifier>(
			API_PRICE_MODIFIERS_URL,
			data,
		)
		return res.data || ({} as PriceModifier)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_PRICE_MODIFIERS_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<PriceModifier>> => {
		const params: PaginationParams = { page, page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const r = await axiosClient.get<ListResponse<PriceModifier>>(
			API_PRICE_MODIFIERS_URL,
			{
				params,
			},
		)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<PriceModifier> => {
		const r = await axiosClient.get<PriceModifier>(
			`${API_PRICE_MODIFIERS_URL}${id}/`,
		)
		return r.data || ({} as PriceModifier)
	},
	patch: async (
		id: number,
		data: Partial<CreatePriceModifierRequest>,
	): Promise<PriceModifier> => {
		const r = await axiosClient.patch<PriceModifier>(
			`${API_PRICE_MODIFIERS_URL}${id}/`,
			data,
		)
		return r.data || ({} as PriceModifier)
	},
}

export default priceModifiersService
