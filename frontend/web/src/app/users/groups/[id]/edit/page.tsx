'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/FormInput'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { FAILED_LOADING_GROUP_ERROR, GROUPS_URL } from '@/lib/constants'
import groupService from '@/lib/services/group'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { groupCreateSchema, GroupCreateFormData } from '@/schemas/groupSchema'
import { FormField } from '@/types/form'
import { Group } from '@/types/group'

const formFields: FormField<GroupCreateFormData>[] = [
	{
		name: 'name',
		label: 'Group Name',
		placeholder: 'Enter group name',
		required: true,
	},
]

export default function EditGroupPage() {
	const [isLoading, setIsLoading] = useState(true)
	const [group, setGroup] = useState<Group | null>(null)
	const params = useParams()
	const router = useRouter()
	const groupId = params.id

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<GroupCreateFormData>({
		resolver: zodResolver(groupCreateSchema),
		defaultValues: {
			name: '',
		},
	})

	useEffect(() => {
		if (groupId) {
			const fetchGroup = async () => {
				setIsLoading(true)
				try {
					const g = await groupService.getGroup(parseInt(groupId as string))
					setGroup(g)
					reset({
						name: g.name,
					})
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error(e.message)
						setError('root.serverError', {
							type: 'server',
							message: FAILED_LOADING_GROUP_ERROR,
						})
						toast.error(FAILED_LOADING_GROUP_ERROR)
						router.push(GROUPS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchGroup()
		}
	}, [groupId, reset, router, setError])

	const onSubmit = async (data: GroupCreateFormData) => {
		try {
			const res = await groupService.updateGroup(
				parseInt(groupId as string),
				data,
			)
			console.log(res)
			toast.success(`Group ${res.name} updated successfully!`)
			router.push(GROUPS_URL)
		} catch (e: unknown) {
			handleFormErrors<GroupCreateFormData>(
				e,
				setError,
				'Failed to edit group. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading group...' />
	}

	if (!group) {
		return <div className='text-center py-8'>Group not found</div>
	}

	return (
		<>
			<CreateFormLayout
				title='Edit Group'
				isSubmitting={isSubmitting}
				submitText='Edit'
				submittingText='Editing...'
				handleSubmit={handleSubmit(onSubmit)}
			>
				{formFields.map((f, idx) => (
					<FormInput
						key={idx}
						field={f}
						register={register}
						errorMessage={errors[f.name]?.message as string}
					/>
				))}
			</CreateFormLayout>
		</>
	)
}
