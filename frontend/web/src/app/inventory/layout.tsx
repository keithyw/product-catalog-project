import React from 'react'
import CrudLayout from '@/components/layout/CrudLayout'
import { SubnavBarLink } from '@/components/layout/Subnavbar'
import { INVENTORY_URL } from '@/lib/constants'

const InventoryLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	const links: SubnavBarLink[] = [
		{
			href: `${INVENTORY_URL}`,
			label: 'Inventory',
		},
	]
	return (
		<CrudLayout title='Inventory Management Dashboard' links={links}>
			{children}
		</CrudLayout>
	)
}

export default InventoryLayout