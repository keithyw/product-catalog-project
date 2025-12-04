export const LOGIN_URL = '/login'
export const AI_TOOLS_URL = '/ai-tools'
export const ASSETS_URL = '/assets'
export const CREATE_ASSETS_URL = `${ASSETS_URL}/create`
export const BRANDS_URL = '/brands'
export const BULK_CREATE_BRANDS_URL = `${BRANDS_URL}/bulk`
export const CREATE_BRANDS_URL = `${BRANDS_URL}/create`
export const CATEGORIES_URL = '/categories'
export const CREATE_CATEGORIES_URL = `${CATEGORIES_URL}/create`
export const DASHBOARD_URL = '/dashboard'
export const INVENTORY_URL = '/inventory'
export const CREATE_INVENTORY_URL = `${INVENTORY_URL}/create`
export const PRICE_URL = '/price'
export const PRICING_URL = '/pricing'
export const PRICING_MODIFIERS_URL = `${PRICING_URL}/modifiers`
export const PRICING_RULES_URL = `${PRICING_URL}/rules`
export const CREATE_PRICING_RULES_URL = `${PRICING_RULES_URL}/create`
export const CREATE_PRICING_MODIFIERS_URL = `${PRICING_MODIFIERS_URL}/create`
export const PRODUCTS_URL = '/products'
export const CREATE_PRODUCT_URL = `${PRODUCTS_URL}/create`
export const CREATE_PRODUCT_FROM_IMAGE_URL = `${PRODUCTS_URL}/from-image`
export const PRODUCTS_AI_TOOLS_URL = `${PRODUCTS_URL}/${AI_TOOLS_URL}`
export const PRODUCT_ATTRIBUTES_URL = `${PRODUCTS_URL}/product-attributes`
export const CREATE_PRODUCT_ATTRIBUTES_URL = `${PRODUCT_ATTRIBUTES_URL}/create`
export const PRODUCT_ATTRIBUTE_SETS_URL = `${PRODUCTS_URL}/product-attribute-sets`
export const CREATE_PRODUCT_ATTRIBUTE_SETS_URL = `${PRODUCT_ATTRIBUTE_SETS_URL}/create`
export const PROFILE_URL = '/profile'
export const USERS_URL = '/users'
export const CREATE_USERS_URL = `${USERS_URL}/create`

export const GROUPS_URL = `${USERS_URL}/groups`
export const CREATE_GROUPS_URL = `${GROUPS_URL}/create`
export const PERMISSIONS_URL = `${USERS_URL}/permissions`

export const PROTECTED_ROUTES = [
	AI_TOOLS_URL,
	ASSETS_URL,
	BRANDS_URL,
	CATEGORIES_URL,
	DASHBOARD_URL,
	PRODUCTS_URL,
	PRODUCT_ATTRIBUTES_URL,
	PROFILE_URL,
	USERS_URL,
]
export const PUBLIC_ROUTES = [LOGIN_URL]
