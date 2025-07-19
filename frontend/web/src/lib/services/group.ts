import axiosClient from '@/lib/clients/axiosClient'
import { API_GROUPS_URL } from '@/lib/constants'
import {
	Group,
	CreateGroupRequest,
	UpdateGroupRequest,
	GroupsResponse,
} from '@/types/group'
import { Permission } from '@/types/permission'

interface GroupService {
	createGroup: (data: CreateGroupRequest) => Promise<Group>
	deleteGroup: (id: number) => Promise<void>
	getGroup: (id: number) => Promise<Group>
	getGroupPermissions: (id: number) => Promise<Permission[]>
	getGroups: () => Promise<GroupsResponse>
	updateGroup: (id: number, data: UpdateGroupRequest) => Promise<Group>
	updateGroupPermissions: (
		id: number,
		permissionIds: number[],
	) => Promise<Permission[]>
}

const groupService: GroupService = {
	createGroup: async (data: CreateGroupRequest): Promise<Group> => {
		const res = await axiosClient.post<Group>(API_GROUPS_URL, data)
		return res.data || ({} as Group)
	},
	deleteGroup: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_GROUPS_URL}${id}/`)
		return
	},
	getGroup: async (id: number): Promise<Group> => {
		const r = await axiosClient.get<Group>(`${API_GROUPS_URL}${id}/`)
		return r.data || ({} as Group)
	},
	getGroupPermissions: async (id: number): Promise<Permission[]> => {
		const r = await axiosClient.get<Permission[]>(
			`${API_GROUPS_URL}${id}/permissions/`,
		)
		return r.data || []
	},
	getGroups: async (): Promise<GroupsResponse> => {
		const r = await axiosClient.get<GroupsResponse>(API_GROUPS_URL)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	updateGroup: async (id: number, data: UpdateGroupRequest): Promise<Group> => {
		const r = await axiosClient.put<Group>(`${API_GROUPS_URL}${id}/`, data)
		return r.data || ({} as Group)
	},
	updateGroupPermissions: async (
		id: number,
		permissionIds: number[],
	): Promise<Permission[]> => {
		const r = await axiosClient.put(
			`${API_GROUPS_URL}${id}/permissions/`,
			permissionIds,
		)
		return r.data || []
	},
}

export default groupService
