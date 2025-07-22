import { create } from 'zustand'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants'
import { AuthResponse } from '@/types/auth'
import { User } from '@/types/user'
import { Permission } from '@/types/permission'
import { Group } from '@/types/group'

// Constants for localStorage keys
const USER_DATA_KEY = 'user_data'
const USER_PERMISSIONS_KEY = 'user_permissions'
const USER_GROUPS_KEY = 'user_groups'

interface AuthStore {
	accessToken: string
	refreshToken: string
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null
	user: User | null
	userPermissions: Permission[]
	userGroups: Group[]

	checkIfAuthenticated: () => void
	setUser: (user: User) => void
	setUserPermissions: (permissions: Permission[]) => void
	setUserGroups: (groups: Group[]) => void
	hasPermission: (codename: string) => boolean
	hasAnyPermission: (codenames: string[]) => boolean
	isInGroup: (groupName: string) => boolean
	isInAnyGroup: (groupNames: string[]) => boolean

	// might be temporary
	// need to see how axios interceptors work with zustand
	setAccessToken: (token: string) => void
	setRefreshToken: (token: string) => void
	setLoginStatus: (authResponse: AuthResponse) => void
	setLogoutStatus: () => void
}

const useAuthStore = create<AuthStore>((set, get) => ({
	accessToken: '',
	refreshToken: '',
	isAuthenticated: false,
	isLoading: true,
	error: null,
	user: null,
	userPermissions: [],
	userGroups: [],

	checkIfAuthenticated: () => {
		set({ isLoading: true, error: null })

		const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

		if (accessToken && refreshToken) {
			// Restore user data from localStorage if available
			const userData = localStorage.getItem(USER_DATA_KEY)
			const userPermissions = localStorage.getItem(USER_PERMISSIONS_KEY)
			const userGroups = localStorage.getItem(USER_GROUPS_KEY)

			set({
				accessToken,
				refreshToken,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				user: userData ? JSON.parse(userData) : null,
				userPermissions: userPermissions ? JSON.parse(userPermissions) : [],
				userGroups: userGroups ? JSON.parse(userGroups) : [],
			})
		} else {
			set({
				isAuthenticated: false,
				isLoading: false,
				error: null,
			})
		}
	},

	setUser: (user: User) => {
		set({ user })
		localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
	},
	setUserPermissions: (permissions: Permission[]) => {
		set({ userPermissions: permissions })
		localStorage.setItem(USER_PERMISSIONS_KEY, JSON.stringify(permissions))
	},
	setUserGroups: (groups: Group[]) => {
		set({ userGroups: groups })
		localStorage.setItem(USER_GROUPS_KEY, JSON.stringify(groups))
	},

	hasPermission: (codename: string) => {
		const { userPermissions } = get()
		return userPermissions.some(permission => permission.codename === codename)
	},

	hasAnyPermission: (codenames: string[]) => {
		const { userPermissions } = get()
		return codenames.some(codename => 
			userPermissions.some(permission => permission.codename === codename)
		)
	},

	isInGroup: (groupName: string) => {
		const { userGroups } = get()
		return userGroups.some(group => group.name === groupName)
	},

	isInAnyGroup: (groupNames: string[]) => {
		const { userGroups } = get()
		return groupNames.some(groupName => 
			userGroups.some(group => group.name === groupName)
		)
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
			user: null,
			userPermissions: [],
			userGroups: [],
		})
		localStorage.removeItem(ACCESS_TOKEN_KEY)
		localStorage.removeItem(REFRESH_TOKEN_KEY)
		localStorage.removeItem(USER_DATA_KEY)
		localStorage.removeItem(USER_PERMISSIONS_KEY)
		localStorage.removeItem(USER_GROUPS_KEY)
	},
}))

export default useAuthStore
