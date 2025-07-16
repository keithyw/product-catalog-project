import axiosClient from '@/lib/clients/axiosClient'
import { API_GROUPS_URL } from '@/lib/constants'
import {
	Group,
	CreateGroupRequest,
	UpdateGroupRequest,
	GroupsResponse,
} from '@/types/group'

interface GroupService {
	createGroup: (data: CreateGroupRequest) => Promise<Group>
	deleteGroup: (id: number) => Promise<void>
	getGroup: (id: number) => Promise<Group>
	getGroups: () => Promise<GroupsResponse>
	updateGroup: (id: number, data: UpdateGroupRequest) => Promise<Group>
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
	getGroups: async (): Promise<GroupsResponse> => {
		const r = await axiosClient.get<GroupsResponse>(API_GROUPS_URL)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	updateGroup: async (id: number, data: UpdateGroupRequest): Promise<Group> => {
		const r = await axiosClient.put<Group>(`${API_GROUPS_URL}${id}/`, data)
		return r.data || ({} as Group)
	},
}

export default groupService
