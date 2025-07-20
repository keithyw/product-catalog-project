'use client'

import React from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import PageTitle from '@/components/ui/PageTitle'
import UserUpdateForm from '@/components/users/UserUpdateForm'
import { USER_PERMISSIONS } from '@/lib/constants/permissions'

const EditUserPage: React.FC = () => {
	return (
		<PermissionGuard requiredPermission={USER_PERMISSIONS.CHANGE}>
			<div className='max-w-md mx-auto bg-white p-8 rounded-lg shadow-md'>
				<PageTitle>Edit User</PageTitle>
				<UserUpdateForm />
			</div>
		</PermissionGuard>
	)
}

export default EditUserPage
