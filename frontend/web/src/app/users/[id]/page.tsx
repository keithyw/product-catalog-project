'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import moment from 'moment'
import PermissionGuard from '@/components/auth/PermissionGuard'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import DataTable from '@/components/ui/DataTable'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import PageTitle from '@/components/ui/PageTitle'
import SpinnerSection from '@/components/ui/SpinnerSection'
import AssignGroupsModal from '@/components/users/AssignGroupsModal'
import {
	DATE_FORMAT_DISPLAY,
	FAILED_LOADING_USER_ERROR,
	USERS_URL,
} from '@/lib/constants'
import { USER_PERMISSIONS } from '@/lib/constants/permissions'
import userService from '@/lib/services/user'
import { Group } from '@/types/group'
import { TableColumn } from '@/types/table'
import { User } from '@/types/user'

const groupColumns: TableColumn<Group>[] = [
	{
		header: 'ID',
		accessor: 'id',
	},
	{
		header: 'Name',
		accessor: 'name',
	},
]

const UserDetailsPage: React.FC = () => {
	const params = useParams()
	const router = useRouter()
	const userId = params.id
	const [user, setUser] = useState<User | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [details, setDetails] = useState<DetailSectionRow[]>([])

	const [isLoading, setIsLoading] = useState(true)
	const [showConfirmationModal, setShowConfirmationModal] = useState(false)
	const [showAssignGroupsModal, setShowAssignGroupsModal] = useState(false)

	const handleCloseDeleteModal = () => {
		setShowConfirmationModal(false)
	}

	const handleCloseAssignGroupsModal = () => {
		setShowAssignGroupsModal(false)
	}

	const handleShowAssignGroupsModal = () => {
		setShowAssignGroupsModal(true)
	}

	const handleDeleteClick = () => {
		setShowConfirmationModal(true)
	}

	const handleEditClick = () => {
		if (user) {
			router.push(`${USERS_URL}/${user.id}/edit`)
		}
	}

	const handleDeleteConfirm = async () => {
		if (user) {
			try {
				await userService.deleteUser(parseInt(user.id as string))
				toast.success(`User ${user.username} deleted successfully`)
				router.push(USERS_URL)
			} catch (e: unknown) {
				console.error('Failed deleting user: ', e)
				toast.error(`Failed to delete user ${user.username}`)
				handleCloseDeleteModal()
			}
		}
	}

	const handleGroupsAssigned = (updatedUser: User) => {
		setUser(updatedUser)
	}

	useEffect(() => {
		if (userId) {
			const fetchUser = async () => {
				try {
					const u = await userService.getUser(parseInt(userId as string))
					setUser(u)
					setDetails([
						{ label: 'Username', value: u.username },
						{ label: 'Email', value: u.email },
						{ label: 'First Name', value: u.first_name },
						{ label: 'Last Name', value: u.last_name },
						{ label: 'Is Staff', value: u.is_staff ? 'Yes' : 'No' },
						{ label: 'Is Active', value: u.is_active ? 'Yes' : 'No' },
						{
							label: 'Date Joined',
							value: moment(u.date_joined).format(DATE_FORMAT_DISPLAY),
						},
						{
							label: 'Last Login',
							value: u.last_login
								? moment(u.last_login).format(DATE_FORMAT_DISPLAY)
								: '',
						},
					])
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error(e.message)
						setError(FAILED_LOADING_USER_ERROR)
						router.push(USERS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchUser()
		}
	}, [userId, router])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading user details...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='bg-white p-8 shadow-md max-w-2xl mx-auto'>
				<PageTitle>User Details</PageTitle>
				{user && <DetailSection rows={details} />}
				<div className='mt-8 pt-6 border-t border-gray-200'>
					<h3 className='text-xl font-bold mb-4 text-gray-800'>
						Assigned Groups
					</h3>
					{user && user.groups && user.groups.length > 0 ? (
						<DataTable columns={groupColumns} data={user.groups} rowKey='id' />
					) : (
						<p className='text-gray-500 text-sm italic'>No Groups Assigned</p>
					)}
				</div>
				<PermissionGuard requiredPermission={USER_PERMISSIONS.CHANGE}>
					<div className='mt-6 flex justify-end space-x-3'>
						<Button actionType='edit' onClick={handleEditClick}>
							Edit User
						</Button>
						<Button actionType='delete' onClick={handleDeleteClick}>
							Delete User
						</Button>
						<Button actionType='edit' onClick={handleShowAssignGroupsModal}>
							Assign Groups
						</Button>
					</div>
				</PermissionGuard>
			</div>
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteConfirm}
				title='Confirm Delete User'
				message={`Are you sure you want to delete ${user?.username}`}
			/>
			<AssignGroupsModal
				isOpen={showAssignGroupsModal}
				onClose={handleCloseAssignGroupsModal}
				onGroupsAssigned={handleGroupsAssigned}
				user={user}
			/>
		</div>
	)
}

export default UserDetailsPage
