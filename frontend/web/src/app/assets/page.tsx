'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateItemSection from '@/components/layout/CreateItemSection'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import AssetPreview from '@/components/ui/AssetPreview'
import DataTable from '@/components/ui/DataTable'
import {
	ASSETS_URL,
	CREATE_ASSETS_URL,
	DEFAULT_PAGE_SIZE,
	MODAL_CONFIRMATION_BUTTON_DELETING_STYLE,
	MODAL_CONFIRMATION_BUTTON_STYLE,
	MODAL_CANCEL_BUTTON_STYLE,
	MODAL_CANCEL_DELETING_STYLE,
} from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import assetService from '@/lib/services/assets'
import { TableColumn, TableRowAction } from '@/types/table'
import { Asset } from '@/types/asset'

const COLS: TableColumn<Asset>[] = [
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
		header: 'Preview',
		sortable: false,
		render: (row: Asset) => {
			return (
				<AssetPreview
					url={row.url}
					type={row.type}
					alt={row.name || 'Asset preview'}
				/>
			)
		},
	},
	{
		header: 'Type',
		accessor: 'type',
		sortable: true,
	},
]

const AssetsPage = () => {
	const router = useRouter()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		data: assets,
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
		fetchData: assetService.fetch,
	})

	const cols = useMemo(() => COLS, [])

	const openModal = (asset: Asset) => {
		setDeleteAsset(asset)
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setDeleteAsset(null)
	}

	const handleDelete = async () => {
		if (deleteAsset) {
			try {
				setIsDeleting(true)
				await assetService.delete(deleteAsset.id)
				toast.success(`Asset ${deleteAsset.name} deleted successfully`)
				loadData()
				closeModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to delete asset: ${e.message}`)
					closeModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const actions: TableRowAction<Asset>[] = [
		{
			label: 'View Details',
			onClick: (asset) => {
				router.push(`${ASSETS_URL}/${asset.id}`)
			},
			actionType: 'view',
			requiredPermission: PRODUCT_PERMISSIONS.VIEW,
		},
		{
			label: 'Edit',
			onClick: (asset) => {
				router.push(`${ASSETS_URL}/${asset.id}/edit`)
			},
			actionType: 'edit',
			requiredPermission: PRODUCT_PERMISSIONS.CHANGE,
		},
		{
			label: 'Delete',
			onClick: openModal,
			actionType: 'delete',
			requiredPermission: PRODUCT_PERMISSIONS.DELETE,
		},
	]

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.VIEW}>
			<h1>Assets</h1>
			<CreateItemSection
				href={CREATE_ASSETS_URL}
				permission={PRODUCT_PERMISSIONS.ADD}
			>
				Create New Asset
			</CreateItemSection>
			<DataTable
				data={assets}
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
				isOpen={isModalOpen}
				onClose={closeModal}
				onConfirm={handleDelete}
				title='Confirm Delete Asset'
				message={`Are you sure you want to delete ${deleteAsset?.name}`}
				confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'}
				confirmButtonClass={
					isDeleting
						? MODAL_CONFIRMATION_BUTTON_DELETING_STYLE
						: MODAL_CONFIRMATION_BUTTON_STYLE
				}
				cancelButtonClass={
					isDeleting ? MODAL_CANCEL_DELETING_STYLE : MODAL_CANCEL_BUTTON_STYLE
				}
			/>
		</PermissionGuard>
	)
}

export default AssetsPage
