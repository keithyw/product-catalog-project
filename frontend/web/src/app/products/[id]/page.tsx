'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { upperFirst, toLower } from 'lodash'
import PermissionGuard from '@/components/auth/PermissionGuard'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import PageTitle from '@/components/ui/PageTitle'
import SpinnerSection from '@/components/ui/SpinnerSection'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import { FAILED_LOADING_PRODUCT_ERROR, PRODUCTS_URL } from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import productService from '@/lib/services/product'
import { Product } from '@/types/product'

export default function ProductDetailsPage() {
	const router = useRouter()
	const params = useParams()
	const id = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [product, setProduct] = useState<Product | null>(null)
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
		if (product) {
			try {
				await productService.delete(parseInt(id as string))
				toast.success(`Product ${product.name} deleted successfully`)
				router.push(PRODUCTS_URL)
			} catch (e: unknown) {
				console.error('Failed deleting product: ', e)
				toast.error(`Failed to delete product ${product.name}`)
				handleCloseDeleteModal()
			}
		}
	}

	const handleEditClick = () => {
		if (product) {
			router.push(`${PRODUCTS_URL}/${id}/edit`)
		}
	}

	useEffect(() => {
		if (id) {
			const fetchData = async () => {
				try {
					const res = await productService.get(parseInt(id as string))
					setProduct(res)

					const attributes = []
					if (res.attributes_data) {
						for (const [k, v] of Object.entries(res.attributes_data)) {
							attributes.push({ label: upperFirst(toLower(k)), value: v })
						}
					}

					console.log('attributes ', attributes)
					setDetails([
						{ label: 'Name', value: res.name },
						{ label: 'Description', value: res.description || '' },
						{ label: 'Is Active', value: res.is_active ? 'Yes' : 'No ' },
						{ label: 'Brand', value: res.brand_name || '' },
						{ label: 'Category', value: res.category_name || '' },
						...attributes,
					])
				} catch (e: unknown) {
					if (e instanceof Error) {
						setError(FAILED_LOADING_PRODUCT_ERROR)
						router.push(PRODUCTS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchData()
		}
	}, [id, router])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading product...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='containermx-auto p-4'>
			<div className='bg-white p-8 shadow-md max-w-2xl mx-auto'>
				<PageTitle>Product Details</PageTitle>
				{product && <DetailSection rows={details} />}
				<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.CHANGE}>
					<div className='mt-6 flex justify-end space-x-3'>
						<Button actionType='edit' onClick={handleEditClick}>
							Edit Product
						</Button>
						<Button actionType='delete' onClick={handleDeleteClick}>
							Delete Product
						</Button>
					</div>
				</PermissionGuard>
			</div>
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteConfirm}
				title='Confirm Delete Brand'
				message={`Are you sure you want to delete ${product?.name}`}
			/>
		</div>
	)
}
