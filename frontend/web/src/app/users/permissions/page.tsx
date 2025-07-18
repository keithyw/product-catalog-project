'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import permissionService from '@/lib/services/permission'
import usePermissionStore from '@/stores/usePermissionStore'
import { Permission } from '@/types/permission'
import { TableColumn } from '@/types/table'
import toast from 'react-hot-toast'

const PERMISSION_COLUMNS: TableColumn<Permission>[] = [
	{
		header: 'ID',
		accessor: 'id',
	},
	{
		header: 'Permission Name',
		accessor: 'name',
	},
]

export default function PermissionListPage() {
	const [isLoading, setIsLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const setPermissions = usePermissionStore((state) => state.setPermissions)
	const permissions = usePermissionStore((state) => state.permissions)

	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const permissionColumns = useMemo(() => PERMISSION_COLUMNS, [])

	useEffect(() => {
		setIsLoading(true)
		const loadPermissions = async () => {
			try {
				const perms = await permissionService.getPermissions(
					currentPage,
					pageSize,
				)
				if (perms) {
					setPermissions(perms.results || [])
					setTotalCount(perms.count)
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(`Failed to load permissions: ${e.message}`)
				}
			} finally {
				setIsLoading(false)
			}
		}
		loadPermissions()
	}, [currentPage, pageSize, setPermissions])

	const handleSearch = (term: string) => {
		setSearchTerm(term)
	}

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page)
	}, [])

	const handlePageSizeChange = useCallback(
		(size: number) => {
			setPageSize(size)
			void handlePageChange(1)
		},
		[handlePageChange],
	)

	const filteredPermssions = permissions.filter((perm) =>
		perm.name.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	return (
		<>
			<h1>Permissions</h1>
			<DataTable<Permission>
				data={filteredPermssions}
				columns={permissionColumns}
				rowKey='id'
				onSearch={handleSearch}
				searchTerm={searchTerm}
				currentPage={currentPage}
				pageSize={pageSize}
				totalCount={totalCount}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
				isLoadingRows={isLoading}
			/>
		</>
	)
}
