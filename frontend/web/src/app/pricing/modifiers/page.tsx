'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateItemSection from '@/components/layout/CreateItemSection'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import DataTable from '@/components/ui/DataTable'
import PageTitle from '@/components/ui/PageTitle'
import {
	CREATE_PRICING_MODIFIERS_URL,
	PRICING_MODIFIERS_URL,
	DEFAULT_PAGE_SIZE,
	PRODUCT_PERMISSIONS,
} from '@/lib/constants'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import priceModifiersService from '@/lib/services/priceModifiers'
import { PriceModifier } from '@/types/product'
import { TableColumn, TableRowAction } from '@/types/table'

const COLS: TableColumn<PriceModifier>[] = [
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
	{
		header: 'Amount',
		accessor: 'amount',
		sortable: false,
	},
]

const ModifiersPage = () => {
	const router = useRouter()
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [deleteModifier, setDeleteModifier] = useState<PriceModifier | null>(
		null,
	)
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		data: priceModifiers,
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
		fetchData: priceModifiersService.fetch,
	})

	const cols = useMemo(() => COLS, [])

	const openConfirmModal = (priceModifier: PriceModifier) => {
		setDeleteModifier(priceModifier)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteModifier(null)
	}

	const handleDelete = async () => {
		if (deleteModifier) {
			setIsDeleting(true)
			try {
				await priceModifiersService.delete(deleteModifier.id)
				toast.success(`Modifier ${deleteModifier.name} deleted successfully`)
				loadData()
				closeConfirmModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to delete modifier: ${e.message}`)
					closeConfirmModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const actions: TableRowAction<PriceModifier>[] = [
		{
			label: 'View Details',
			onClick: (priceModifier) => {
				router.push(`${PRICING_MODIFIERS_URL}/${priceModifier.id}`)
			},
			actionType: 'view',
			requiredPermission: PRODUCT_PERMISSIONS.VIEW,
		},
		{
			label: 'Edit',
			onClick: (priceModifier) => {
				router.push(`${PRICING_MODIFIERS_URL}/${priceModifier.id}/edit`)
			},
			actionType: 'edit',
			requiredPermission: PRODUCT_PERMISSIONS.CHANGE,
		},
		{
			label: 'Delete',
			actionType: 'delete',
			requiredPermission: PRODUCT_PERMISSIONS.DELETE,
			onClick: openConfirmModal,
		},
	]

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.VIEW}>
			<PageTitle>
				Price Modifiers
			</PageTitle>
			<CreateItemSection
				permission={PRODUCT_PERMISSIONS.ADD}
				href={CREATE_PRICING_MODIFIERS_URL}
			>
				Create New Price Modifier
			</CreateItemSection>
			<DataTable
				data={priceModifiers}
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
				title='Confirm Delete Modifier'
				message={`Are you sure you want to delete "${deleteModifier?.name}"?`}
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

export default ModifiersPage
