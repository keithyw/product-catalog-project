'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import FloatingActionToolbar from '@/components/layout/FloatingActionToolbar'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import PageTitle from '@/components/ui/PageTitle'
import ProductAttributesSection from '@/components/ui/ProductAttributesSection'
import ProductImageSection from '@/components/ui/ProductImageSection'
import ProductInfoSection from '@/components/ui/ProductInfoSection'
import SpinnerSection from '@/components/ui/SpinnerSection'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import {
	FAILED_LOADING_PRODUCT_ERROR,
	PRICE_URL,
	PRODUCTS_URL,
} from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import productService from '@/lib/services/product'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import useProductStore from '@/stores/useProductStore'
import { Asset } from '@/types/asset'
import { Product } from '@/types/product'
import GenAIDescriptionModal from '@/app/products/modals/GenAIDescriptionModal'
import JobMonitorModal from '@/app/products/modals/JobMonitorModal'

export default function ProductDetailsPage() {
	const router = useRouter()
	const params = useParams()
	const id = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [attributes, setAttributes] = useState<Record<string, string>[]>([])
	const [showConfirmationModal, setShowConfirmationModal] = useState(false)
	const [showGenAIDescriptionModal, setShowGenAIDescriptionModal] =
		useState(false)
	const [showJobMonitorModal, setShowJobMonitorModal] = useState(false)
	const { product, setProduct, setProductAttributeSet } = useProductStore()

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
					if (res.attributes_data) {
						for (const [k, v] of Object.entries(res.attributes_data)) {
							attributes.push({ label: k, value: v })
						}
						setAttributes(attributes)
					}
					const productAttributeSet = await productAttributeSetService.get(
						res.attribute_set,
					)
					setProductAttributeSet(productAttributeSet)
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
	}, [attributes, id, router, setProduct, setProductAttributeSet])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading product...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4 sm:p-6 lg:p-8'>
			<div className='bg-white rounded-xl shadow-lg p-6'>
				<PageTitle>Product Details</PageTitle>
				<div className='min-h-screen pb-20'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12'>
						<div>
							<ProductImageSection assets={product?.assets as Asset[]} />
						</div>
						<div>
							<ProductInfoSection product={product as Product} />
						</div>
					</div>
					<ProductAttributesSection attributes={attributes} />
				</div>
				<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.CHANGE}>
					<FloatingActionToolbar>
						<Button actionType='neutral' onClick={handleEditClick}>
							Edit
						</Button>
						<Button actionType='neutral' onClick={handleDeleteClick}>
							Delete
						</Button>
						<Button
							actionType='neutral'
							onClick={() => setShowGenAIDescriptionModal(true)}
						>
							AI Description
						</Button>
						<Button
							actionType='neutral'
							onClick={() => setShowJobMonitorModal(true)}
						>
							Monitor Product
						</Button>
						<Link
							href={
								product?.price
									? `${PRODUCTS_URL}/${id}${PRICE_URL}/${product?.price.id}`
									: `${PRODUCTS_URL}/${id}${PRICE_URL}`
							}
							passHref
						>
							<Button actionType='neutral' type='button'>
								Manage Pricing
							</Button>
						</Link>
					</FloatingActionToolbar>
				</PermissionGuard>
			</div>
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteConfirm}
				title='Confirm Delete Brand'
				message={`Are you sure you want to delete ${product?.name}`}
			/>
			<GenAIDescriptionModal
				isOpen={showGenAIDescriptionModal}
				onClose={() => setShowGenAIDescriptionModal(false)}
			/>
			<JobMonitorModal
				isOpen={showJobMonitorModal}
				onClose={() => setShowJobMonitorModal(false)}
			/>
		</div>
	)
}
