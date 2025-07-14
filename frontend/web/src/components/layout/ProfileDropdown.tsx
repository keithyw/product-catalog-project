'use client'

import { Fragment } from 'react'
import {
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	Transition,
} from '@headlessui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
	ArrowLeftStartOnRectangleIcon,
	UserCircleIcon,
	ChevronDownIcon,
	Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { LOGIN_URL, PROFILE_URL } from '@/lib/constants'
import useAuthStore from '@/stores/useAuthStore'

export default function ProfileDropdown() {
	const router = useRouter()
	const { setLogoutStatus } = useAuthStore()

	const handleLogout = () => {
		setLogoutStatus()
		router.push(LOGIN_URL)
	}

	return (
		<Menu as='div' className='relative inline-block text-left z-10'>
			<div>
				<MenuButton className='inline-flex justify-center items-center gap-x-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200'>
					<UserCircleIcon className='-ml-0.5 h-5 w-5' aria-hidden='true' />
					Profile
					<ChevronDownIcon
						className='-mr-1 h-5 w-5 text-gray-200'
						aria-hidden='true'
					/>
				</MenuButton>
			</div>
			<Transition
				as={Fragment}
				enter='transition ease-out duration-100'
				enterFrom='transform opacity-0 scale-95'
				enterTo='transform opacity-100 scale-100'
				leave='transition ease-in duration-75'
				leaveFrom='transform opacity-100 scale-100'
				leaveTo='transform opacity-0 scale-95'
			>
				<MenuItems className='absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
					<div className='py-1'>
						<MenuItem>
							<Link
								href={PROFILE_URL}
								className='group flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white data-[active]:bg-gray-600 data-[active]:text-white'
							>
								<Cog6ToothIcon
									className='mr-3 h-5 w-5 text-gray-300 group-hover:text-white group-data-[active]:text-white'
									aria-hidden='true'
								/>
								My Profile
							</Link>
						</MenuItem>
						<div className='border-t border-gray-600 my-1' />
						<MenuItem>
							<button
								onClick={handleLogout}
								className='group flex items-center w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-gray-600 hover:text-white data-[active]:bg-gray-600 data-[active]:text-white'
							>
								<ArrowLeftStartOnRectangleIcon
									className='mr-3 h-5 w-5 text-red-300 group-hover:text-white group-data-[active]:text-white'
									aria-hidden='true'
								/>
								Logout
							</button>
						</MenuItem>
					</div>
				</MenuItems>
			</Transition>
		</Menu>
	)
}
