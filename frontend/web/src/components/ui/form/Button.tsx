import React from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type ButtonActionType = 'edit' | 'delete' | 'view' | 'neutral' | 'submit'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	actionType: ButtonActionType
	children: React.ReactNode
	isLoading?: boolean
	spinnerSize?: 'sm' | 'md' | 'lg'
	className?: string
}

const Button: React.FC<ButtonProps> = ({
	actionType,
	children,
	isLoading = false,
	spinnerSize = 'sm',
	className = '',
	disabled,
	...props
}) => {
	let colorClasses = ''
	const baseStyles = `
    px-4
    py-2
    text-white
    font-bold
    rounded
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    focus:shadow-outline
    cursor-pointer
    transition-opacity
    duration-200
  `

	switch (actionType) {
		case 'edit':
			colorClasses = 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
			break
		case 'delete':
			colorClasses = 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
			break
		case 'view':
			colorClasses = 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500'
			break
		case 'neutral':
			colorClasses =
				'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
			return (
				<button
					className={`
            px-4
            py-2
            font-bold
            rounded
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:shadow-outline
            cursor-pointer
            transition-opacity
            duration-200
            ${colorClasses}
            ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
					disabled={disabled || isLoading}
					{...props}
				>
					{isLoading ? (
						<LoadingSpinner size={spinnerSize} message='' className='!p-0' />
					) : (
						children
					)}
				</button>
			)
		case 'submit':
			colorClasses =
				'border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
			break
		default:
			colorClasses = 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500'
	}

	return (
		<button
			className={`
        ${baseStyles}
        ${colorClasses}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<LoadingSpinner size={spinnerSize} message='' className='!p-0' />
			) : (
				children
			)}
		</button>
	)
}

export default Button
