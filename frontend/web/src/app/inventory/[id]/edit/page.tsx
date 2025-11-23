'use client'

import React, { useCallback } from 'react'
import { useParams } from 'next/navigation'
import EditItemLayout from '@/components/layout/EditItemLayout'
import {
	FAILED_LOADING_INVENTORY_ERROR,
	INVENTORY_URL,
	PRODUCT_PERMISSIONS,
} from '@/lib/constants'
import { useEditItemController } from '@/lib/hooks/useEditItemController'
import inventoryService from '@/lib/services/inventory'
import {
	InventoryItemEditFormData,
	inventoryItemEditSchema,
} from '@/schemas/inventorySchema'
import { FormField } from '@/types/form'
import { CreateInventoryItemRequest, InventoryItem } from '@/types/inventory'

const fields: FormField<InventoryItemEditFormData>[] = [
	{
		name: 'sku',
		label: 'SKU',
		placeholder: 'Enter SKU',
		required: true,
	},
	{
		name: 'quantity',
		label: 'Quantity',
		placeholder: 'Enter quantity',
		required: true,
		type: 'number',
	},
	{
		name: 'reserved',
		label: 'Reserved',
		placeholder: 'Enter reserved quantity',
		required: true,
		type: 'number',
	},
	{
		name: 'low_stock_threshold',
		label: 'Low Stock Threshold',
		placeholder: 'Enter low stock threshold',
		required: true,
		type: 'number',
	},
]

const InventoryEditPage = () => {
	const params = useParams()
	const id = parseInt(params.id as string)

	const handleFetchCallback = useCallback(
		(data: InventoryItem) => ({
			sku: data.sku || '',
			quantity: data.quantity || 0,
			reserved: data.reserved || 0,
			low_stock_threshold: data.low_stock_threshold || 0,
		}),
		[],
	)

	const transformData = useCallback(
		async (data: InventoryItemEditFormData) => ({
			sku: data.sku,
			quantity: data.quantity,
			reserved: data.reserved,
			low_stock_threshold: data.low_stock_threshold,
		}),
		[],
	)

	const {
		data,
		isLoading,
		fieldErrors,
		isSubmitting,
		loadingError,
		register,
		control,
		handleSubmit,
	} = useEditItemController<
		InventoryItem,
		Partial<CreateInventoryItemRequest>,
		typeof inventoryItemEditSchema
	>({
		id,
		getData: inventoryService.get,
		updateData: inventoryService.patch,
		errorLoadingMessage: FAILED_LOADING_INVENTORY_ERROR,
		redirectUrl: INVENTORY_URL,
		schema: inventoryItemEditSchema,
		handleFetchCallback,
		transformData,
	})

	return (
		<EditItemLayout
			permission={PRODUCT_PERMISSIONS.CHANGE}
			item={data as InventoryItemEditFormData}
			title='Edit Inventory Item'
			fields={fields}
			isLoading={isLoading}
			isSubmitting={isSubmitting}
			loadingError={loadingError}
			handleSubmit={handleSubmit}
			register={register}
			control={control}
			errors={fieldErrors}
		/>
	)
}

export default InventoryEditPage
