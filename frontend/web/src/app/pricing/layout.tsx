import React from 'react'
import CrudLayout from '@/components/layout/CrudLayout'
import { SubnavBarLink } from '@/components/layout/Subnavbar'
import { PRICING_MODIFIERS_URL } from '@/lib/constants'

const PricingLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	const links: SubnavBarLink[] = [
		{
			href: `${PRICING_MODIFIERS_URL}`,
			label: 'Modifiers',
		},
	]
	return (
		<CrudLayout title='Pricing Management Dashboard' links={links}>
			{children}
		</CrudLayout>
	)
}

export default PricingLayout
