'use client'

import React, { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import AssignGroupsModal from '@/components/users/AssignGroupsModal'
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
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import userService from '@/lib/services/user'
import { TableColumn, TableRowAction } from '@/types/table'
import { User } from '@/types/user'

const USER_COLUMNS: TableColumn<User>[] = [
	{
		header: 'ID',
		accessor: 'id',
		sortable: true,
	},
	{
		header: 'Username',
		accessor: 'username',
		sortable: true,
	},
	{
		header: 'Full Name',
		render: (user: User) => `${user.first_name || ''} ${user.last_name || ''}`,
		sortable: true,
		sortField: 'full_name',
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
		sortable: true,
		sortField: 'date_joined',
		render: (user: User) =>
			user.date_joined ? new Date(user.date_joined).toLocaleString() : '',
	},
	{
		header: 'Last Login',
		sortable: true,
		sortField: 'last_login',
		render: (user: User) =>
			user.last_login ? new Date(user.last_login).toLocaleString() : '',
	},
]

export default function UsersPage() {
	const router = useRouter()

	const {
		data: users,
		isLoading,
		searchTerm,
		totalCount,
		currentPage,
		pageSize,
		sortField,
		sortDirection,
		handleSearch,
		handlePageChange,
		handlePageSizeChange,
		handleSort,
		loadData,
	} = useDataTableController({
		initialSortField: 'username',
		defaultPageSize: DEFAULT_PAGE_SIZE,
		fetchData: userService.getUsers,
	})

	const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false)
	const [isAssignGroupsModalOpen, setIsAssignGroupsModalOpen] =
		React.useState(false)
	const [assignGroupUser, setAssignGroupUser] = React.useState<User | null>(
		null,
	)
	const [deleteUser, setDeleteUser] = React.useState<User | null>(null)
	const [isDeleting, setIsDeleting] = React.useState(false)

	const userColumns = useMemo(() => USER_COLUMNS, [])

	const openConfirmModal = (user: User) => {
		setDeleteUser(user)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteUser(null)
	}

	const openAssignGroupsModal = (user: User) => {
		setAssignGroupUser(user)
		setIsAssignGroupsModalOpen(true)
	}

	const closeAssignGroupsModal = () => {
		setIsAssignGroupsModalOpen(false)
		setAssignGroupUser(null)
	}

	const handleGroupsAssigned = (updatedUser: User) => {
		setAssignGroupUser(updatedUser)
		loadData()
	}

	const userActions: TableRowAction<User>[] = [
		{
			label: 'View Details',
			onClick: (user) => {
				router.push(`${USERS_URL}/${user.id}`)
			},
			actionType: 'view',
			className: VIEW_LINK_STYLE,
		},
		{
			label: 'Edit',
			onClick: (user) => {
				router.push(`${USERS_URL}/${user.id}/edit`)
			},
			actionType: 'edit',
			className: EDIT_LINK_STYLE,
		},
		{
			label: 'Assign Groups',
			onClick: (user) => {
				openAssignGroupsModal(user)
			},
			actionType: 'userGroup',
		},
		{
			label: 'Delete',
			onClick: openConfirmModal,
			actionType: 'delete',
			className: DELETE_LINK_STYLE,
		},
	]

	const handleConfirmDelete = async () => {
		if (deleteUser) {
			try {
				await userService.deleteUser(parseInt(deleteUser.id as string))
				toast.success(`User ${deleteUser.username} deleted successfully`)
				loadData()
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

	return (
		<>
			<h1>Users</h1>

			<CreateItemSection href={CREATE_USERS_URL}>
				Create New User
			</CreateItemSection>
			<DataTable
				data={users}
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
				onSort={handleSort}
				currentSortField={sortField}
				currentSortDirection={sortDirection}
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
			<AssignGroupsModal
				isOpen={isAssignGroupsModalOpen}
				onClose={closeAssignGroupsModal}
				user={assignGroupUser}
				onGroupsAssigned={handleGroupsAssigned}
			/>
		</>
	)
}
