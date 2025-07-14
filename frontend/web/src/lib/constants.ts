export const DATE_FORMAT_DISPLAY = 'MM/DD/YYYY HH:mm a'

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

export const API_TOKEN_URL = '/token/'
export const API_REFRESH_URL = '/token/refresh/'

export const API_PRODUCT_URL = '/products/'
export const API_USERS_URL = '/users/'
export const API_CURRENT_USER_URL = `${API_USERS_URL}me/`

export const LOGIN_URL = '/login'
export const DASHBOARD_URL = '/dashboard'
export const PRODUCTS_URL = '/products'
export const PROFILE_URL = '/profile'
export const USERS_URL = '/users'
export const CREATE_USERS_URL = `${USERS_URL}/create`

export const PROTECTED_ROUTES = [
	DASHBOARD_URL,
	PRODUCTS_URL,
	PROFILE_URL,
	USERS_URL,
]
export const PUBLIC_ROUTES = [LOGIN_URL]

export const FAILED_LOADING_USER_ERROR =
	'Failed to load user. Please try again.'
export const GENERIC_SERVER_ERROR =
	'Network error or request failed. Please try again.'
export const UNEXPECTED_SERVER_ERROR =
	'Unexpected server error. Please try again.'
