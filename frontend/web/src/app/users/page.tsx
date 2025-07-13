'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DataTable from '@/components/ui/DataTable'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { USERS_URL } from '@/lib/constants'
import userService from '@/lib/services/user'
import useUserStore from '@/stores/useUserStore'
import { TableColumn, TableRowAction } from '@/types/table'
import { User } from '@/types/user'

export default function UsersPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = React.useState(true)
	const [searchTerm, setSearchTerm] = React.useState('')
	const setUsers = useUserStore((state) => state.setUsers)
	const users = useUserStore((state) => state.users)

	const userColumns: TableColumn<User>[] = [
		{
			header: 'ID',
			accessor: 'id',
		},
		{
			header: 'Username',
			accessor: 'username',
		},
		{
			header: 'Full Name',
			render: (user: User) =>
				`${user.first_name || ''} ${user.last_name || ''}`,
		},
		{
			header: 'Is Staff',
			render: (user: User) => `${user.is_staff ? 'Yes' : 'No'}`,
		},
		{
			header: 'Is Active',
			render: (user: User) => `${user.is_active ? 'Yes' : 'No'}`,
		},
		{
			header: 'Date Joined',
			render: (user: User) =>
				user.date_joined ? new Date(user.date_joined).toLocaleString() : '',
		},
		{
			header: 'Last Login',
			render: (user: User) =>
				user.last_login ? new Date(user.last_login).toLocaleString() : '',
		},
	]

	const userActions: TableRowAction<User>[] = [
		{
			label: 'View Details',
			onClick: (user) => {
				router.push(`${USERS_URL}/${user.id}`)
			},
			className: 'bg-gray-500 hover:bg-gray-600',
		},
		{
			label: 'Edit',
			onClick: (user) => {
				console.log('Editing ', user.id)
			},
			className: 'bg-blue-500 hover:bg-blue-600',
		},
		{
			label: 'Delete',
			onClick: (user) => {
				console.log('Deleting ', user.id)
			},
			className: 'bg-red-500 hover:bg-red-600',
		},
	]

	const fetchUsers = () => {
		setIsLoading(true)
		const loadUsers = async () => {
			try {
				const users = await userService.getUsers()
				if (users) {
					setUsers(users.results || [])
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
				}
			} finally {
				setIsLoading(false)
			}
		}
		loadUsers()
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	const handleSearch = (term: string) => {
		setSearchTerm(term)
		console.log('Searching for:', term)
	}

	const filteredUsers = users.filter(
		(user) =>
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(user.first_name || '')
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			(user.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()),
	)

	return (
		<>
			<h1>Users</h1>
			{isLoading ? (
				<SpinnerSection spinnerMessage='Loading users...' />
			) : (
				<DataTable
					data={filteredUsers}
					columns={userColumns}
					rowKey='id'
					actions={userActions}
					searchTerm={searchTerm}
					onSearch={handleSearch}
				/>
			)}
		</>
	)
}
