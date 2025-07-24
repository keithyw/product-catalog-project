'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import CreateItemSection from '@/components/layout/CreateItemSection'
import DataTable from '@/components/ui/DataTable'
import PermissionGuard from '@/components/auth/PermissionGuard'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import {
	BRANDS_URL,
	CREATE_BRANDS_URL,
	DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { BRAND_PERMISSIONS } from '@/lib/constants/permissions'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import brandService from '@/lib/services/brand'
import { TableColumn, TableRowAction } from '@/types/table'
import { Brand } from '@/types/brand'

const BRAND_COLUMNS: TableColumn<Brand>[] = [
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
]

export default function BrandsPage() {
	const router = useRouter()
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		data: brands,
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
		fetchData: brandService.fetch,
	})

	const cols = useMemo(() => BRAND_COLUMNS, [])

	const openConfirmModal = (brand: Brand) => {
		setDeleteBrand(brand)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteBrand(null)
	}

	const handleDelete = async () => {
		if (deleteBrand) {
			try {
				setIsDeleting(true)
				await brandService.delete(deleteBrand.id)
				toast.success(`Brand ${deleteBrand.name} deleted successfully`)
				loadData()
				closeConfirmModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to delete brand: ${e.message}`)
					closeConfirmModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const actions: TableRowAction<Brand>[] = [
		{
			label: 'View Details',
			onClick: (brand) => {
				router.push(`${BRANDS_URL}/${brand.id}`)
			},
			actionType: 'view',
			requiredPermission: BRAND_PERMISSIONS.VIEW,
		},
		{
			label: 'Edit',
			onClick: (brand) => {
				router.push(`${BRANDS_URL}/${brand.id}/edit`)
			},
			actionType: 'edit',
			requiredPermission: BRAND_PERMISSIONS.CHANGE,
		},
		{
			label: 'Delete',
			onClick: openConfirmModal,
			actionType: 'delete',
			requiredPermission: BRAND_PERMISSIONS.DELETE,
		},
	]

	return (
		<PermissionGuard requiredPermission={BRAND_PERMISSIONS.VIEW}>
			<h1>Brands</h1>
			<CreateItemSection
				href={CREATE_BRANDS_URL}
				permission={BRAND_PERMISSIONS.ADD}
			>
				Create New Brand
			</CreateItemSection>
			<DataTable
				data={brands}
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
				title='Confirm Delete Brand'
				message={`Are you sure you want to delete ${deleteBrand?.name}`}
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
