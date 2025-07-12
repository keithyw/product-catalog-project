'use client'

import PageTitle from '@/components/ui/PageTitle'
import UserCreateForm from '@/components/users/UserCreateForm'

export default function CreateUserPage() {
	return (
		<>
			<PageTitle>Create New User</PageTitle>
			<UserCreateForm />
		</>
	)
}
