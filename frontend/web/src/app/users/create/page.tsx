'use client'

import PageTitle from '@/components/ui/PageTitle'
import UserCreateForm from '@/components/users/UserCreateForm'

export default function CreateUserPage() {
	return (
		<div className='max-w-md mx-auto bg-white p-8 rounded-lg shadow-md'>
			<PageTitle>Create New User</PageTitle>
			<UserCreateForm />
		</div>
	)
}
