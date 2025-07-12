import { create } from 'zustand'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants'
import { AuthResponse } from '@/types/auth'

interface AuthStore {
	accessToken: string
	refreshToken: string
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

	checkIfAuthenticated: () => void

	// might be temporary
	// need to see how axios interceptors work with zustand
	setAccessToken: (token: string) => void
	setRefreshToken: (token: string) => void
	setLoginStatus: (authResponse: AuthResponse) => void
	setLogoutStatus: () => void
}

const useAuthStore = create<AuthStore>((set) => ({
	accessToken: '',
	refreshToken: '',
	isAuthenticated: false,
	isLoading: true,
	error: null,

	checkIfAuthenticated: () => {
		set({ isLoading: true, error: null })

		const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

		if (accessToken && refreshToken) {
			set({
				isAuthenticated: true,
				isLoading: false,
				error: null,
			})
		} else {
			set({
				isAuthenticated: false,
				isLoading: false,
				error: null,
			})
		}
	},

	setAccessToken: (token: string) => set({ accessToken: token }),
	setRefreshToken: (token: string) => set({ refreshToken: token }),
	setLoginStatus: (authResponse: AuthResponse) => {
		set({
			accessToken: authResponse.access,
			refreshToken: authResponse.refresh,
			isAuthenticated: true,
			isLoading: false,
			error: null,
		})
		localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.access)
		localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refresh)
	},
	setLogoutStatus: () => {
		set({
			accessToken: '',
			refreshToken: '',
			isAuthenticated: false,
			isLoading: false,
			error: null,
		})
		localStorage.removeItem(ACCESS_TOKEN_KEY)
		localStorage.removeItem(REFRESH_TOKEN_KEY)
	},
}))

export default useAuthStore
