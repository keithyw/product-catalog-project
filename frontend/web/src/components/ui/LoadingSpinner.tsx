import React from 'react'

interface LoadingSpinnerProps {
	message?: string
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	message = 'Loading…',
	size = 'md',
	className = '',
}) => {
	const spinnerSizeClasses = {
		sm: 'w-5 h-5 border-2',
		md: 'w-8 h-8 border-3',
		lg: 'w-12 h-12 border-4',
	}

	const currentSizeClass = spinnerSizeClasses[size]

	return (
		<div
			className={`flex flex-col items-center justify-center p-4 ${className}`}
		>
			<div
				className={`${currentSizeClass} border-gray-300 border-t-blue-500 rounded-full animate-spin`}
				role='status'
				aria-label='loading'
			>
				<span className='sr-only'>Loading…</span>
			</div>
			{message && (
				<p className='mt-3 text-gray-600 dark:text-gray-400'>{message}</p>
			)}
		</div>
	)
}

export default LoadingSpinner
