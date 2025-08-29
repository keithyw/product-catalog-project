import React from 'react'
import CrudLayout from '@/components/layout/CrudLayout'
import { SubnavBarLink } from '@/components/layout/Subnavbar'
import { ASSETS_URL } from '@/lib/constants'

const AssetsLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	const links: SubnavBarLink[] = [
		{
			href: `${ASSETS_URL}`,
			label: 'Assets',
		},
	]
	return (
		<CrudLayout title='Asset Management' links={links}>
			{children}
		</CrudLayout>
	)
}

export default AssetsLayout
