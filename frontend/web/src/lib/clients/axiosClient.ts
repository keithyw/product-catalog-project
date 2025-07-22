// frontend/web/src/lib/clients/axiosClient.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import {
	ACCESS_TOKEN_KEY,
	API_REFRESH_URL,
	API_TOKEN_URL, // <--- Ensure API_TOKEN_URL is imported here
	LOGIN_URL,
	REFRESH_TOKEN_KEY,
} from '@/lib/constants'
import useAuthStore from '@/stores/useAuthStore'
import userService from '@/lib/services/user'

let isRefreshing = false
let failedQueue: Array<{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resolve: (value?: any) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reject: (reason?: any) => void
}> = []

const processQueue = (
	error: AxiosError | null,
	token: string | null = null,
) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error)
		} else if (token) {
			prom.resolve(token)
		}
	})
	failedQueue = []
}

const axiosClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
	timeout: 10000, // 10 seconds timeout
})

axiosClient.interceptors.request.use(
	(config) => {
		const t = localStorage.getItem(ACCESS_TOKEN_KEY)
		if (t) {
			config.headers.Authorization = `Bearer ${t}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	},
)

axiosClient.interceptors.response.use(
	(res) => {
		return res
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfig & {
			_retry?: boolean
		}

		// Only attempt refresh logic if it's a 401 AND it's not the original login request
		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry
		) {
			// If the original request was to the login endpoint, just reject with the original error
			// without trying to refresh or redirect.
			if (originalRequest.url?.includes(API_TOKEN_URL)) {
				return Promise.reject(error)
			}

			// If the 401 is for the refresh URL itself (e.g., refresh token is bad), redirect to login
			if (originalRequest.url?.includes(API_REFRESH_URL)) {
				useAuthStore.getState().setLogoutStatus()
				window.location.href = LOGIN_URL
				console.error(
					'Refresh token is invalid or expired, redirecting to login',
					error,
				)
				return Promise.reject(error)
			}

			// If it's a 401 for a non-login, non-refresh request, proceed with refresh logic
			if (!isRefreshing) {
				isRefreshing = true
				try {
					const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
					if (!refreshToken) {
						throw new Error('No refresh token found')
					}

					const res = await axios.post<{ access: string; refresh?: string }>(
						`${process.env.NEXT_PUBLIC_API_URL}${API_REFRESH_URL}`,
						{ refresh: refreshToken },
					)

					const { access: newAccessToken, refresh: newRefreshToken } = res.data
					localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
					if (newRefreshToken) {
						localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
					}

					useAuthStore.getState().setLoginStatus({
						access: newAccessToken,
						refresh: newRefreshToken || refreshToken,
					})

					processQueue(null, newAccessToken)
					originalRequest.headers = {
						...originalRequest.headers,
						Authorization: `Bearer ${newAccessToken}`,
					}

					// Refresh user data asynchronously in the background
					// Don't await this to avoid blocking the original request
					userService.getCurrentUser()
						.then((userDetails) => {
							useAuthStore.getState().setUser(userDetails)
							useAuthStore.getState().setUserGroups(userDetails.groups)
							const userPerms = userDetails.groups.flatMap(
								(group) => group.permissions || [],
							)
							useAuthStore.getState().setUserPermissions(userPerms)
						})
						.catch((userError) => {
							// Log error but don't fail the token refresh
							console.warn('Failed to refresh user data after token refresh:', userError)
						})

					return axiosClient(originalRequest)
				} catch (refreshError: unknown) {
					// If refresh fails for any reason, log out and redirect
					processQueue(refreshError as AxiosError)
					useAuthStore.getState().setLogoutStatus()
					window.location.href = LOGIN_URL // This line is now only hit if a *refresh* failed for a *non-login* request.
					console.error(
						'Refresh token failed, redirecting to login: ',
						refreshError,
					)
					return Promise.reject(refreshError)
				} finally {
					isRefreshing = false
				}
			}
		}

		// If the 401 was handled (e.g., queued for refresh) or not a 401,
		// or if it was a 401 for which we explicitly rejected (like login endpoint),
		// or if it was a 401 and isRefreshing was true (queued), then we might have to wait.
		// The original code had this outside the 'if (!isRefreshing)' block but within the interceptor.
		// It effectively queues requests if another refresh is in progress.
		// This part needs to be carefully placed.
		// If the original request was a 401 and not handled by an earlier 'return Promise.reject(error)',
		// and isRefreshing is true, it should queue.
		if (error.response?.status === 401 && isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject })
			})
		}

		console.error('API Error: ', error)
		return Promise.reject(error)
	},
)

export default axiosClient
