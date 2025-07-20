'use client'

import React from 'react'
import {
	PlusIcon,
	PencilIcon,
	TrashIcon,
	EyeIcon,
} from '@heroicons/react/24/outline'
import PermissionGuard from '@/components/auth/PermissionGuard'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { USER_PERMISSIONS, GROUP_PERMISSIONS } from '@/lib/permissions'
import { RowActionsMenu } from '@/components/ui/RowActionsMenu'
import type { User } from '@/types/user'
import type { TableRowAction } from '@/types/table'

// Example component showing how to use permission-based UI controls
export default function UserManagementExample() {
	const {
		canCreateUser,
		canEditUser,
		canDeleteUser,
		canViewUser,
		checkAccess,
		isStaff,
	} = usePermissions()

	// Mock users data - replace with your actual data
	const users: User[] = []

	const handleCreateUser = () => {
		console.log('Creating new user...')
		// Your create user logic here
	}

	const handleEditUser = (user: User) => {
		console.log('Editing user:', user.username)
		// Your edit user logic here
	}

	const handleDeleteUser = (user: User) => {
		console.log('Deleting user:', user.username)
		// Your delete user logic here
	}

	const handleViewUser = (user: User) => {
		console.log('Viewing user:', user.username)
		// Your view user logic here
	}

	const handleManageGroups = (user: User) => {
		console.log('Managing groups for user:', user.username)
		// Your manage groups logic here
	}

	// Define row actions based on permissions
	const getRowActions = (user: User): TableRowAction<User>[] => {
		const actions: TableRowAction<User>[] = []

		// View action - always available if user has view permission
		if (canViewUser()) {
			actions.push({
				label: 'View Details',
				actionType: 'view',
				onClick: handleViewUser,
			})
		}

		// Edit action - only if user can edit users
		if (canEditUser()) {
			actions.push({
				label: 'Edit User',
				actionType: 'edit',
				onClick: handleEditUser,
			})
		}

		// Manage groups - only if user can view groups (and edit users)
		if (
			canEditUser() &&
			checkAccess({ requiredPermission: GROUP_PERMISSIONS.VIEW })
		) {
			actions.push({
				label: 'Manage Groups',
				actionType: 'userGroup',
				onClick: handleManageGroups,
			})
		}

		// Delete action - only if user can delete users
		if (canDeleteUser()) {
			actions.push({
				label: 'Delete User',
				actionType: 'delete',
				onClick: handleDeleteUser,
			})
		}

		return actions
	}

	return (
		<div className='p-6'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold text-gray-900'>User Management</h1>

				{/* Create User Button - Only show if user has permission */}
				<PermissionGuard requiredPermission={USER_PERMISSIONS.ADD}>
					<button
						onClick={handleCreateUser}
						className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					>
						<PlusIcon className='w-4 h-4 mr-2' />
						Create User
					</button>
				</PermissionGuard>
			</div>

			{/* Admin-only section */}
			<PermissionGuard requireStaff>
				<div className='bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6'>
					<h3 className='text-sm font-medium text-yellow-800'>Admin Panel</h3>
					<p className='text-sm text-yellow-700 mt-1'>
						This section is only visible to staff members.
					</p>
				</div>
			</PermissionGuard>

			{/* User list with permission-based actions */}
			<div className='bg-white shadow overflow-hidden sm:rounded-md'>
				<ul className='divide-y divide-gray-200'>
					{users.map((user) => (
						<li key={user.id} className='px-6 py-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center'>
									<div className='flex-shrink-0'>
										<div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
											<span className='text-sm font-medium text-gray-700'>
												{user.first_name?.[0] || user.username[0]}
											</span>
										</div>
									</div>
									<div className='ml-4'>
										<div className='text-sm font-medium text-gray-900'>
											{user.first_name} {user.last_name}
										</div>
										<div className='text-sm text-gray-500'>{user.email}</div>
									</div>
								</div>

								{/* Row actions menu with permission-based actions */}
								<PermissionGuard requiredPermission={USER_PERMISSIONS.VIEW}>
									<RowActionsMenu actions={getRowActions(user)} row={user} />
								</PermissionGuard>
							</div>

							{/* User status indicators - only show to staff */}
							<PermissionGuard requireStaff>
								<div className='mt-2 flex items-center space-x-4 text-xs text-gray-500'>
									<span
										className={
											user.is_active ? 'text-green-600' : 'text-red-600'
										}
									>
										{user.is_active ? 'Active' : 'Inactive'}
									</span>
									{user.is_staff && (
										<span className='text-blue-600'>Staff</span>
									)}
									<span>Groups: {user.groups?.length || 0}</span>
								</div>
							</PermissionGuard>
						</li>
					))}
				</ul>
			</div>

			{/* Permission-based conditional rendering examples */}
			<div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
				{/* Show different content based on permissions */}
				<PermissionGuard
					anyPermission={[USER_PERMISSIONS.ADD, USER_PERMISSIONS.CHANGE]}
					fallback={
						<div className='bg-gray-50 rounded-lg p-4'>
							<p className='text-gray-600'>
								You don't have permission to manage users.
							</p>
						</div>
					}
				>
					<div className='bg-blue-50 rounded-lg p-4'>
						<h3 className='font-medium text-blue-900'>User Management Tools</h3>
						<p className='text-blue-700 text-sm mt-1'>
							You can create and edit users.
						</p>
					</div>
				</PermissionGuard>

				{/* Group-based access */}
				<PermissionGuard
					anyGroup={['HR', 'Admin']}
					fallback={
						<div className='bg-gray-50 rounded-lg p-4'>
							<p className='text-gray-600'>HR and Admin only section.</p>
						</div>
					}
				>
					<div className='bg-green-50 rounded-lg p-4'>
						<h3 className='font-medium text-green-900'>HR Tools</h3>
						<p className='text-green-700 text-sm mt-1'>
							Access to HR-specific functionality.
						</p>
					</div>
				</PermissionGuard>
			</div>

			{/* Example of inverted logic - hide from certain users */}
			<PermissionGuard
				requiredPermission={USER_PERMISSIONS.DELETE}
				invert={true}
			>
				<div className='mt-6 bg-red-50 border border-red-200 rounded-md p-4'>
					<p className='text-red-800 text-sm'>
						⚠️ You don't have delete permissions. Some destructive actions are
						hidden.
					</p>
				</div>
			</PermissionGuard>
		</div>
	)
}
