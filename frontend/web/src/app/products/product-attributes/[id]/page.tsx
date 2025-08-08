'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import DetailsSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import PageTitle from '@/components/ui/PageTitle'
import SpinnerSection from '@/components/ui/SpinnerSection'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import { PRODUCT_ATTRIBUTES_URL } from '@/lib/constants'
import { PRODUCT_ATTRIBUTE_PERMISSIONS } from '@/lib/constants/permissions'
import productAttributeService from '@/lib/services/productAttribute'
import { ProductAttribute } from '@/types/product'

export default function ProductAttributeDetailsPage() {
	const router = useRouter()
	const params = useParams()
	const productAttributeId = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [details, setDetails] = useState<DetailSectionRow[]>([])
	const [productAttribute, setProductAttribute] =
		useState<ProductAttribute | null>(null)
	const [showConfirmationModal, setShowConfirmationModal] = useState(false)

	const handleEditClick = () => {
		if (productAttribute) {
			router.push(`${PRODUCT_ATTRIBUTES_URL}/${productAttribute.id}/edit`)
		}
	}

	const handleCloseDeleteModal = () => {
		setShowConfirmationModal(false)
	}

	const handleDeleteClick = () => {
		setShowConfirmationModal(true)
	}

	const handleDeleteConfirm = async () => {
		if (productAttribute) {
			try {
				await productAttributeService.delete(productAttribute.id)
				toast.success(
					`Product attribute ${productAttribute.name} deleted successfully!`,
				)
				router.push(PRODUCT_ATTRIBUTES_URL)
			} catch (e: unknown) {
				console.error('Failed deleting product attribute: ', e)
				toast.error(
					`Failed to delete product attribute ${productAttribute.name}. Please try again.`,
				)
				handleCloseDeleteModal()
			}
		}
	}

	useEffect(() => {
		if (!productAttributeId) {
			setIsLoading(false)
			setError('Failed to load product attribute. Please try again.')
			return
		}
		const fetchProductAttribute = async () => {
			try {
				const res = await productAttributeService.get(
					parseInt(productAttributeId as string),
				)
				setProductAttribute(res)
				setDetails([
					{ label: 'Name', value: res.name },
					{ label: 'Display Name', value: res.display_name || '' },
					{ label: 'Description', value: res.description || '' },
					{ label: 'Type', value: res.type },
					{ label: 'Is Required', value: res.is_required ? 'Yes' : 'No' },
					{
						label: 'Default Value',
						value: JSON.stringify(res.default_value, null, 2),
					},
					{ label: 'Options', value: JSON.stringify(res.options, null, 2) },
					{
						label: 'Validation Rules',
						value: JSON.stringify(res.validation_rules, null, 2),
					},
				])
			} catch (e: unknown) {
				if (e instanceof Error) {
					setError(e.message)
					router.push(PRODUCT_ATTRIBUTE_PERMISSIONS.VIEW)
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchProductAttribute()
	}, [productAttributeId, router])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading product attribute...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='bg-white p-8 shadow-md max-w-2xl mx-auto'>
				<PageTitle>Product Attribute Details</PageTitle>
				{productAttribute && <DetailsSection rows={details} />}
				<PermissionGuard
					requiredPermission={PRODUCT_ATTRIBUTE_PERMISSIONS.CHANGE}
				>
					<div className='mt-6 flex justify-end space-x-3'>
						<Button actionType='edit' onClick={handleEditClick}>
							Edit Product Attribute
						</Button>
						<Button actionType='delete' onClick={handleDeleteClick}>
							Delete Product Attribute
						</Button>
					</div>
				</PermissionGuard>
			</div>
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteConfirm}
				title='Confirm Delete Category'
				message={`Are you sure you want to delete ${productAttribute?.name}`}
			/>
		</div>
	)
}
