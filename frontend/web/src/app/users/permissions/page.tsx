'use client'

import React, { useEffect, useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import SpinnerSection from '@/components/ui/SpinnerSection'
import permissionService from '@/lib/services/permission'
import usePermissionStore from '@/stores/usePermissionStore'
import { Permission } from '@/types/permission'
import { TableColumn } from '@/types/table'
import toast from 'react-hot-toast'

export default function PermissionListPage() {
	const [isLoading, setIsLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const setPermissions = usePermissionStore((state) => state.setPermissions)
	const permissions = usePermissionStore((state) => state.permissions)

	const permissionColumns: TableColumn<Permission>[] = [
		{
			header: 'ID',
			accessor: 'id',
		},
		{
			header: 'Permission Name',
			accessor: 'name',
		},
	]

	useEffect(() => {
		setIsLoading(true)
		const loadPermissions = async () => {
			try {
				const perms = await permissionService.getPermissions()
				if (perms) {
					setPermissions(perms.results || [])
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
	}, [setPermissions])

	const handleSearch = (term: string) => {
		setSearchTerm(term)
	}

	const filteredPermssions = permissions.filter((perm) =>
		perm.name.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	return (
		<>
			<h1>Permissions</h1>
			{isLoading ? (
				<SpinnerSection spinnerMessage='Loading permissions...' />
			) : (
				<DataTable
					data={filteredPermssions}
					columns={permissionColumns}
					rowKey='id'
					onSearch={handleSearch}
					searchTerm={searchTerm}
				/>
			)}
		</>
	)
}
