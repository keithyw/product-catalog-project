'use client'

import Link from 'next/link'
import ProfileDropdown from '@/components/layout/ProfileDropdown'
import NavbarLink from '@/components/ui/NavbarLink'
import {
	BRANDS_URL,
	DASHBOARD_URL,
	LOGIN_URL,
	PRODUCTS_URL,
	USERS_URL,
} from '@/lib/constants'
import {
	BRAND_PERMISSIONS,
	USER_PERMISSIONS,
} from '@/lib/constants/permissions'
import useAuthStore from '@/stores/useAuthStore'

export default function Navbar() {
	const { isAuthenticated } = useAuthStore()

	return (
		<nav className='bg-gray-800 p-4 text-white shadow-md'>
			<div className='container mx-auto flex justify-between items-center'>
				<NavbarLink href='/'>Home</NavbarLink>
				<div className='flex items-center space-x-6'>
					{isAuthenticated ? (
						<>
							<NavbarLink href={DASHBOARD_URL}>Dashboard</NavbarLink>
							<NavbarLink
								href={BRANDS_URL}
								permission={`${BRAND_PERMISSIONS.VIEW}`}
							>
								Brands
							</NavbarLink>
							<NavbarLink href={PRODUCTS_URL}>Products</NavbarLink>
							<NavbarLink
								href={USERS_URL}
								permission={`${USER_PERMISSIONS.VIEW}`}
							>
								Users
							</NavbarLink>
							<ProfileDropdown />
						</>
					) : (
						<Link
							href={LOGIN_URL}
							className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
						>
							Login
						</Link>
					)}
				</div>
			</div>
		</nav>
	)
}
