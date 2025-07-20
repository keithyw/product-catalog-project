'use client'

import { ReactNode } from 'react'
import useAuthStore from '@/stores/useAuthStore'

interface PermissionGuardProps {
	children: ReactNode
	// Permission-based access
	requiredPermission?: string
	requiredPermissions?: string[] // Requires ALL permissions
	anyPermission?: string[] // Requires ANY of these permissions
	// Group-based access
	requiredGroup?: string
	requiredGroups?: string[] // Requires ALL groups
	anyGroup?: string[] // Requires ANY of these groups
	// Staff/admin access
	requireStaff?: boolean
	requireActive?: boolean
	// Fallback component when access is denied
	fallback?: ReactNode
	// Invert the logic (hide when user HAS permission)
	invert?: boolean
}

export default function PermissionGuard({
	children,
	requiredPermission,
	requiredPermissions,
	anyPermission,
	requiredGroup,
	requiredGroups,
	anyGroup,
	requireStaff,
	requireActive,
	fallback = null,
	invert = false,
}: PermissionGuardProps) {
	const {
		user,
		hasPermission,
		hasAnyPermission,
		isInGroup,
		isInAnyGroup,
		isAuthenticated,
	} = useAuthStore()

	// If not authenticated, deny access
	if (!isAuthenticated || !user) {
		return invert ? <>{children}</> : <>{fallback}</>
	}

	let hasAccess = true

	// Check staff requirement
	if (requireStaff && !user.is_staff) {
		hasAccess = false
	}

	// Check active requirement
	if (requireActive && !user.is_active) {
		hasAccess = false
	}

	// Check single permission
	if (requiredPermission && !hasPermission(requiredPermission)) {
		hasAccess = false
	}

	// Check multiple permissions (ALL required)
	if (requiredPermissions && requiredPermissions.length > 0) {
		const hasAllPermissions = requiredPermissions.every(permission =>
			hasPermission(permission)
		)
		if (!hasAllPermissions) {
			hasAccess = false
		}
	}

	// Check any permission (ANY required)
	if (anyPermission && anyPermission.length > 0) {
		if (!hasAnyPermission(anyPermission)) {
			hasAccess = false
		}
	}

	// Check single group
	if (requiredGroup && !isInGroup(requiredGroup)) {
		hasAccess = false
	}

	// Check multiple groups (ALL required)
	if (requiredGroups && requiredGroups.length > 0) {
		const hasAllGroups = requiredGroups.every(group => isInGroup(group))
		if (!hasAllGroups) {
			hasAccess = false
		}
	}

	// Check any group (ANY required)
	if (anyGroup && anyGroup.length > 0) {
		if (!isInAnyGroup(anyGroup)) {
			hasAccess = false
		}
	}

	// Apply invert logic if specified
	const shouldShow = invert ? !hasAccess : hasAccess

	return shouldShow ? <>{children}</> : <>{fallback}</>
}
