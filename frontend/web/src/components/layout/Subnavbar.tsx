'use client'

import React from 'react'
import Link from 'next/link'
import PermissionGuard from '@/components/auth/PermissionGuard'

export interface SubnavBarLink {
	href: string
	label: string
	permission?: string
}

interface SubnavbarProps {
	links: SubnavBarLink[]
}

const Subnavbar: React.FC<SubnavbarProps> = ({ links }) => {
	return (
		<nav className='flex items-center space-x-6'>
			{links.map((link, index) => (
				<PermissionGuard
					requiredPermission={link.permission ? link.permission : ''}
					key={index}
				>
					<Link
						href={`${link.href}`}
						className='text-blue-600 hover:text-blue-600 font-medium transition-colors'
					>
						{link.label}
					</Link>
				</PermissionGuard>
			))}
		</nav>
	)
}

export default Subnavbar
