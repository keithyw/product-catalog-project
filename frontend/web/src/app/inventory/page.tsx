'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateItemSection from '@/components/layout/CreateItemSection'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import DataTable from '@/components/ui/DataTable'
import PageTitle from '@/components/ui/PageTitle'
import { DEFAULT_PAGE_SIZE, CREATE_INVENTORY_URL, INVENTORY_URL, PRODUCT_PERMISSIONS } from '@/lib/constants'
import { useDataTableController } from '@/lib/hooks/useDataTableController'
import inventoryService from '@/lib/services/inventory'
import { InventoryItem } from '@/types/inventory'
import { TableColumn, TableRowAction } from '@/types/table'

const COLS: TableColumn<InventoryItem>[] = [
    {
        header: 'ID',
        accessor: 'id',
        sortable: true,
    },
    {
        header: 'Product Name',
        accessor: 'product_name',
        sortable: true,
    },
    {
        header: 'SKU',
        accessor: 'sku',
        sortable: true,
    },
    {
        header: 'Quantity',
        accessor: 'quantity',
        sortable: false,
    },
]

const InventoryPage = () => {
    const router = useRouter()
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [deleteInventoryItem, setDeleteInventoryItem] = useState<InventoryItem | null>(
        null,
    )
    const [isDeleting, setIsDeleting] = useState(false)

    const {
        data: inventoryItems,
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
        fetchData: inventoryService.fetch,
    })

    const cols = useMemo(() => COLS, [])

    const openConfirmModal = (inventoryItem: InventoryItem) => {
        setDeleteInventoryItem(inventoryItem)
        setIsConfirmModalOpen(true)
    }

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false)
        setDeleteInventoryItem(null)
    }

    const handleDelete = async () => {
        if (deleteInventoryItem) {
            setIsDeleting(true)
            try {
                await inventoryService.delete(deleteInventoryItem.id)
                toast.success(`Inventory item ${deleteInventoryItem.product_name} deleted successfully`)
                loadData()
                closeConfirmModal()
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error(e.message)
                    toast.error(`Failed to delete inventory item: ${e.message}`)
                    closeConfirmModal()
                }
            } finally {
                setIsDeleting(false)
            }
        }
    }

    const actions: TableRowAction<InventoryItem>[] = [
        {
            label: 'View Details',
            onClick: (inventoryItem) => {
                router.push(`${INVENTORY_URL}/${inventoryItem.id}`)
            },
            actionType: 'view',
            requiredPermission: PRODUCT_PERMISSIONS.VIEW,
        },
        {
            label: 'Edit',
            onClick: (inventoryItem) => {
                router.push(`${INVENTORY_URL}/${inventoryItem.id}/edit`)
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
                Inventory
            </PageTitle>
            <CreateItemSection
                permission={PRODUCT_PERMISSIONS.ADD}
                href={CREATE_INVENTORY_URL}
            >
                Create New Inventory Item
            </CreateItemSection>
            <DataTable
                data={inventoryItems}
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
                title='Confirm Delete Inventory Item'
                message={`Are you sure you want to delete "${deleteInventoryItem?.product_name}"?`}
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

export default InventoryPage
