import axiosClient from '@/lib/clients/axiosClient'
import { API_CATEGORY_SYSTEMS_URL } from '@/lib/constants'
import { CategorySystem } from '@/types/categorySystem'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'

interface CategorySystemService {
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<CategorySystem>>
}

const categorySystemService: CategorySystemService = {
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<CategorySystem>> => {
		const params: PaginationParams = { page, page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const r = await axiosClient.get<ListResponse<CategorySystem>>(
			API_CATEGORY_SYSTEMS_URL,
			{
				params,
			},
		)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
}

export default categorySystemService
