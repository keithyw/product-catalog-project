import axiosClient from '@/lib/clients/axiosClient'
import { API_PERMISSIONS_URL } from '@/lib/constants'
import { PermissionsResponse } from '@/types/permission'

interface PermissionService {
	getPermissions: () => Promise<PermissionsResponse>
}

const permissionService: PermissionService = {
	getPermissions: async (): Promise<PermissionsResponse> => {
		const r = await axiosClient.get<PermissionsResponse>(API_PERMISSIONS_URL)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
}

export default permissionService
