'use client'

import React from 'react'
import PageTitle from '@/components/ui/PageTitle'
import UserUpdateForm from '@/components/users/UserUpdateForm'

const EditUserPage: React.FC = () => {
	return (
		<div className='max-w-md mx-auto bg-white p-8 rounded-lg shadow-md'>
			<PageTitle>Edit User</PageTitle>
			<UserUpdateForm />
		</div>
	)
}

export default EditUserPage
