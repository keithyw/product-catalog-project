'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateItemSection from '@/components/layout/CreateItemSection'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import DataTable from '@/components/ui/DataTable'
import {
	CREATE_PRICING_RULES_URL,
	PRICING_RULES_URL,
	PRODUCT_PERMISSIONS,
	DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import priceRulesService from '@/lib/services/priceRules'
import { PriceRule } from '@/types/product'
import { TableColumn, TableRowAction } from '@/types/table'

const COLS: TableColumn<PriceRule>[] = [
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
		header: 'Rule Type',
		accessor: 'rule_type',
		sortable: false,
	},
]

const PriceRulesPage = () => {
	const router = useRouter()
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [deletePriceRule, setDeletePriceRule] = useState<PriceRule | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const {
		data: priceRules,
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
		fetchData: priceRulesService.fetch,
	})

	const cols = useMemo(() => COLS, [])

	const handleDelete = async () => {
		if (deletePriceRule) {
			setIsDeleting(true)
			try {
				await priceRulesService.delete(deletePriceRule.id)
				loadData()
				toast.success(`Price Rule ${deletePriceRule.name} deleted successfully`)
				setDeletePriceRule(null)
				setIsConfirmModalOpen(false)
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to delete price rule: ${e.message}`)
					setIsConfirmModalOpen(false)
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const actions: TableRowAction<PriceRule>[] = [
		{
			label: 'View Details',
			onClick: (priceRule) => {
				router.push(`${PRICING_RULES_URL}/${priceRule.id}`)
			},
			actionType: 'view',
			requiredPermission: PRODUCT_PERMISSIONS.VIEW,
		},
		{
			label: 'Edit',
			onClick: (priceRule) => {
				router.push(`${PRICING_RULES_URL}/${priceRule.id}/edit`)
			},
			actionType: 'edit',
			requiredPermission: PRODUCT_PERMISSIONS.CHANGE,
		},
		{
			label: 'Delete',
			actionType: 'delete',
			requiredPermission: PRODUCT_PERMISSIONS.DELETE,
			onClick: (priceRule) => {
				setDeletePriceRule(priceRule)
				setIsConfirmModalOpen(true)
			},
		},
	]

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.VIEW}>
			<h1>Price Rules</h1>
			<CreateItemSection
				permission={PRODUCT_PERMISSIONS.ADD}
				href={CREATE_PRICING_RULES_URL}
			>
				Create New Price Rule
			</CreateItemSection>
			<DataTable
				data={priceRules}
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
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={handleDelete}
				title='Confirm Delete Price Rule'
				message={`Are you sure you want to delete "${deletePriceRule?.name}"?`}
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

export default PriceRulesPage
