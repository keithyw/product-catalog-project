import axiosClient from '@/lib/clients/axiosClient'
import { API_USERS_URL } from '@/lib/constants'
import {
	CreateUserRequest,
	UpdateUserRequest,
	User,
	UsersResponse,
} from '@/types/user'

interface UserService {
	createUser: (data: CreateUserRequest) => Promise<User>
	deleteUser: (id: number) => Promise<void>
	getUser: (id: number) => Promise<User>
	getUsers: () => Promise<UsersResponse>
	updateUser: (id: number, data: UpdateUserRequest) => Promise<User>
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
	getUser: async (id: number): Promise<User> => {
		const r = await axiosClient.get<User>(`${API_USERS_URL}${id}/`)
		return r.data || ({} as User)
	},
	getUsers: async (): Promise<UsersResponse> => {
		const r = await axiosClient.get<UsersResponse>(API_USERS_URL)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
	updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
		const r = await axiosClient.put<User>(`${API_USERS_URL}${id}/`, data)
		return r.data || ({} as User)
	},
}

export default userService
