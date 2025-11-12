'use client'

import React from 'react'
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import DashboardGrid from '@/components/layout/DashboardGrid'
import { PRICING_MODIFIERS_URL } from '@/lib/constants'
import { DashboardCardProps } from '@/types/card'

const PricingPage = () => {
	const cards: DashboardCardProps[] = [
		{
			title: 'Modifiers',
			description: 'Manage modifiers for your products',
			icon: <ArrowsUpDownIcon className='w-5 h-5 mr-2 text-blue-600' />,
			link: PRICING_MODIFIERS_URL,
		},
	]
	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='bg-white rounded-xl shadow-lg p-6'>
				<DashboardGrid cards={cards} />
			</div>
		</div>
	)
}

export default PricingPage
