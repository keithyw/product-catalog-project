'use client'

import useAuthStore from '@/stores/useAuthStore'

export interface PermissionCheck {
	// Permission-based checks
	requiredPermission?: string
	requiredPermissions?: string[] // Requires ALL permissions
	anyPermission?: string[] // Requires ANY of these permissions
	// Group-based checks
	requiredGroup?: string
	requiredGroups?: string[] // Requires ALL groups
	anyGroup?: string[] // Requires ANY of these groups
	// Staff/admin checks
	requireStaff?: boolean
	requireActive?: boolean
}

export function usePermissions() {
	const {
		user,
		hasPermission,
		hasAnyPermission,
		isInGroup,
		isInAnyGroup,
		isAuthenticated,
	} = useAuthStore()

	const checkAccess = (checks: PermissionCheck): boolean => {
		// If not authenticated, deny access
		if (!isAuthenticated || !user) {
			return false
		}

		// Check staff requirement
		if (checks.requireStaff && !user.is_staff) {
			return false
		}

		// Check active requirement
		if (checks.requireActive && !user.is_active) {
			return false
		}

		// Check single permission
		if (checks.requiredPermission && !hasPermission(checks.requiredPermission)) {
			return false
		}

		// Check multiple permissions (ALL required)
		if (checks.requiredPermissions && checks.requiredPermissions.length > 0) {
			const hasAllPermissions = checks.requiredPermissions.every(permission =>
				hasPermission(permission)
			)
			if (!hasAllPermissions) {
				return false
			}
		}

		// Check any permission (ANY required)
		if (checks.anyPermission && checks.anyPermission.length > 0) {
			if (!hasAnyPermission(checks.anyPermission)) {
				return false
			}
		}

		// Check single group
		if (checks.requiredGroup && !isInGroup(checks.requiredGroup)) {
			return false
		}

		// Check multiple groups (ALL required)
		if (checks.requiredGroups && checks.requiredGroups.length > 0) {
			const hasAllGroups = checks.requiredGroups.every(group => isInGroup(group))
			if (!hasAllGroups) {
				return false
			}
		}

		// Check any group (ANY required)
		if (checks.anyGroup && checks.anyGroup.length > 0) {
			if (!isInAnyGroup(checks.anyGroup)) {
				return false
			}
		}

		return true
	}

	// Convenience methods for common permission patterns
	const canCreateUser = () => hasPermission('add_user')
	const canEditUser = () => hasPermission('change_user')
	const canDeleteUser = () => hasPermission('delete_user')
	const canViewUser = () => hasPermission('view_user')

	const canCreateGroup = () => hasPermission('add_group')
	const canEditGroup = () => hasPermission('change_group')
	const canDeleteGroup = () => hasPermission('delete_group')
	const canViewGroup = () => hasPermission('view_group')

	const isStaff = () => user?.is_staff || false
	const isActive = () => user?.is_active || false

	return {
		// Core permission checking
		checkAccess,
		hasPermission,
		hasAnyPermission,
		isInGroup,
		isInAnyGroup,
		
		// User-related permissions
		canCreateUser,
		canEditUser,
		canDeleteUser,
		canViewUser,
		
		// Group-related permissions
		canCreateGroup,
		canEditGroup,
		canDeleteGroup,
		canViewGroup,
		
		// User status checks
		isStaff,
		isActive,
		
		// User data
		user,
		isAuthenticated,
	}
}
