'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { FunnelIcon } from '@heroicons/react/24/outline'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateItemSection from '@/components/layout/CreateItemSection'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import {
	CREATE_PRODUCT_URL,
	CREATE_PRODUCT_FROM_IMAGE_URL,
	PRODUCTS_URL,
	DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import productService from '@/lib/services/product'
import { FilterParams } from '@/types/filters'
import { Product } from '@/types/product'
import { TableColumn, TableRowAction } from '@/types/table'
import FilterModal from '@/app/products/FilterModal'

const PRODUCT_COLUMNS: TableColumn<Product>[] = [
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
		header: 'Product Type',
		accessor: 'attribute_set_name',
		sortable: false,
	},
	{
		header: 'Brand',
		accessor: 'brand_name',
		sortable: false,
	},
	{
		header: 'Category',
		accessor: 'category_name',
		sortable: false,
	},
]

export default function ProductsPage() {
	const router = useRouter()
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
	const [filters, setFilters] = useState<FilterParams>({})
	const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const {
		data: products,
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
		handleFilters,
		loadData,
	} = useDataTableController({
		initialSortField: 'name',
		defaultPageSize: DEFAULT_PAGE_SIZE,
		initialFilters: filters,
		fetchData: productService.fetch,
	})

	const cols = useMemo(() => PRODUCT_COLUMNS, [])

	const filterButton = useMemo(
		() => (
			<Button
				actionType='dataTableControl'
				icon={<FunnelIcon className='h-5 w-5' aria-hidden='true' />}
				onClick={() => setIsFilterModalOpen(true)}
			>
				Filters
			</Button>
		),
		[],
	)

	const handleFilter = async (params: FilterParams) => {
		setFilters(params)
		handleFilters(params)
		await loadData()
	}

	const openConfirmModal = (p: Product) => {
		setDeleteProduct(p)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteProduct(null)
	}

	const handleDelete = async () => {
		if (deleteProduct) {
			try {
				setIsDeleting(true)
				await productService.delete(parseInt(deleteProduct.id))
				toast.success(`Product ${deleteProduct.name} deleted successfully`)
				loadData()
				closeConfirmModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e)
					toast.error(`Failed to delete product: ${e.message}`)
					closeConfirmModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const productActions: TableRowAction<Product>[] = [
		{
			label: 'View Details',
			onClick: (p) => {
				router.push(`${PRODUCTS_URL}/${p.id}`)
			},
			actionType: 'view',
			requiredPermission: PRODUCT_PERMISSIONS.VIEW,
		},
		{
			label: 'Edit',
			onClick: (p) => {
				router.push(`${PRODUCTS_URL}/${p.id}/edit`)
			},
			actionType: 'edit',
			requiredPermission: PRODUCT_PERMISSIONS.CHANGE,
		},
		{
			label: 'Delete',
			onClick: openConfirmModal,
			actionType: 'delete',
			requiredPermission: PRODUCT_PERMISSIONS.DELETE,
		},
	]

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.VIEW}>
			<h1>Products</h1>
			<div className='flex gap-4 justify-end'>
				<CreateItemSection
					href={CREATE_PRODUCT_URL}
					permission={PRODUCT_PERMISSIONS.ADD}
				>
					Create New Product
				</CreateItemSection>
				<CreateItemSection
					href={CREATE_PRODUCT_FROM_IMAGE_URL}
					permission={PRODUCT_PERMISSIONS.ADD}
				>
					Create From Image
				</CreateItemSection>
			</div>
			<DataTable
				data={products}
				columns={cols}
				rowKey='id'
				actions={productActions}
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
				filter={filterButton}
			/>
			<ConfirmationModal
				isOpen={isConfirmModalOpen}
				onClose={closeConfirmModal}
				onConfirm={handleDelete}
				title='Confirm Delete Product'
				message={`Are you sure you want to delete ${deleteProduct?.name}`}
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
			<FilterModal
				isOpen={isFilterModalOpen}
				onApply={handleFilter}
				onClose={() => setIsFilterModalOpen(false)}
			/>
		</PermissionGuard>
	)
}
