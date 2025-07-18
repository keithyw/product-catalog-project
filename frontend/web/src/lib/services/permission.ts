import axiosClient from '@/lib/clients/axiosClient'
import { API_PERMISSIONS_URL, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { PermissionsResponse } from '@/types/permission'

interface PermissionService {
	getPermissions: (
		page?: number,
		pageSize?: number,
	) => Promise<PermissionsResponse>
}

const permissionService: PermissionService = {
	getPermissions: async (
		page: number = 1,
		pageSize: number = DEFAULT_PAGE_SIZE,
	): Promise<PermissionsResponse> => {
		const r = await axiosClient.get<PermissionsResponse>(
			`${API_PERMISSIONS_URL}?page=${page}&page_size=${pageSize}`,
		)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
}

export default permissionService
