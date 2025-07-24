'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import DetailsSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import PageTitle from '@/components/ui/PageTitle'
import SpinnerSection from '@/components/ui/SpinnerSection'
import Button from '@/components/ui/form/Button'
import {
	CATEGORIES_URL,
	FAILED_LOADING_CATEGORIES_ERROR,
} from '@/lib/constants'
import { CATEGORY_PERMISSIONS } from '@/lib/constants/permissions'
import categoryService from '@/lib/services/category'
import { Category } from '@/types/category'

const CategoryDetailsPage: React.FC = () => {
	const router = useRouter()
	const params = useParams()
	const categoryId = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [category, setCategory] = useState<Category | null>(null)
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
		if (category) {
			try {
				await categoryService.delete(category.id)
				toast.success(`Category ${category.name} deleted successfully`)
				router.push(CATEGORIES_URL)
			} catch (e: unknown) {
				console.error('Failed deleting category: ', e)
				toast.error(`Failed to delete category ${category.name}`)
				handleCloseDeleteModal()
			}
		}
	}

	const handleEditClick = () => {
		if (category) {
			router.push(`${CATEGORIES_URL}/${category.id}/edit`)
		}
	}

	useEffect(() => {
		if (categoryId) {
			const fetchCategory = async () => {
				try {
					const res = await categoryService.get(parseInt(categoryId as string))
					setCategory(res)
					setDetails([
						{ label: 'Name', value: res.name },
						{ label: 'Description', value: res.description || '' },
						{ label: 'Image URL', value: res.image_url || '' },
						{ label: 'Banner Image URL', value: res.banner_image_url || '' },
						{ label: 'Is Active', value: res.is_active ? 'Yes' : 'No' },
						{ label: 'Display Order', value: res.display_order.toString() },
						{ label: 'Meta Title', value: res.meta_title || '' },
						{ label: 'Meta Description', value: res.meta_description || '' },
						{ label: 'Meta Keywords', value: res.meta_keywords || '' },
					])
				} catch (e: unknown) {
					if (e instanceof Error) {
						setError(FAILED_LOADING_CATEGORIES_ERROR)
						router.push(CATEGORIES_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchCategory()
		}
	}, [categoryId, router])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading category details...' />
	}

	if (error) {
		return <ServerErrorMessages errorMessages={error} />
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='bg-white p-8 shadow-md max-w-2xl mx-auto'>
				<PageTitle>Category Details</PageTitle>
				{category && <DetailsSection rows={details} />}
				<PermissionGuard requiredPermission={CATEGORY_PERMISSIONS.CHANGE}>
					<div className='mt-6 flex justify-end space-x-3'>
						<Button actionType='edit' onClick={handleEditClick}>
							Edit Category
						</Button>
						<Button actionType='delete' onClick={handleDeleteClick}>
							Delete Category
						</Button>
					</div>
				</PermissionGuard>
			</div>
			<ConfirmationModal
				isOpen={showConfirmationModal}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDeleteConfirm}
				title='Confirm Delete Category'
				message={`Are you sure you want to delete ${category?.name}`}
			/>
		</div>
	)
}

export default CategoryDetailsPage
