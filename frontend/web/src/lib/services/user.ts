import axiosClient from '@/lib/clients/axiosClient'
import { API_USERS_URL } from '@/lib/constants'
import { CreateUserRequest, User, UsersResponse } from '@/types/user'

interface UserService {
	createUser: (data: CreateUserRequest) => Promise<User>
	getUsers: () => Promise<UsersResponse>
}

const userService: UserService = {
	createUser: async (data: CreateUserRequest): Promise<User> => {
		const res = await axiosClient.post<User>(API_USERS_URL, data)
		return res.data || ({} as User)
	},
	getUsers: async (): Promise<UsersResponse> => {
		const r = await axiosClient.get<UsersResponse>(API_USERS_URL)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
}

export default userService
