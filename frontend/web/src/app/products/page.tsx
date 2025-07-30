'use client'

import React, { useMemo } from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateItemSection from '@/components/layout/CreateItemSection'
import DataTable from '@/components/ui/DataTable'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { CREATE_PRODUCT_URL, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import productService from '@/lib/services/product'
import { Product } from '@/types/product'
import { TableColumn, TableRowAction } from '@/types/table'

const COLS: TableColumn<Product>[] = [
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

export default function ProductsPage() {
	const productActions: TableRowAction<Product>[] = [
		{
			label: 'Edit',
			onClick: (product) => {
				console.log('Editing ', product.id)
			},
			className: 'bg-blue-500 hover:bg-blue-600',
		},
		{
			label: 'Delete',
			onClick: (product) => {
				console.log('Deleting ', product.id)
			},
			className: 'bg-red-500 hover:bg-red-600',
		},
	]

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
		// loadData,
	} = useDataTableController({
		initialSortField: 'name',
		defaultPageSize: DEFAULT_PAGE_SIZE,
		fetchData: productService.fetch,
	})

	const cols = useMemo(() => COLS, [])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading products...' />
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.VIEW}>
			<h1>Products</h1>
			<CreateItemSection
				href={CREATE_PRODUCT_URL}
				permission={PRODUCT_PERMISSIONS.ADD}
			>
				Create New Product
			</CreateItemSection>
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
			/>
		</PermissionGuard>
	)
}
