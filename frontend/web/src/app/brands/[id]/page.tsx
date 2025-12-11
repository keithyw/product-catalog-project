'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import PageTitle from '@/components/ui/PageTitle'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { BRANDS_URL, FAILED_LOADING_BRANDS_ERROR } from '@/lib/constants'
import { BRAND_PERMISSIONS } from '@/lib/constants/permissions'
import brandService from '@/lib/services/brand'
import { Brand } from '@/types/brand'

const BrandDetailsPage: React.FC = () => {
	const router = useRouter()
	const params = useParams()
	const brandId = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [brand, setBrand] = useState<Brand | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [details, setDetails] = useState<DetailSectionRow[]>([])
	const [showConfirmationModal, setShowConfirmationModal] = useState(false)

	const handleCloseDeleteModal = () => {
		setShowConfirmationModal(false)
	}

	const handleDeleteClick = () => {
		setShowConfirmationModal(true)
	}

	const handleDeleteConfirm = async () => {
		if (brand) {
			try {
				await brandService.delete(brand.id as number)
				toast.success(`Brand ${brand.name} deleted successfully`)
				router.push(BRANDS_URL)
			} catch (e: unknown) {
				console.error('Failed deleting brand: ', e)
				toast.error(`Failed to delete brand ${brand.name}`)
				handleCloseDeleteModal()
			}
		}
	}

	const handleEditClick = () => {
		if (brand) {
			router.push(`${BRANDS_URL}/${brand.id}/edit`)
		}
	}

	useEffect(() => {
		if (brandId) {
			const fetchBrand = async () => {
				try {
					const res = await brandService.get(parseInt(brandId as string))
					setBrand(res)
					setDetails([
						{ label: 'Name', value: res.name },
						{ label: 'Description', value: res.description || '' },
						{ label: 'Logo URL', value: res.logo_url || '' },
						{ label: 'Website URL', value: res.website_url || '' },
						{ label: 'Contact Email', value: res.contact_email || '' },
					])
				} catch (e: unknown) {
					if (e instanceof Error) {
						setError(FAILED_LOADING_BRANDS_ERROR)
						router.push(BRANDS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchBrand()
		}
	}, [brandId, router])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading brand details...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='bg-white p-8 shadow-md max-w-2xl mx-auto'>
				<PageTitle>Brand Details</PageTitle>
				{brand && <DetailSection rows={details} />}
				<PermissionGuard requiredPermission={BRAND_PERMISSIONS.CHANGE}>
					<div className='mt-6 flex justify-end space-x-3'>
						<Button actionType='edit' onClick={handleEditClick}>
							Edit Brand
						</Button>
						<Button actionType='delete' onClick={handleDeleteClick}>
							Delete Brand
						</Button>
					</div>
				</PermissionGuard>
			</div>
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteConfirm}
				title='Confirm Delete Brand'
				message={`Are you sure you want to delete ${brand?.name}`}
			/>
		</div>
	)
}

export default BrandDetailsPage
