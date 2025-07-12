import React from 'react'

interface SubmitButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
	children,
	className = '',
	...props
}) => {
	return (
		<button
			type='submit'
			className={`
                px-4
                py-2
                rounded
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:shadow-outline
                w-full
                bg-blue-500
                text-white
                font-bold
                hover:bg-blue-600
                ${className}`}
			{...props}
		>
			{children}
		</button>
	)
}

export default SubmitButton
