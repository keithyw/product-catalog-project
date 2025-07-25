'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import CreateItemSection from '@/components/layout/CreateItemSection'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import DataTable from '@/components/ui/DataTable'
import PermissionGuard from '@/components/auth/PermissionGuard'
import {
	CATEGORIES_URL,
	CREATE_CATEGORIES_URL,
	DEFAULT_PAGE_SIZE,
} from '@/lib/constants'
import { CATEGORY_PERMISSIONS } from '@/lib/constants/permissions'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import categoryService from '@/lib/services/category'
import { Category } from '@/types/category'
import { TableColumn, TableRowAction } from '@/types/table'

const CATEGORY_COLUMNS: TableColumn<Category>[] = [
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
		header: 'Parent Category',
		accessor: 'parent_name',
		sortable: false,
	},
]

export default function CategoriesPage() {
	const router = useRouter()
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const cols = useMemo(() => CATEGORY_COLUMNS, [])
	const {
		data: categories,
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
		fetchData: categoryService.fetch,
	})

	const openConfirmModel = (cat: Category) => {
		setDeleteCategory(cat)
		setIsConfirmModalOpen(true)
	}

	const closeConfirmModal = () => {
		setIsConfirmModalOpen(false)
		setDeleteCategory(null)
	}

	const handleDelete = async () => {
		if (deleteCategory) {
			try {
				setIsDeleting(true)
				await categoryService.delete(deleteCategory.id)
				toast.success(`Category ${deleteCategory.name} deleted successfully`)
				loadData()
				closeConfirmModal()
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to delete category: ${e.message}`)
					closeConfirmModal()
				}
			} finally {
				setIsDeleting(false)
			}
		}
	}

	const actions: TableRowAction<Category>[] = [
		{
			label: 'View Details',
			onClick: (category) => {
				router.push(`${CATEGORIES_URL}/${category.id}`)
			},
			actionType: 'view',
			requiredPermission: CATEGORY_PERMISSIONS.VIEW,
		},
		{
			label: ' Edit',
			onClick: (category) => {
				router.push(`${CATEGORIES_URL}/${category.id}/edit`)
			},
			actionType: 'edit',
			requiredPermission: CATEGORY_PERMISSIONS.CHANGE,
		},
		{
			label: 'Delete',
			onClick: openConfirmModel,
			actionType: 'delete',
			requiredPermission: CATEGORY_PERMISSIONS.DELETE,
		},
	]

	return (
		<PermissionGuard requiredPermission={CATEGORY_PERMISSIONS.VIEW}>
			<h1>Categories</h1>
			<CreateItemSection
				href={CREATE_CATEGORIES_URL}
				permission={CATEGORY_PERMISSIONS.ADD}
			>
				Create New Category
			</CreateItemSection>
			<DataTable
				data={categories}
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
				title='Confirm Delete Category'
				message={`Are you sure you want to delete ${deleteCategory?.name}`}
				confirmButtonText={isDeleting ? 'Deleting...' : 'Delete'}
				confirmButtonClass={
					isDeleting
						? 'bg-red-400 cursor-not-allowed'
						: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
				}
			/>
		</PermissionGuard>
	)
}
