import React from 'react'
import CrudLayout from '@/components/layout/CrudLayout'
import { SubnavBarLink } from '@/components/layout/Subnavbar'
import { BRANDS_URL } from '@/lib/constants'
import { BRAND_PERMISSIONS } from '@/lib/constants/permissions'

export default function BrandsLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const links: SubnavBarLink[] = [
		{
			href: `${BRANDS_URL}`,
			label: 'Brands',
			permission: BRAND_PERMISSIONS.VIEW,
		},
	]
	return (
		<CrudLayout title='Brand Management' links={links}>
			{children}
		</CrudLayout>
	)
}
