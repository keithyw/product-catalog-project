'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import CreateItemSection from '@/components/layout/CreateItemSection'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import DataTable from '@/components/ui/DataTable'
import {
	DEFAULT_PAGE_SIZE,
	CREATE_USERS_URL,
	USERS_URL,
	DELETE_LINK_STYLE,
	EDIT_LINK_STYLE,
	VIEW_LINK_STYLE,
} from '@/lib/constants'
import userService from '@/lib/services/user'
import useUserStore from '@/stores/useUserStore'
import { TableColumn, TableRowAction } from '@/types/table'
import { User } from '@/types/user'

const USER_COLUMNS: TableColumn<User>[] = [
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
		render: (user: User) => `${user.first_name || ''} ${user.last_name || ''}`,
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

export default function UsersPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = React.useState(true)
	const [searchTerm, setSearchTerm] = React.useState('')
	const setUsers = useUserStore((state) => state.setUsers)
	const users = useUserStore((state) => state.users)

	const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false)
	const [deleteUser, setDeleteUser] = React.useState<User | null>(null)
	const [isDeleting, setIsDeleting] = React.useState(false)
	const userColumns = useMemo(() => USER_COLUMNS, [])

	const [currentPage, setCurrentPage] = React.useState(1)
	const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE)
	const [totalCount, setTotalCount] = React.useState(0)

	const openConfirmModal = (user: User) => {
		setDeleteUser(user)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteUser(null)
	}

	const userActions: TableRowAction<User>[] = [
		{
			label: 'View Details',
			onClick: (user) => {
				router.push(`${USERS_URL}/${user.id}`)
			},
			className: VIEW_LINK_STYLE,
		},
		{
			label: 'Edit',
			onClick: (user) => {
				router.push(`${USERS_URL}/${user.id}/edit`)
			},
			className: EDIT_LINK_STYLE,
		},
		{
			label: 'Delete',
			onClick: openConfirmModal,
			className: DELETE_LINK_STYLE,
		},
	]

	const fetchUsers = useCallback(() => {
		setIsLoading(true)
		const loadUsers = async () => {
			try {
				const users = await userService.getUsers(currentPage, pageSize)
				if (users) {
					setUsers(users.results || [])
					setTotalCount(users.count)
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
	}, [currentPage, pageSize, setUsers])

	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])

	const handleConfirmDelete = async () => {
		if (deleteUser) {
			try {
				await userService.deleteUser(parseInt(deleteUser.id as string))
				toast.success(`User ${deleteUser.username} deleted successfully`)
				fetchUsers()
				closeConfirmModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(
						`Failed to delete user ${deleteUser.username}: {e.message}`,
					)
					closeConfirmModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const handleSearch = (term: string) => {
		setSearchTerm(term)
		console.log('Searching for:', term)
	}

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page)
	}, [])

	const handlePageSizeChange = useCallback(
		(size: number) => {
			setPageSize(size)
			void handlePageChange(1)
		},
		[handlePageChange],
	)

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

			<CreateItemSection href={CREATE_USERS_URL}>
				Create New User
			</CreateItemSection>
			<DataTable
				data={filteredUsers}
				columns={userColumns}
				rowKey='id'
				actions={userActions}
				searchTerm={searchTerm}
				onSearch={handleSearch}
				currentPage={currentPage}
				pageSize={pageSize}
				totalCount={totalCount}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
				isLoadingRows={isLoading}
			/>
			<ConfirmationModal
				isOpen={isConfirmModalOpen}
				onClose={closeConfirmModal}
				onConfirm={handleConfirmDelete}
				title='Confirm Delete User'
				message={`Are you sure you want to delete ${deleteUser?.username}`}
				confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'}
				confirmButtonClass={
					isDeleting
						? 'bg-red-400 cursor-not-allowed'
						: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
				}
				cancelButtonClass={
					isDeleting
						? 'bg-gray-300 text-gray-500 cursor-not-allowed'
						: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500'
				}
			/>
		</>
	)
}
