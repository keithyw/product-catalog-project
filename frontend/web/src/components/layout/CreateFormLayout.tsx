import React from 'react'
import CancelSubmitButton from '@/components/ui/form/CancelSubmitButton'
import SubmitButton from '@/components/ui/form/SubmitButton'

interface CreateFormLayoutProps {
	title: string
	isSubmitting: boolean
	submitText: string
	submittingText: string
	cancelUrl?: string
	handleSubmit: React.FormEventHandler<HTMLFormElement>
	children: React.ReactNode
}

const CreateFormLayout: React.FC<CreateFormLayoutProps> = ({
	title,
	isSubmitting,
	submitText,
	submittingText,
	cancelUrl,
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
				{cancelUrl && <CancelSubmitButton cancelUrl={cancelUrl} />}
			</form>
		</div>
	)
}

export default CreateFormLayout
