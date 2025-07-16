'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/FormInput'
import { GROUPS_URL } from '@/lib/constants'
import groupService from '@/lib/services/group'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { groupCreateSchema, GroupCreateFormData } from '@/schemas/groupSchema'
import { FormField } from '@/types/form'

const formFields: FormField<GroupCreateFormData>[] = [
	{
		name: 'name',
		label: 'Group Name',
		placeholder: 'Enter group name',
		required: true,
	},
]

export default function CreateGroupPage() {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<GroupCreateFormData>({
		resolver: zodResolver(groupCreateSchema),
		defaultValues: {
			name: '',
		},
	})

	const onSubmit = async (data: GroupCreateFormData) => {
		try {
			const res = await groupService.createGroup(data)
			console.log('res ', res)
			reset()
			toast.success(`Group ${res.name} created successfully!`)
			router.push(GROUPS_URL)
		} catch (e: unknown) {
			handleFormErrors<GroupCreateFormData>(
				e,
				setError,
				'Failed to create group. Please review your input.',
			)
		}
	}

	return (
		<>
			<CreateFormLayout
				title='Create Group'
				isSubmitting={isSubmitting}
				submitText='Create'
				submittingText='Creating...'
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
