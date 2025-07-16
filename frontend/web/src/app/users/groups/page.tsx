'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import CreateItemSection from '@/components/layout/CreateItemSection'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import DataTable from '@/components/ui/DataTable'
import SpinnerSection from '@/components/ui/SpinnerSection'
import {
	CREATE_GROUPS_URL,
	GROUPS_URL,
	DELETE_LINK_STYLE,
	EDIT_LINK_STYLE,
} from '@/lib/constants'
import groupService from '@/lib/services/group'
import { Group } from '@/types/group'
import { TableColumn, TableRowAction } from '@/types/table'

export default function GroupListPage() {
	const [isLoading, setIsLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [groups, setGroups] = useState<Group[]>([])
	const router = useRouter()

	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [deleteGroup, setDeleteGroup] = useState<Group | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const openConfirmModal = (group: Group) => {
		setDeleteGroup(group)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteGroup(null)
	}

	const groupColumns: TableColumn<Group>[] = [
		{
			header: 'ID',
			accessor: 'id',
		},
		{
			header: 'Group Name',
			accessor: 'name',
		},
	]

	const groupActions: TableRowAction<Group>[] = [
		{
			label: 'Edit',
			onClick: (group) => {
				router.push(`${GROUPS_URL}/${group.id}/edit`)
			},
			className: EDIT_LINK_STYLE,
		},
		{
			label: 'Delete',
			onClick: openConfirmModal,
			className: DELETE_LINK_STYLE,
		},
	]

	const fetchGroups = () => {
		setIsLoading(true)
		const loadGroups = async () => {
			try {
				const groups = await groupService.getGroups()
				if (groups) {
					setGroups(groups.results || [])
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to load groups: ${e.message}`)
				}
			} finally {
				setIsLoading(false)
			}
		}
		loadGroups()
	}

	useEffect(() => {
		fetchGroups()
	}, [])

	const handleConfirmDelete = async () => {
		if (deleteGroup) {
			try {
				await groupService.deleteGroup(deleteGroup.id)
				toast.success(`Group ${deleteGroup.name} deleted successfully`)
				fetchGroups()
				closeConfirmModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to delete group ${deleteGroup.name}: {e.message}`)
					closeConfirmModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const handleSearch = (term: string) => {
		setSearchTerm(term)
	}

	const filteredGroups = groups.filter((group) =>
		group.name.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	return (
		<>
			<h1>Group List Page</h1>
			{isLoading ? (
				<SpinnerSection spinnerMessage='Loading groups...' />
			) : (
				<>
					<CreateItemSection href={CREATE_GROUPS_URL}>
						Create New Group
					</CreateItemSection>
					<DataTable
						data={filteredGroups}
						columns={groupColumns}
						rowKey='id'
						actions={groupActions}
						searchTerm={searchTerm}
						onSearch={handleSearch}
					/>
				</>
			)}
			<ConfirmationModal
				isOpen={isConfirmModalOpen}
				onClose={closeConfirmModal}
				onConfirm={handleConfirmDelete}
				title='Confirm Delete Group'
				message={`Are you sure you want to delete ${deleteGroup?.name}`}
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
