import axiosClient from '@/lib/clients/axiosClient'
import { API_USERS_URL } from '@/lib/constants'
import { UsersResponse } from '@/types/user'

interface UserService {
	getUsers: () => Promise<UsersResponse>
}

const userService: UserService = {
	getUsers: async (): Promise<UsersResponse> => {
		const r = await axiosClient.get<UsersResponse>(API_USERS_URL)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
}

export default userService
