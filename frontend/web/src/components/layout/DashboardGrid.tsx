import React from 'react'
import DashboardCard from '@/components/ui/DashboardCard'
import { DashboardCardProps } from '@/types/card'

const DashboardGrid = ({ cards }: { cards: DashboardCardProps[] }) => {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
			{cards.map((card, idx) => (
				<DashboardCard key={idx} {...card} />
			))}
		</div>
	)
}

export default DashboardGrid
