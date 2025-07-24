'use client'

import axios, { AxiosError } from 'axios'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FieldValues } from 'react-hook-form'
import InputErrorMessage from '@/components/ui/form/InputErrorMessage'
import CardContainer from '@/components/ui/CardContainer'
import PageTitle from '@/components/ui/PageTitle'
import TextInput from '@/components/ui/form/TextInput'
import { DASHBOARD_URL } from '@/lib/constants'
import authService from '@/lib/services/auth'
import userService from '@/lib/services/user'
import useAuthStore from '@/stores/useAuthStore'
import { AuthResponse } from '@/types/auth'

export default function LoginPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const setLoginStatus = useAuthStore((state) => state.setLoginStatus)
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
		clearErrors,
	} = useForm<FieldValues>({
		defaultValues: {
			username: '',
			password: '',
		},
	})

	const onSubmit = async (data: FieldValues) => {
		clearErrors()
		setIsLoading(true)
		try {
			const res: AuthResponse = await authService.login(
				data.username,
				data.password,
			)
			setLoginStatus(res)
			const userDetails = await userService.getCurrentUser()
			useAuthStore.getState().setUser(userDetails)
			useAuthStore.getState().setUserGroups(userDetails.groups)
			const userPerms = userDetails.groups.flatMap(
				(group) => group.permissions || [],
			)
			useAuthStore.getState().setUserPermissions(userPerms)
			router.push(process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || DASHBOARD_URL)
		} catch (e: unknown) {
			if (axios.isAxiosError(e)) {
				const axiosError = e as AxiosError<{ detail?: string }>
				if (axiosError.response && axiosError.response.status === 401) {
					// Handle unauthorized error
					setError('serverError', {
						message: axiosError.response.data.detail || 'Login failed',
					})
				}
			} else if (e instanceof Error) {
				// Handle other errors
				setError('serverError', { message: e.message })
				console.error(e.message)
			} else {
				setError('serverError', { message: 'An unknown error occurred' })
			}
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<CardContainer className='max-w-md w-full'>
				<PageTitle>Login</PageTitle>
				<form onSubmit={handleSubmit(onSubmit)}>
					<TextInput
						id='username'
						label='Username'
						placeholder='Enter your username'
						{...register('username', { required: 'Username is required' })}
						className={errors.username ? 'border-red-500' : ''}
					/>
					{errors.username && (
						<InputErrorMessage
							errorMessage={errors.username.message as string}
						/>
					)}

					<TextInput
						id='password'
						label='Password'
						type='password'
						placeholder='Enter your password'
						{...register('password', { required: 'Password is required' })}
						className={errors.password ? 'border-red-500' : ''}
					/>
					{errors.password && (
						<InputErrorMessage
							errorMessage={errors.password.message as string}
						/>
					)}

					{errors.serverError && (
						<InputErrorMessage
							errorMessage={errors.serverError.message as string}
						/>
					)}
					<div className='flex items-center justify-between'>
						<button
							type='submit'
							className={`
								bg-blue-600
								hover:bg-blue-700
								text-white
								font-bold
								py-2
								px-4
								rounded 
								focus:outline-none
								focus:shadow-outline
								w-full
								${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
							`}
						>
							{isLoading ? 'Logging in…' : 'Login'}
						</button>
					</div>
				</form>
			</CardContainer>
		</div>
	)
}
