'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import FormInput from '@/components/ui/FormInput'
import SubmitButton from '@/components/ui/SubmitButton'
import { USERS_URL } from '@/lib/constants'
import userService from '@/lib/services/user'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { userCreateSchema, UserCreateFormData } from '@/schemas/userSchema'

interface FormFieldConfig {
	name: keyof UserCreateFormData
	label: string
	type?: string
	required?: boolean
	placeholder?: string
}

const formFields: FormFieldConfig[] = [
	{
		name: 'username',
		label: 'Username',
		required: true,
		placeholder: 'Enter username',
	},
	{ name: 'email', label: 'Email', required: true, placeholder: 'Enter email' },
	{ name: 'first_name', label: 'First Name', placeholder: 'Enter first name' },
	{ name: 'last_name', label: 'Last Name', placeholder: 'Enter last name' },
	{
		name: 'password',
		label: 'Password',
		type: 'password',
		required: true,
		placeholder: 'Enter password',
	},
	{
		name: 'password_confirm',
		label: 'Confirm Password',
		type: 'password',
		required: true,
		placeholder: 'Confirm password',
	},
]

const UserCreateForm: React.FC = () => {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<UserCreateFormData>({
		resolver: zodResolver(userCreateSchema),
		defaultValues: {
			username: '',
			email: '',
			first_name: '',
			last_name: '',
			password: '',
			password_confirm: '',
		},
	})

	const onSubmit = async (data: UserCreateFormData) => {
		try {
			const res = await userService.createUser(data)
			console.log(res)
			router.push(USERS_URL)
		} catch (e: unknown) {
			handleFormErrors<UserCreateFormData>(e, setError)
		}
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
					{isSubmitting ? 'Creating User...' : 'Create User'}
				</SubmitButton>
			</form>
		</>
	)
}

export default UserCreateForm
