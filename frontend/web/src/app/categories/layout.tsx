import React from 'react'
import CrudLayout from '@/components/layout/CrudLayout'
import { SubnavBarLink } from '@/components/layout/Subnavbar'
import { CATEGORIES_URL } from '@/lib/constants'
import { CATEGORY_PERMISSIONS } from '@/lib/constants/permissions'

export default function CategoriesLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const links: SubnavBarLink[] = [
		{
			href: `${CATEGORIES_URL}`,
			label: 'Categories',
			permission: CATEGORY_PERMISSIONS.VIEW,
		},
	]

	return (
		<CrudLayout title='Category Management' links={links}>
			{children}
		</CrudLayout>
	)
}
