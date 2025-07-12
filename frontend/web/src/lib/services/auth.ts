import axiosClient from '@/lib/clients/axiosClient'
import { AuthResponse } from '@/types/auth'
import { API_TOKEN_URL } from '@/lib/constants'

interface AuthService {
	login: (username: string, password: string) => Promise<AuthResponse>
}

const authService: AuthService = {
	login: async (username: string, password: string): Promise<AuthResponse> => {
		const r = await axiosClient.post<AuthResponse>(API_TOKEN_URL, {
			username,
			password,
		})
		return r.data
	},
}

export default authService
