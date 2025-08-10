'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PermissionGuard from '@/components/auth/PermissionGuard'
import { useParams, useRouter } from 'next/navigation'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import DetailsSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import PageTitle from '@/components/ui/PageTitle'
import SpinnerSection from '@/components/ui/SpinnerSection'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import { PRODUCT_ATTRIBUTE_SETS_URL } from '@/lib/constants'
import { PRODUCT_ATTRIBUTE_SET_PERMISSIONS } from '@/lib/constants/permissions'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import { ProductAttributeSet } from '@/types/product'

export default function ProductAttributeSetPage() {
	const router = useRouter()
	const params = useParams()
	const id = params.id
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [details, setDetails] = useState<DetailSectionRow[]>([])
	const [attributeSet, setAttributeSet] = useState<ProductAttributeSet | null>(
		null,
	)
	const [showConfirmationModal, setShowConfirmationModal] = useState(false)

	const handleEditClick = () => {
		if (attributeSet) {
			router.push(`${PRODUCT_ATTRIBUTE_SETS_URL}/${id}/edit`)
		}
	}

	const handleCloseDeleteModal = () => {
		setShowConfirmationModal(false)
	}

	const handleDeleteClick = () => {
		setShowConfirmationModal(true)
	}

	const handleDeleteConfirm = async () => {
		if (attributeSet) {
			try {
				await productAttributeSetService.delete(parseInt(id as string))
				toast.success(
					`Attribute set ${attributeSet.name} deleted successfully!`,
				)
				router.push(PRODUCT_ATTRIBUTE_SETS_URL)
			} catch (e: unknown) {
				console.error('Failed deleting attribute set: ', e)
				toast.error(`Failed to delete attribute set ${attributeSet.name}`)
			}
		}
	}

	useEffect(() => {
		if (!id) {
			setIsLoading(false)
			setError('Failed to load attribute set. Please try again.')
			return
		}
		const fetchAttrSet = async () => {
			const res = await productAttributeSetService.get(parseInt(id as string))
			setAttributeSet(res)
			setDetails([
				{ label: 'Name', value: res.name },
				{ label: 'Description', value: res.description || '' },
				{ label: 'Is Active', value: res.is_active ? 'Yes' : 'No' },
				{ label: 'Brand', value: res.brand_name || '' },
				{ label: 'Category', value: res.category_name || '' },
			])
		}
		fetchAttrSet()
	}, [id])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading product attribute set...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='bg-white p-8 shadow-md max-w-2xl mx-auto'>
				<PageTitle>Product Attribute Set Details</PageTitle>
				{attributeSet && <DetailsSection rows={details} />}
				<div className='bg-white shadow-md rounded-lg p-6'>
					<h2 className='text-xl font-bold text-gray-800 mb-4'>Attributes</h2>
					{attributeSet?.attributes_detail.length === 0 ? (
						<p className='text-gray-600'>No attributes</p>
					) : (
						<div className='grid grid-cols-1 md:grid-col-2 lg:grid-col-3 gap-4'>
							{attributeSet?.attributes_detail.map((attr) => (
								<div
									key={attr.id}
									className='border border-gray-200 rounded-lg p-4 bg-gray-50'
								>
									<h3 className='text-lg font-semibold text-gray-800 mb-2'>
										{attr.name}
									</h3>
									<p className='text-sm text-gray-600'>
										Type:
										<span className='font-medium'>{attr.type}</span>
									</p>
									<p className='text-sm text-gray-600'>
										Required:
										<span className='font-medium'>
											{attr.is_required ? 'Yes' : 'No'}
										</span>
									</p>
									{attr.sample_values && (
										<p className='text-sm text-gray-600'>
											Sample Values:
											<span className='font-medium'>{attr.sample_values}</span>
										</p>
									)}
									{attr.default_value !== null && (
										<p className='text-sm text-gray-600'>
											Default Values:
											<span className='font-medium'>
												{JSON.stringify(attr.default_value)}
											</span>
										</p>
									)}
									{attr.options !== null && (
										<p className='text-sm text-gray-600'>
											Options:
											<span className='font-medium'>
												{JSON.stringify(attr.options)}
											</span>
										</p>
									)}
									{attr.validation_rules !== null && (
										<p className='text-sm text-gray-600'>
											Validation Rules:
											<span className='font-medium'>
												{JSON.stringify(attr.validation_rules)}
											</span>
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</div>
				<PermissionGuard
					requiredPermission={PRODUCT_ATTRIBUTE_SET_PERMISSIONS.CHANGE}
				>
					<div className='mt-6 flex justify-end space-x-3'>
						<Button actionType='edit' onClick={handleEditClick}>
							Edit Attribute Set
						</Button>
						<Button actionType='delete' onClick={handleDeleteClick}>
							Delete Attribute Set
						</Button>
					</div>
				</PermissionGuard>
			</div>
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteConfirm}
				title='Confirm Delete Category'
				message={`Are you sure you want to delete ${attributeSet?.name}`}
			/>
		</div>
	)
}
