import React from 'react'

interface FloatingActionToolbarProps {
	children: React.ReactNode
	className?: string
}

const FloatingActionToolbar = ({
	children,
	className = '',
}: FloatingActionToolbarProps) => {
	return (
		<div className='fixed bottom-0 left-0 right-0 bg-gray-800 shadow-2xl z-40'>
			<div
				className={`max-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-center items-center ${className}`}
			>
				<div className='flex space-x-3 pr-2'>{children}</div>
			</div>
		</div>
	)
}

export default FloatingActionToolbar
