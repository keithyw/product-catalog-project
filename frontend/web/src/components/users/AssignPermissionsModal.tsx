'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DialogTitle } from '@headlessui/react'
import BaseModel from '@/components/ui/BaseModal'
import SpinnerSection from '@/components/ui/SpinnerSection'
import SubmitButton from '@/components/ui/form/SubmitButton'
import ToggleSwitch from '@/components/ui/form/ToggleSwitch'
import groupService from '@/lib/services/group'
import permissionService from '@/lib/services/permission'
import { Group } from '@/types/group'
import { Permission } from '@/types/permission'

interface AssignPermissionsModalProps {
	isOpen: boolean
	onClose: () => void
	group: Group | null
	onPermissionsAssigned: (updatedGroup: Group) => void
}

const AssignPermissionsModal: React.FC<AssignPermissionsModalProps> = ({
	isOpen,
	onClose,
	group,
	onPermissionsAssigned,
}) => {
	const [isLoading, setIsLoading] = useState(true)
	const [permissions, setPermissions] = useState<Permission[]>([])
	const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
		[],
	)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (isOpen && group) {
			const fetchPermissions = async () => {
				setIsLoading(true)
				try {
					const perms = await permissionService.getPermissions(1, 500)
					setPermissions(perms.results || [])
					const groupPermissions = await groupService.getGroupPermissions(
						group.id,
					)
					setSelectedPermissionIds(groupPermissions.map((p) => p.id))
				} catch (e: unknown) {
					console.error('Failed loading permissions: ', e)
					toast.error('Failed to load permissions')
					onClose()
				} finally {
					setIsLoading(false)
				}
			}
			fetchPermissions()
		}
	}, [group, isOpen, onClose])

	const handleCheckboxChange = (permissionId: number, isChecked: boolean) => {
		setSelectedPermissionIds((prev) =>
			isChecked
				? [...prev, permissionId]
				: prev.filter((id) => id !== permissionId),
		)
	}

	const handleSubmit = async () => {
		if (!group) return
		setIsSubmitting(true)
		try {
			const res = await groupService.updateGroupPermissions(
				group.id,
				selectedPermissionIds,
			)
			onPermissionsAssigned({ ...group, permissions: res })
			toast.success('Group permissions updated successfully')
			onClose()
		} catch (e: unknown) {
			console.error('Failed updating group permissions: ', e)
			toast.error('Failed to update group permissions')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<BaseModel isOpen={isOpen} onClose={onClose}>
			{isLoading ? (
				<SpinnerSection spinnerMessage='Loading permissions...' />
			) : (
				<>
					<DialogTitle
						as='h3'
						className='text-lg font-medium leading-6 text-gray-900'
					>
						Assign Permissions
					</DialogTitle>
					<div className='py-4'>
						<div className='mb-4 border p-3 rounded-md'>
							{permissions.length > 0 ? (
								permissions.map((p) => (
									<div key={p.id} className='flex items-center mb-3'>
										<ToggleSwitch
											id={`permission-toggle-${p.id}`}
											checked={selectedPermissionIds.includes(p.id)}
											onChange={(isChecked) =>
												handleCheckboxChange(p.id, isChecked)
											}
											label={p.name}
											disabled={isSubmitting}
										/>
									</div>
								))
							) : (
								<p>No permissions.</p>
							)}
						</div>
						<div className='flex justify-end gap-2 mt-4'>
							<SubmitButton onClick={handleSubmit} disabled={isSubmitting}>
								{isSubmitting ? 'Updating...' : 'Update'}
							</SubmitButton>
							<button
								className='
									px-4
									py-2
									rounded
									focus:outline-none
									focus:ring-2
									focus:ring-offset-2
									focus:shadow-outline
									w-full
									bg-red-500
									text-white
									font-bold
									hover:bg-red-600'
								onClick={onClose}
								disabled={isSubmitting}
							>
								Cancel
							</button>
						</div>
					</div>
				</>
			)}
		</BaseModel>
	)
}

export default AssignPermissionsModal
