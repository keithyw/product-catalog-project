import React from 'react'

type ChipType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning'

interface ChipProps {
	chipType: ChipType
	className?: string
	children: React.ReactNode
}

const Chip: React.FC<ChipProps> = ({ chipType, className, children }) => {
	let chipClass = ''
	switch (chipType) {
		case 'primary':
			chipClass = 'bg-blue-100 text-blue-800'
			break
		case 'secondary':
			chipClass = 'bg-gray-100 text-gray-800'
			break
		case 'success':
			chipClass = 'bg-green-100 text-green-800'
			break
		case 'danger':
			chipClass = 'bg-red-100 text-red-800'
			break
		case 'warning':
			chipClass = 'bg-yellow-100 text-yellow-800'
			break
	}
	return (
		<span
			className={`flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${chipClass} ${className}`}
		>
			{children}
		</span>
	)
}

export default Chip
