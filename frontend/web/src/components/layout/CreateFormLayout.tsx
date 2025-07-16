import React from 'react'
import SubmitButton from '@/components/ui/SubmitButton'

interface CreateFormLayoutProps {
	title: string
	isSubmitting: boolean
	submitText: string
	submittingText: string
	handleSubmit: React.FormEventHandler<HTMLFormElement>
	children: React.ReactNode
}

const CreateFormLayout: React.FC<CreateFormLayoutProps> = ({
	title,
	isSubmitting,
	submitText,
	submittingText,
	handleSubmit,
	children,
}) => {
	return (
		<div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
			<h2 className='text-2xl font-bold mb-6 text-gray-800'>{title}</h2>
			<form onSubmit={handleSubmit} className='space-y-4'>
				{children}
				<SubmitButton disabled={isSubmitting}>
					{isSubmitting ? submittingText : submitText}
				</SubmitButton>
			</form>
		</div>
	)
}

export default CreateFormLayout
