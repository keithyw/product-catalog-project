import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	actionType: 'edit' | 'delete' | 'view'
	children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
	actionType,
	children,
	className = '',
	...props
}) => {
	let color = ''
	switch (actionType) {
		case 'edit':
			color = 'bg-blue-500 hover:bg-blue-600'
			break
		case 'delete':
			color = 'bg-red-500 hover:bg-red-600'
			break
		case 'view':
			color = 'bg-gray-500 hover:bg-gray-600'
	}
	return (
		<button
			className={`
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
                ${color}
                ${className}                
            `}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button
