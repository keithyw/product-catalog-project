'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateItemSection from '@/components/layout/CreateItemSection'
import DataTable from '@/components/ui/DataTable'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import {
	CREATE_PRODUCT_ATTRIBUTE_SETS_URL,
	DEFAULT_PAGE_SIZE,
	PRODUCT_ATTRIBUTE_SETS_URL,
} from '@/lib/constants'
import { PRODUCT_ATTRIBUTE_SET_PERMISSIONS } from '@/lib/constants/permissions'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import { ProductAttributeSet } from '@/types/product'
import { TableColumn, TableRowAction } from '@/types/table'

const COLS: TableColumn<ProductAttributeSet>[] = [
	{
		header: 'ID',
		accessor: 'id',
		sortable: true,
	},
	{
		header: 'Name',
		accessor: 'name',
		sortable: true,
	},
	{
		header: 'Brand',
		render: (prs: ProductAttributeSet) => `${prs.brand_name || 'N/A'}`,
	},
	{
		header: 'Category',
		render: (prs: ProductAttributeSet) => `${prs.category_name || 'N/A'}`,
	},
]

export default function ProductAttributeSetPage() {
	const router = useRouter()
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [deleteProductAttributeSet, setDeleteProductAttributeSet] =
		useState<ProductAttributeSet | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		data: productAttributeSets,
		isLoading,
		searchTerm,
		totalCount,
		currentPage,
		pageSize,
		sortField,
		sortDirection,
		handleSearch,
		handlePageChange,
		handlePageSizeChange,
		handleSort,
		loadData,
	} = useDataTableController({
		initialSortField: 'name',
		defaultPageSize: DEFAULT_PAGE_SIZE,
		fetchData: productAttributeSetService.fetch,
	})

	const cols = useMemo(() => COLS, [])

	const openConfirmModal = (productAttributeSet: ProductAttributeSet) => {
		setDeleteProductAttributeSet(productAttributeSet)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteProductAttributeSet(null)
	}

	const handleDelete = async () => {
		if (deleteProductAttributeSet) {
			try {
				setIsDeleting(true)
				await productAttributeSetService.delete(deleteProductAttributeSet.id)
				toast.success(
					`Product Attribute Set ${deleteProductAttributeSet.name} deleted successfully`,
				)
				loadData()
				closeConfirmModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to delete product attribute set: ${e.message}`)
					closeConfirmModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const actions: TableRowAction<ProductAttributeSet>[] = [
		{
			label: 'View Details',
			onClick: (productAttributeSet) => {
				router.push(`${PRODUCT_ATTRIBUTE_SETS_URL}/${productAttributeSet.id}`)
			},
			actionType: 'view',
			requiredPermission: PRODUCT_ATTRIBUTE_SET_PERMISSIONS.VIEW,
		},
		{
			label: 'Edit',
			onClick: (productAttributeSet) => {
				router.push(
					`${PRODUCT_ATTRIBUTE_SETS_URL}/${productAttributeSet.id}/edit`,
				)
			},
			actionType: 'edit',
			requiredPermission: PRODUCT_ATTRIBUTE_SET_PERMISSIONS.CHANGE,
		},
		{
			label: 'Delete',
			onClick: openConfirmModal,
			actionType: 'delete',
			requiredPermission: PRODUCT_ATTRIBUTE_SET_PERMISSIONS.DELETE,
		},
	]

	return (
		<PermissionGuard
			requiredPermission={PRODUCT_ATTRIBUTE_SET_PERMISSIONS.VIEW}
		>
			<h1>Product Attribute Sets</h1>
			<CreateItemSection
				href={CREATE_PRODUCT_ATTRIBUTE_SETS_URL}
				permission={PRODUCT_ATTRIBUTE_SET_PERMISSIONS.ADD}
			>
				Create New Product Attribute Set
			</CreateItemSection>
			<DataTable
				data={productAttributeSets}
				columns={cols}
				rowKey='id'
				actions={actions}
				searchTerm={searchTerm}
				onSearch={handleSearch}
				currentPage={currentPage}
				pageSize={pageSize}
				totalCount={totalCount}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
				onSort={handleSort}
				currentSortField={sortField}
				currentSortDirection={sortDirection}
				isLoadingRows={isLoading}
			/>
			<ConfirmationModal
				isOpen={isConfirmModalOpen}
				onClose={closeConfirmModal}
				onConfirm={handleDelete}
				title='Confirm Delete Product Attribute Set'
				message={`Are you sure you want to delete ${deleteProductAttributeSet?.name}`}
				confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'}
				confirmButtonClass={
					isDeleting
						? 'bg-red-400 cursor-not-allowed'
						: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
				}
				cancelButtonClass={
					isDeleting
						? 'bg-gray-300 text-gray-500 cursor-not-allowed'
						: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500'
				}
			/>
		</PermissionGuard>
	)
}
