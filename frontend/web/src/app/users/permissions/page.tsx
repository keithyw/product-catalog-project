'use client'

import React, { useMemo } from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import DataTable from '@/components/ui/DataTable'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { PERMISSION_PERMISSIONS } from '@/lib/constants/permissions'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import permissionService from '@/lib/services/permission'
import { Permission } from '@/types/permission'
import { TableColumn } from '@/types/table'

const PERMISSION_COLUMNS: TableColumn<Permission>[] = [
	{
		header: 'ID',
		accessor: 'id',
		sortable: true,
	},
	{
		header: 'Permission Name',
		accessor: 'name',
		sortable: true,
	},
]

export default function PermissionListPage() {
	const {
		data: permissions,
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
	} = useDataTableController({
		initialSortField: 'name',
		defaultPageSize: DEFAULT_PAGE_SIZE,
		fetchData: permissionService.getPermissions,
	})

	const permissionColumns = useMemo(() => PERMISSION_COLUMNS, [])

	return (
		<PermissionGuard requiredPermission={PERMISSION_PERMISSIONS.VIEW}>
			<h1>Permissions</h1>
			<DataTable<Permission>
				data={permissions}
				columns={permissionColumns}
				rowKey='id'
				onSearch={handleSearch}
				searchTerm={searchTerm}
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
