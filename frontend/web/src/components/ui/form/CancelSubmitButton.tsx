import React from 'react'
import { useRouter } from 'next/navigation'

interface CancelSubmitButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	cancelUrl: string
	children?: React.ReactNode
}

const CancelSubmitButton: React.FC<CancelSubmitButtonProps> = ({
	cancelUrl,
	children,
	className = '',
	...props
}) => {
	const router = useRouter()

	const handleCancel = () => {
		router.push(cancelUrl)
	}

	return (
		<button
			type='button'
			onClick={handleCancel}
			className={`
                px-4
                py-2
                rounded
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:shadow-outline
                w-full
                bg-red-500
                text-white
                font-bold
                hover:bg-red-600
                ${className}`}
			{...props}
		>
			Cancel
			{children}
		</button>
	)
}

export default CancelSubmitButton
