'use client'

import React from 'react'
import PageTitle from '@/components/ui/PageTitle'
import PermissionGuard from '@/components/auth/PermissionGuard'
import UserCreateForm from '@/components/users/UserCreateForm'
import { USER_PERMISSIONS } from '@/lib/constants/permissions'

export default function CreateUserPage() {
	return (
		<PermissionGuard requiredPermission={USER_PERMISSIONS.ADD}>
			<div className='max-w-md mx-auto bg-white p-8 rounded-lg shadow-md'>
				<PageTitle>Create New User</PageTitle>
				<UserCreateForm />
			</div>
		</PermissionGuard>
	)
}
