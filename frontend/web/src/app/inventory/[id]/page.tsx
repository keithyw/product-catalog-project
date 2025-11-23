'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import DetailsContainer from '@/components/ui/DetailsContainer'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import ViewDetailsTable from '@/components/ui/ViewDetailsTable'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import { PRODUCT_PERMISSIONS, INVENTORY_URL } from '@/lib/constants'
import inventoryService from '@/lib/services/inventory'
import { InventoryItem } from '@/types/inventory'

const InventoryPage = () => {
	const params = useParams()
	const router = useRouter()
	const id = params.id
	const [isLoading, setIsLoading] = useState(false)
	const [showConfirmationModal, setShowConfirmationModal] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [inventory, setInventory] = useState<InventoryItem | null>(null)
	const [details, setDetails] = useState<DetailSectionRow[]>([])

	useEffect(() => {
		if (id) {
			const fetchData = async () => {
				setIsLoading(true)
				try {
					const res = await inventoryService.get(parseInt(id as string))
					setInventory(res)
					setDetails([
						{ label: 'Product Name', value: res?.product_name || '' },
						{ label: 'SKU', value: res?.sku || '' },
						{ label: 'Quantity', value: res?.quantity?.toString() || '' },
						{ label: 'Reserved', value: res?.reserved?.toString() || '' },
						{
							label: 'Low Stock Threshold',
							value: res?.low_stock_threshold?.toString() || '',
						},
						{ label: 'Is Active', value: res?.is_active?.toString() || '' },
						{
							label: 'Created At',
							value: new Date(res?.created_at || '').toLocaleString(),
						},
						{
							label: 'Updated At',
							value: new Date(res?.updated_at || '').toLocaleString(),
						},
					])
				} catch (e: unknown) {
					if (e instanceof Error) {
						setError(e.message)
						toast.error(e.message)
						router.push(INVENTORY_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchData()
		}
	}, [id, router])

	const handleDeleteConfirm = async () => {
		if (inventory) {
			try {
				await inventoryService.delete(inventory.id as number)
				toast.success(
					`Inventory ${inventory.product_name} deleted successfully`,
				)
				router.push(INVENTORY_URL)
			} catch (e: unknown) {
				console.error('Failed deleting inventory: ', e)
				toast.error(`Failed to delete inventory ${inventory.product_name}`)
				setShowConfirmationModal(false)
			}
		}
	}

	const buttons = (
		<>
			<Button
				actionType='edit'
				onClick={() => router.push(`${INVENTORY_URL}/${id}/edit`)}
			>
				Edit
			</Button>
			<Button
				actionType='delete'
				onClick={() => setShowConfirmationModal(true)}
			>
				Delete
			</Button>
		</>
	)

	const confirmationModal = (
		<ConfirmationModal
			title='Delete Inventory'
			message='Are you sure you want to delete this inventory item?'
			isOpen={showConfirmationModal}
			onConfirm={() => handleDeleteConfirm()}
			onClose={() => setShowConfirmationModal(false)}
		/>
	)
	return (
		<DetailsContainer
			title='Inventory'
			permission={PRODUCT_PERMISSIONS.VIEW}
			isLoading={isLoading}
			error={error}
			buttonsChildren={buttons}
			confirmationModal={confirmationModal}
		>
			{inventory && <DetailSection rows={details} />}
			{inventory?.attributes_data && (
				<ViewDetailsTable
					data={Object.keys(inventory?.attributes_data || {}).map((key) => ({
						attribute: key,
						value: inventory?.attributes_data?.[key],
					}))}
					columns={[
						{ header: 'Attribute', accessor: 'attribute' },
						{ header: 'Value', accessor: 'value' },
					]}
					rowKey='attribute'
				/>
			)}
		</DetailsContainer>
	)
}

export default InventoryPage
