import React from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import PageTitle from '@/components/ui/PageTitle'
import SpinnerSection from '@/components/ui/SpinnerSection'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'

interface DetailsContainerProps {
	title: string
	permission: string
	isLoading: boolean
	error: string | null
	children: React.ReactNode
	// these two parts I want to keep
	// simple for now as positional
	// elements. I might eventually just
	// have the buttons and modal in place.
	// but i want flexibility and to have
	// the main page control what goes in here.
	buttonsChildren: React.ReactNode
	confirmationModal?: React.ReactNode
}

const DetailsContainer = ({
	title,
	permission,
	isLoading,
	error,
	children,
	buttonsChildren,
	confirmationModal,
}: DetailsContainerProps) => {
	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='bg-white p-8 shadow-md max-w-2xl mx-auto'>
				<PageTitle>{title}</PageTitle>
				{children}
				<PermissionGuard requiredPermission={permission}>
					<div className='mt-6 flex justify-end space-x-3'>
						{buttonsChildren}
					</div>
				</PermissionGuard>
			</div>
			{confirmationModal}
		</div>
	)
}

export default DetailsContainer
