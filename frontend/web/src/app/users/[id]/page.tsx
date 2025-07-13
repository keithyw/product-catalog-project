'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import moment from 'moment'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import PageTitle from '@/components/ui/PageTitle'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import SpinnerSection from '@/components/ui/SpinnerSection'
import {
	DATE_FORMAT_DISPLAY,
	FAILED_LOADING_USER_ERROR,
	USERS_URL,
} from '@/lib/constants'
import userService from '@/lib/services/user'
import { User } from '@/types/user'

const UserDetailsPage: React.FC = () => {
	const params = useParams()
	const router = useRouter()
	const userId = params.id
	const [user, setUser] = useState<User | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [details, setDetails] = useState<DetailSectionRow[]>([])

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (userId) {
			const fetchUser = async () => {
				try {
					const u = await userService.getUser(parseInt(userId as string))
					console.log(u)
					setUser(u)
					setDetails([
						{ label: 'Username', value: u.username },
						{ label: 'Email', value: u.email },
						{ label: 'First Name', value: u.first_name },
						{ label: 'Last Name', value: u.last_name },
						{ label: 'Is Staff', value: u.is_staff ? 'Yes' : 'No' },
						{ label: 'Is Active', value: u.is_active ? 'Yes' : 'No' },
						{
							label: 'Date Joined',
							value: moment(u.date_joined).format(DATE_FORMAT_DISPLAY),
						},
						{
							label: 'Last Login',
							value: u.last_login
								? moment(u.last_login).format(DATE_FORMAT_DISPLAY)
								: '',
						},
					])
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error(e.message)
						setError(FAILED_LOADING_USER_ERROR)
						router.push(USERS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchUser()
		}
	}, [userId, router])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading user details...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto'>
				<PageTitle>User Details</PageTitle>
				{user && <DetailSection rows={details} />}
			</div>
		</div>
	)
}

export default UserDetailsPage
