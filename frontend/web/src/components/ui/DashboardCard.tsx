import React from 'react'
import Link from 'next/link'
import { DashboardCardProps } from '@/types/card'

const DashboardCard = ({
	title,
	description,
	icon,
	link = '#',
}: DashboardCardProps) => {
	return (
		<Link
			className='block p-4 bg-white text-gray-600 shadow-xl rounded-lg transition-transform transform hover:scale-[1.02] duration-200'
			href={link}
		>
			<h3 className='text-lg font-bold mb-1 flex items-center w-full'>
				{icon}
				{title}
			</h3>
			<p className='text-sm text-gray-400 p-6'>{description}</p>
		</Link>
	)
}

export default DashboardCard
