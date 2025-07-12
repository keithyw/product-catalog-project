'use client'

import React from 'react'
import axios, { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import InputErrorMessage from '@/components/ui/InputErrorMessage'
import TextInput from '@/components/ui/TextInput'
import SubmitButton from '@/components/ui/SubmitButton'
import {
	GENERIC_SERVER_ERROR,
	UNEXPECTED_SERVER_ERROR,
	USERS_URL,
} from '@/lib/constants'
import userService from '@/lib/services/user'
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
			if (axios.isAxiosError(e)) {
				const err: AxiosError = e
				if (err.response && err.response.data) {
					const backendErrors = err.response.data as Record<
						string,
						string[] | string
					>
					for (const k in backendErrors) {
						if (k in data) {
							setError(k as keyof UserCreateFormData, {
								type: 'server',
								message: Array.isArray(backendErrors[k])
									? backendErrors[k].join(', ')
									: (backendErrors[k] as string),
							})
						} else if (k === 'non_field_errors' || k === 'detail') {
							setError('root.serverError', {
								type: 'server',
								message: Array.isArray(backendErrors[k])
									? backendErrors[k].join(', ')
									: (backendErrors[k] as string),
							})
						}
					}
				} else {
					setError('root.serverError', {
						type: 'server',
						message: err.message || GENERIC_SERVER_ERROR,
					})
				}
			} else {
				setError('root.serverError', {
					type: 'server',
					message: UNEXPECTED_SERVER_ERROR,
				})
			}
		}
	}
	return (
		<div className='max-w-md mx-auto bg-white p-8 rounded-lg shadow-md'>
			{errors.root?.serverError && (
				<ServerErrorMessages
					errorMessages={errors.root.serverError.message as string}
				/>
			)}
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				{formFields.map((f, idx) => (
					<div key={idx}>
						<TextInput
							label={f.label}
							id={f.name}
							type={f.type}
							placeholder={f.placeholder}
							required={f.required}
							{...register(f.name)}
						/>
						<InputErrorMessage
							errorMessage={errors[f.name]?.message as string}
						/>
					</div>
				))}
				<SubmitButton>
					{isSubmitting ? 'Creating User...' : 'Create User'}
				</SubmitButton>
			</form>
		</div>
	)
}

export default UserCreateForm
