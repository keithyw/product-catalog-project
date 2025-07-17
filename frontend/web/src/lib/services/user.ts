import axiosClient from '@/lib/clients/axiosClient'
import { API_CURRENT_USER_URL, API_USERS_URL } from '@/lib/constants'
import { Group } from '@/types/group'
import {
	CreateUserRequest,
	UpdateUserRequest,
	UpdateUserProfileRequest,
	User,
	UsersResponse,
} from '@/types/user'

interface UserService {
	createUser: (data: CreateUserRequest) => Promise<User>
	deleteUser: (id: number) => Promise<void>
	getCurrentUser: () => Promise<User>
	getUser: (id: number) => Promise<User>
	getUsers: () => Promise<UsersResponse>
	getUserGroups: (id: number) => Promise<Group[]>
	updateCurrentUser: (data: UpdateUserProfileRequest) => Promise<User>
	updateUser: (id: number, data: UpdateUserRequest) => Promise<User>
	updateUserGroups: (id: number, groupIds: number[]) => Promise<Group[]>
}

const userService: UserService = {
	createUser: async (data: CreateUserRequest): Promise<User> => {
		const res = await axiosClient.post<User>(API_USERS_URL, data)
		return res.data || ({} as User)
	},
	deleteUser: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_USERS_URL}${id}/`)
		return
	},
	getCurrentUser: async (): Promise<User> => {
		const r = await axiosClient.get<User>(API_CURRENT_USER_URL)
		return r.data || ({} as User)
	},
	getUser: async (id: number): Promise<User> => {
		const r = await axiosClient.get<User>(`${API_USERS_URL}${id}/`)
		return r.data || ({} as User)
	},
	getUsers: async (): Promise<UsersResponse> => {
		const r = await axiosClient.get<UsersResponse>(API_USERS_URL)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	getUserGroups: async (id: number): Promise<Group[]> => {
		const r = await axiosClient.get<Group[]>(`${API_USERS_URL}${id}/groups/`)
		return r.data
	},
	updateCurrentUser: async (data: UpdateUserProfileRequest): Promise<User> => {
		const r = await axiosClient.put<User>(API_CURRENT_USER_URL, data)
		return r.data || ({} as User)
	},
	updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
		const r = await axiosClient.put<User>(`${API_USERS_URL}${id}/`, data)
		return r.data || ({} as User)
	},
	updateUserGroups: async (
		id: number,
		groupIds: number[],
	): Promise<Group[]> => {
		const r = await axiosClient.put(`${API_USERS_URL}${id}/groups/`, groupIds)
		return r.data || []
	},
}

export default userService
