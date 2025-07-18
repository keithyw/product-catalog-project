import axiosClient from '@/lib/clients/axiosClient'
import { API_PERMISSIONS_URL, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'
import { Permission } from '@/types/permission'

interface PermissionService {
	getPermissions: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<Permission>>
}

const permissionService: PermissionService = {
	getPermissions: async (
		page: number = 1,
		pageSize: number = DEFAULT_PAGE_SIZE,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<Permission>> => {
		const params: PaginationParams = { page, page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const r = await axiosClient.get<ListResponse<Permission>>(
			API_PERMISSIONS_URL,
			{
				params,
			},
		)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
}

export default permissionService
