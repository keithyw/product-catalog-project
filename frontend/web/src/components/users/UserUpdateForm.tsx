'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import CancelSubmitButton from '@/components/ui/CancelSubmitButton'
import FormInput from '@/components/ui/FormInput'
import SpinnerSection from '@/components//ui/SpinnerSection'
import SubmitButton from '@/components/ui/SubmitButton'
import { FAILED_LOADING_USER_ERROR, USERS_URL } from '@/lib/constants'
import userService from '@/lib/services/user'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { userUpdateSchema, UserUpdateFormData } from '@/schemas/userSchema'
import { User } from '@/types/user'

interface FormFieldConfig {
	name: keyof UserUpdateFormData
	label: string
	type?: string
	required?: boolean
	placeholder?: string
	readOnly?: boolean
}

const formFields: FormFieldConfig[] = [
	{
		name: 'username',
		label: 'Username',
		placeholder: 'Enter username',
		readOnly: true,
	},
	{
		name: 'email',
		label: 'Email',
		placeholder: 'Enter email',
		readOnly: true,
	},
	{ name: 'first_name', label: 'First Name', placeholder: 'Enter first name' },
	{ name: 'last_name', label: 'Last Name', placeholder: 'Enter last name' },
	{ name: 'is_active', label: 'Is Active', type: 'checkbox' },
	{ name: 'is_staff', label: 'Is Staff', type: 'checkbox' },
]

const UserUpdateForm: React.FC = () => {
	const params = useParams()
	const router = useRouter()
	const userId = params.id

	const [isLoading, setIsLoading] = useState(true)
	const [user, setUser] = useState<User | null>(null)

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<UserUpdateFormData>({
		resolver: zodResolver(userUpdateSchema),
	})

	useEffect(() => {
		if (userId) {
			const fetchUser = async () => {
				try {
					const u = await userService.getUser(parseInt(userId as string))
					setUser(u)
					reset({
						username: u.username,
						email: u.email,
						first_name: u.first_name,
						last_name: u.last_name,
						is_active: u.is_active,
						is_staff: u.is_staff,
					})
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error(e.message)
						setError('root.serverError', {
							type: 'server',
							message: FAILED_LOADING_USER_ERROR,
						})
						router.push(USERS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchUser()
		}
	}, [userId, reset, router, setError])

	const onSubmit = async (data: UserUpdateFormData) => {
		try {
			const res = await userService.updateUser(parseInt(userId as string), data)
			console.log(res)
			toast.success(`User ${res.username} updated successfully!`)
			router.push(`${USERS_URL}/${userId}`)
		} catch (e: unknown) {
			handleFormErrors<UserUpdateFormData>(
				e,
				setError,
				'Failed to update user. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading user...' />
	}

	if (!user) {
		return <div className='text-center py-8'>User not found</div>
	}

	return (
		<>
			{errors.root?.serverError && (
				<ServerErrorMessages
					errorMessages={errors.root.serverError.message as string}
				/>
			)}
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
					{isSubmitting ? 'Updating User...' : 'Update User'}
				</SubmitButton>
				<CancelSubmitButton cancelUrl={`${USERS_URL}/${userId}`} />
			</form>
		</>
	)
}

export default UserUpdateForm
