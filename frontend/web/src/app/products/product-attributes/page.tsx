'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import CreateItemSection from '@/components/layout/CreateItemSection'
import DataTable from '@/components/ui/DataTable'
import {
	CREATE_PRODUCT_ATTRIBUTES_URL,
	PRODUCT_ATTRIBUTES_URL,
	DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { PRODUCT_ATTRIBUTE_PERMISSIONS } from '@/lib/constants/permissions'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import productAttributeService from '@/lib/services/productAttribute'
import { TableColumn, TableRowAction } from '@/types/table'
import { ProductAttribute } from '@/types/product'

const COLS: TableColumn<ProductAttribute>[] = [
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
		header: 'Type',
		accessor: 'type',
		sortable: false,
	},
]

export default function ProductAttributesPage() {
	const router = useRouter()
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [deleteProductAttribute, setDeleteProductAttribute] =
		useState<ProductAttribute | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		data: productAttributes,
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
		fetchData: productAttributeService.fetch,
	})

	const cols = useMemo(() => COLS, [])

	const openConfirmModal = (productAttribute: ProductAttribute) => {
		setDeleteProductAttribute(productAttribute)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteProductAttribute(null)
	}

	const handleDelete = async () => {
		if (deleteProductAttribute) {
			try {
				setIsDeleting(true)
				await productAttributeService.delete(deleteProductAttribute.id)
				toast.success(
					`Product Attribute ${deleteProductAttribute.name} deleted successfully`,
				)
				loadData()
				closeConfirmModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to delete product attribute: ${e.message}`)
					closeConfirmModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const actions: TableRowAction<ProductAttribute>[] = [
		{
			label: 'View Details',
			onClick: (productAttribute) => {
				router.push(`${PRODUCT_ATTRIBUTES_URL}/${productAttribute.id}`)
			},
			actionType: 'view',
			requiredPermission: PRODUCT_ATTRIBUTE_PERMISSIONS.VIEW,
		},
		{
			label: 'Edit',
			onClick: (productAttribute) => {
				router.push(`${PRODUCT_ATTRIBUTES_URL}/${productAttribute.id}/edit`)
			},
			actionType: 'edit',
			requiredPermission: PRODUCT_ATTRIBUTE_PERMISSIONS.CHANGE,
		},
		{
			label: 'Delete',
			onClick: openConfirmModal,
			actionType: 'delete',
			requiredPermission: PRODUCT_ATTRIBUTE_PERMISSIONS.DELETE,
		},
	]

	return (
		<PermissionGuard requiredPermission={PRODUCT_ATTRIBUTE_PERMISSIONS.VIEW}>
			<h1>Product Attributes</h1>
			<CreateItemSection
				href={CREATE_PRODUCT_ATTRIBUTES_URL}
				permission={PRODUCT_ATTRIBUTE_PERMISSIONS.ADD}
			>
				Create New Product Attribute
			</CreateItemSection>
			<DataTable
				data={productAttributes}
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
				title='Confirm Delete Product Attribute'
				message={`Are you sure you want to delete ${deleteProductAttribute?.name}`}
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
