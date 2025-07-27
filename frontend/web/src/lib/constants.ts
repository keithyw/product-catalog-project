export const DATE_FORMAT_DISPLAY = 'MM/DD/YYYY HH:mm a'
export const DEFAULT_PAGE_SIZE = 10

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

export const API_TOKEN_URL = '/token/'
export const API_REFRESH_URL = '/token/refresh/'

export const API_BRANDS_URL = '/brands/'
export const API_CATEGORIES_URL = '/categories/'
export const API_CATEGORY_SYSTEMS_URL = '/category-systems/'
export const API_GROUPS_URL = '/groups/'
export const API_PERMISSIONS_URL = '/permissions/'
export const API_PRODUCT_ATTIBUTES_URL = '/product-attributes/'
export const API_PRODUCT_ATTRIBUTE_SETS_URL = '/product-attribute-sets/'
export const API_PRODUCT_URL = '/products/'
export const API_USERS_URL = '/users/'
export const API_CURRENT_USER_URL = `${API_USERS_URL}me/`

export const LOGIN_URL = '/login'
export const BRANDS_URL = '/brands'
export const CREATE_BRANDS_URL = `${BRANDS_URL}/create`
export const CATEGORIES_URL = '/categories'
export const CREATE_CATEGORIES_URL = `${CATEGORIES_URL}/create`
export const DASHBOARD_URL = '/dashboard'
export const PRODUCTS_URL = '/products'
export const PRODUCT_ATTIBUTES_URL = `${PRODUCTS_URL}/product-attributes`
export const CREATE_PRODUCT_ATTIBUTES_URL = `${PRODUCT_ATTIBUTES_URL}/create`
export const PRODUCT_ATTRIBUTE_SETS_URL = `${PRODUCTS_URL}/product-attribute-sets`
export const CREATE_PRODUCT_ATTRIBUTE_SETS_URL = `${PRODUCT_ATTRIBUTE_SETS_URL}/create`
export const PROFILE_URL = '/profile'
export const USERS_URL = '/users'
export const CREATE_USERS_URL = `${USERS_URL}/create`

export const GROUPS_URL = `${USERS_URL}/groups`
export const CREATE_GROUPS_URL = `${GROUPS_URL}/create`
export const PERMISSIONS_URL = `${USERS_URL}/permissions`

export const PROTECTED_ROUTES = [
	BRANDS_URL,
	CATEGORIES_URL,
	DASHBOARD_URL,
	PRODUCTS_URL,
	PRODUCT_ATTIBUTES_URL,
	PROFILE_URL,
	USERS_URL,
]
export const PUBLIC_ROUTES = [LOGIN_URL]

export const FAILED_LOADING_BRANDS_ERROR =
	'Failed to load brands. Please try again.'
export const FAILED_LOADING_CATEGORIES_ERROR =
	'Failed to load categories. Please try again.'
export const FAILED_LOADING_GROUP_ERROR =
	'Failed to load groups. Please try again.'
export const FAILED_LOADING_PRODUCT_ATTIBUTE_ERROR =
	'Failed to load product attributes. Please try again.'
export const FAILED_LOADING_PRODUCT_ATTIBUTE_SET_ERROR =
	'Failed to load product attribute set. Please try again.'
export const FAILED_LOADING_USER_ERROR =
	'Failed to load user. Please try again.'
export const GENERIC_SERVER_ERROR =
	'Network error or request failed. Please try again.'
export const UNEXPECTED_SERVER_ERROR =
	'Unexpected server error. Please try again.'

export const DELETE_LINK_STYLE = 'bg-red-500 hover:bg-red-600'
export const EDIT_LINK_STYLE = 'bg-blue-500 hover:bg-blue-600'
export const VIEW_LINK_STYLE = 'bg-gray-500 hover:bg-gray-600'
