'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '@/components/ui/form/FormInput'
import SpinnerSection from '@/components/ui/SpinnerSection'
import SubmitButton from '@/components/ui/form/SubmitButton'
import { FAILED_LOADING_USER_ERROR } from '@/lib/constants'
import {
	userProfileUpdateSchema,
	UserProfileUpdateFormData,
} from '@/schemas/userSchema'
import userService from '@/lib/services/user'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { FormField } from '@/types/form'
import { User } from '@/types/user'

const formFields: FormField<UserProfileUpdateFormData>[] = [
	{
		name: 'email',
		label: 'Email',
		placeholder: 'Enter email',
		readOnly: true,
	},
	{
		name: 'first_name',
		label: 'First Name',
		placeholder: 'Enter first name',
	},
	{
		name: 'last_name',
		label: 'Last Name',
		placeholder: 'Enter last name',
	},
]

export default function ProfileForm() {
	const [isLoading, setIsLoading] = useState(true)
	const [user, setUser] = useState<User | null>(null)

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<UserProfileUpdateFormData>({
		resolver: zodResolver(userProfileUpdateSchema),
		defaultValues: {
			email: '',
			first_name: '',
			last_name: '',
		},
	})

	useEffect(() => {
		const fetchUser = async () => {
			setIsLoading(true)
			try {
				const u = await userService.getCurrentUser()
				setUser(u)
				reset({
					email: u.email,
					first_name: u.first_name,
					last_name: u.last_name,
				})
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					setError('root.serverError', {
						type: 'server',
						message: FAILED_LOADING_USER_ERROR,
					})
					toast.error(FAILED_LOADING_USER_ERROR)
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchUser()
	}, [reset, setError])

	const onSubmit = async (data: UserProfileUpdateFormData) => {
		try {
			const res = await userService.updateCurrentUser(data)
			console.log(res)
			toast.success(`Profile updated successfully!`)
		} catch (e: unknown) {
			handleFormErrors<UserProfileUpdateFormData>(
				e,
				setError,
				'Failed to update profile. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading profile...' />
	}

	if (!user) {
		return <div className='text-center py-8'>User not found</div>
	}

	return (
		<div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
			<h2 className='text-2xl font-bold mb-6 text-gray-800'>Edit Profile</h2>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				{formFields.map((f, idx) => (
					<FormInput
						key={idx}
						field={f}
						register={register}
						errorMessage={errors[f.name]?.message as string}
					/>
				))}
				<SubmitButton disabled={isSubmitting}>
					{isSubmitting ? 'Updating...' : 'Update'}
				</SubmitButton>
			</form>
		</div>
	)
}
