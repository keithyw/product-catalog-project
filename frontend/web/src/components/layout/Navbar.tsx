'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NavbarLink from '@/components/ui/NavbarLink'
import {
	DASHBOARD_URL,
	LOGIN_URL,
	PRODUCTS_URL,
	USERS_URL,
} from '@/lib/constants'
import useAuthStore from '@/stores/useAuthStore'

export default function Navbar() {
	const { isAuthenticated, setLogoutStatus } = useAuthStore()
	const router = useRouter()

	const handleLogout = () => {
		setLogoutStatus()
		router.push(LOGIN_URL)
	}

	return (
		<nav className='bg-gray-800 p-4 text-white shadow-md'>
			<div className='container mx-auto flex justify-between items-center'>
				<NavbarLink href='/'>Home</NavbarLink>
				<div className='flex items-center space-x-6'>
					{isAuthenticated ? (
						<>
							<NavbarLink href={DASHBOARD_URL}>Dashboard</NavbarLink>
							<NavbarLink href={PRODUCTS_URL}>Products</NavbarLink>
							<NavbarLink href={USERS_URL}>Users</NavbarLink>
							<button
								className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'
								onClick={handleLogout}
							>
								Logout
							</button>
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
