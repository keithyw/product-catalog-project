// Common Django permission codenames
// These are typically auto-generated by Django based on your models

// User permissions
export const USER_PERMISSIONS = {
	VIEW: 'view_user',
	ADD: 'add_user',
	CHANGE: 'change_user',
	DELETE: 'delete_user',
} as const

// Group permissions
export const GROUP_PERMISSIONS = {
	VIEW: 'view_group',
	ADD: 'add_group',
	CHANGE: 'change_group',
	DELETE: 'delete_group',
} as const

// Permission permissions (for managing permissions themselves)
export const PERMISSION_PERMISSIONS = {
	VIEW: 'view_permission',
	ADD: 'add_permission',
	CHANGE: 'change_permission',
	DELETE: 'delete_permission',
} as const

// Brand permissions
export const BRAND_PERMISSIONS = {
	VIEW: 'view_brand',
	ADD: 'add_brand',
	CHANGE: 'change_brand',
	DELETE: 'delete_brand',
} as const

export const CATEGORY_PERMISSIONS = {
	VIEW: 'view_category',
	ADD: 'add_category',
	CHANGE: 'change_category',
	DELETE: 'delete_category',
} as const

export const PRODUCT_ATTIBUTE_PERMISSIONS = {
	VIEW: 'view_productattribute',
	ADD: 'add_productattribute',
	CHANGE: 'change_productattribute',
	DELETE: 'delete_productattribute',
} as const

export const PRODUCT_PERMISSIONS = {
	VIEW: 'view_product',
	ADD: 'add_product',
	CHANGE: 'change_product',
	DELETE: 'delete_product',
}

// Common group names (customize based on your groups)
export const COMMON_GROUPS = {
	ADMIN: 'Admin',
	MANAGER: 'Manager',
	EMPLOYEE: 'Employee',
	HR: 'HR',
	IT: 'IT',
} as const

// Permission sets for common operations
export const PERMISSION_SETS = {
	USER_MANAGEMENT: [
		USER_PERMISSIONS.VIEW,
		USER_PERMISSIONS.ADD,
		USER_PERMISSIONS.CHANGE,
		USER_PERMISSIONS.DELETE,
	],
	GROUP_MANAGEMENT: [
		GROUP_PERMISSIONS.VIEW,
		GROUP_PERMISSIONS.ADD,
		GROUP_PERMISSIONS.CHANGE,
		GROUP_PERMISSIONS.DELETE,
	],
	FULL_ADMIN: [
		...Object.values(USER_PERMISSIONS),
		...Object.values(GROUP_PERMISSIONS),
		...Object.values(PERMISSION_PERMISSIONS),
	],
} as const

// Helper function to check if a permission is a CRUD operation
export function getPermissionAction(
	codename: string,
): 'view' | 'add' | 'change' | 'delete' | 'unknown' {
	if (codename.startsWith('view_')) return 'view'
	if (codename.startsWith('add_')) return 'add'
	if (codename.startsWith('change_')) return 'change'
	if (codename.startsWith('delete_')) return 'delete'
	return 'unknown'
}

// Helper function to get the model name from a permission codename
export function getPermissionModel(codename: string): string {
	const action = getPermissionAction(codename)
	if (action === 'unknown') return codename
	return codename.replace(`${action}_`, '')
}
