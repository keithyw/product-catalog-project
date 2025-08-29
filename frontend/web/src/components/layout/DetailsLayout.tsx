import React from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import Button from '@/components/ui/form/Button'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import PageTitle from '@/components/ui/PageTitle'
import SpinnerSection from '@/components/ui/SpinnerSection'

interface HasId {
	id: string | number
}

interface DetailsLayoutProps<T> {
	title: string
	item: T
	details: DetailSectionRow[]
	permission: string
	handleDeleteConfirm: () => Promise<void>
	handleEditClick: () => void
	isLoading: boolean
	isConfirmationModalOpen: boolean
	setIsConfirmationModalOpen: (isOpen: boolean) => void
	error: string | null
	children?: React.ReactNode
}

const DetailsLayout = <T extends HasId>({
	title,
	item,
	details,
	permission,
	handleDeleteConfirm,
	handleEditClick,
	isLoading,
	isConfirmationModalOpen,
	setIsConfirmationModalOpen,
	error,
	children,
}: DetailsLayoutProps<T>) => {
	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading details...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='bg-white p-8 shadow-md max-w-2xl mx-auto'>
				<PageTitle>{title}</PageTitle>
				{item && <DetailSection rows={details} />}
				{children}
				<PermissionGuard requiredPermission={permission}>
					<div className='mt-6 flex justify-end space-x-3'>
						<Button actionType='edit' onClick={handleEditClick}>
							Edit
						</Button>
						<Button
							actionType='delete'
							onClick={() => setIsConfirmationModalOpen(true)}
						>
							Delete
						</Button>
					</div>
				</PermissionGuard>
			</div>
			<ConfirmationModal
				isOpen={isConfirmationModalOpen}
				onClose={() => setIsConfirmationModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				title='Confirm Deletion'
				message='Are you sure you want to delete this item?'
			/>
		</div>
	)
}

export default DetailsLayout
