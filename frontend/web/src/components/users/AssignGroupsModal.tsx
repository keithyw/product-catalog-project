'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DialogTitle } from '@headlessui/react'
import BaseModal from '@/components/ui/BaseModal'
import SpinnerSection from '@/components/ui/SpinnerSection'
import SubmitButton from '@/components/ui/SubmitButton'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import groupService from '@/lib/services/group'
import userService from '@/lib/services/user'
import { Group } from '@/types/group'
import { User } from '@/types/user'

interface AssignGroupProps {
	isOpen: boolean
	onClose: () => void
	user: User | null
	onGroupsAssigned: (updatedUser: User) => void
}

const AssignGroupsModal: React.FC<AssignGroupProps> = ({
	isOpen,
	onClose,
	user,
	onGroupsAssigned,
}) => {
	const [isLoading, setIsLoading] = useState(true)
	const [groups, setGroups] = useState<Group[]>([])
	const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (isOpen && user) {
			const fetchGroups = async () => {
				setIsLoading(true)
				try {
					const g = await groupService.getGroups()
					setGroups(g.results || [])
					const userGroups = await userService.getUserGroups(parseInt(user.id))
					setSelectedGroupIds(userGroups.map((g) => g.id))
				} catch (e: unknown) {
					console.error('Failed loading group info: ', e)
					toast.error('Failed to load group info')
					onClose()
				} finally {
					setIsLoading(false)
				}
			}
			fetchGroups()
		}
	}, [isOpen, onClose, user])

	const handleCheckboxChange = (groupId: number, isChecked: boolean) => {
		console.log(
			`Group ID: ${groupId}, New Checked State: ${isChecked}, Current selectedGroupIds: ${selectedGroupIds}`,
		)
		setSelectedGroupIds((prev) =>
			isChecked ? [...prev, groupId] : prev.filter((id) => id !== groupId),
		)
	}

	const handleSubmit = async () => {
		if (!user) return
		setIsSubmitting(true)
		try {
			const res = await userService.updateUserGroups(
				parseInt(user.id),
				selectedGroupIds,
			)
			onGroupsAssigned({ ...user, groups: res })
			toast.success('User groups updated successfully')
			onClose()
		} catch (e: unknown) {
			console.error('Failed to update user groups: ', e)
			toast.error('Failed to update user groups')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			{isLoading ? (
				<SpinnerSection spinnerMessage='Loading groups...' />
			) : (
				<>
					<DialogTitle
						as='h3'
						className='text-lg font-medium leading-6 text-gray-900'
					>
						Assign Groups
					</DialogTitle>
					<div className='py-4'>
						<div className='mb-4 max-h-60 overflow-y-auto border p-3 rounded-md'>
							{groups.length > 0 ? (
								groups.map((g) => (
									<div key={g.id} className='flex items-center mb-3'>
										<ToggleSwitch
											id={`group-toggle-${g.id}`}
											checked={selectedGroupIds.includes(g.id)}
											onChange={(isChecked) =>
												handleCheckboxChange(g.id, isChecked)
											}
											label={g.name}
											disabled={isSubmitting}
										/>
									</div>
								))
							) : (
								<p>No groups.</p>
							)}
						</div>
						<div className='flex justify-end gap-2 mt-4'>
							<SubmitButton onClick={handleSubmit} disabled={isSubmitting}>
								{isSubmitting ? 'Update...' : 'Update'}
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
		</BaseModal>
	)
}

export default AssignGroupsModal
