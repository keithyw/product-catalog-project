import axiosClient from '@/lib/clients/axiosClient'
import { API_CATEGORIES_URL } from '@/lib/constants'
import { Category, CreateCategoryRequest } from '@/types/category'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'

interface CategoryService {
	create: (data: CreateCategoryRequest) => Promise<Category>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<Category>>
	get: (id: number) => Promise<Category>
	getBySystemId: (systemId: number) => Promise<Category[]>
	update: (id: number, data: CreateCategoryRequest) => Promise<Category>
}

const categoryService: CategoryService = {
	create: async (data: CreateCategoryRequest): Promise<Category> => {
		const res = await axiosClient.post<Category>(API_CATEGORIES_URL, data)
		return res.data || ({} as Category)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_CATEGORIES_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<Category>> => {
		const params: PaginationParams = { page, page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const r = await axiosClient.get<ListResponse<Category>>(
			API_CATEGORIES_URL,
			{
				params,
			},
		)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<Category> => {
		const r = await axiosClient.get<Category>(`${API_CATEGORIES_URL}${id}/`)
		return r.data || ({} as Category)
	},
	getBySystemId: async (systemId: number): Promise<Category[]> => {
		const r = await axiosClient.get<Category[]>(
			`${API_CATEGORIES_URL}tree/?system_id=${systemId}`,
		)
		return r.data || []
	},
	update: async (
		id: number,
		data: CreateCategoryRequest,
	): Promise<Category> => {
		const r = await axiosClient.put<Category>(
			`${API_CATEGORIES_URL}${id}/`,
			data,
		)
		return r.data || ({} as Category)
	},
}

export default categoryService
