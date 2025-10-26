'use client'

import React, { useCallback } from 'react'
import { useParams } from 'next/navigation'
import EditItemLayout from '@/components/layout/EditItemLayout'
import {
	ASSETS_URL,
	FAILED_LOADING_ASSETS_ERROR,
	PRODUCT_PERMISSIONS,
} from '@/lib/constants'
import { useEditItemController } from '@/lib/hooks/useEditItemController'
import assetService from '@/lib/services/assets'
import { getImageDimensions } from '@/lib/utils/image'
import { assetCreateSchema, AssetCreateFormData } from '@/schemas/assetSchema'
import { Asset, CreateAssetRequest } from '@/types/asset'
import { FormField } from '@/types/form'

const fields: FormField<AssetCreateFormData>[] = [
	{
		name: 'url',
		label: 'URL',
		placeholder: 'Enter URL',
		required: true,
	},
	{
		name: 'name',
		label: 'Name',
		placeholder: 'Enter name',
		required: false,
	},
	{
		name: 'type',
		label: 'Type',
		placeholder: 'Select a type',
		required: true,
		type: 'select',
		options: [
			{ value: 'image', label: 'Image' },
			{ value: 'video', label: 'Video' },
			{ value: 'audio', label: 'Audio' },
			{ value: 'pdf', label: 'PDF' },
			{ value: 'document', label: 'Document' },
		],
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'Enter description',
		required: false,
		type: 'textarea',
	},
]

// const urlField: FormField<AssetCreateFormData> = {
// 	name: 'url',
// 	label: 'URL',
// 	placeholder: 'Enter URL',
// 	required: true,
// }

const EditAssetPage = () => {
	const params = useParams()
	// const [mode, setMode] = useState<'url' | 'file'>('url')

	const {
		data: asset,
		isLoading,
		fieldErrors,
		isSubmitting,
		loadingError,
		register,
		control,
		handleSubmit,
	} = useEditItemController({
		id: parseInt(params.id as string),
		defaultValues: {
			url: '',
			name: '',
			type: '',
			description: '',
		},
		getData: assetService.get,
		updateData: assetService.update,
		errorLoadingMessage: FAILED_LOADING_ASSETS_ERROR,
		redirectUrl: ASSETS_URL,
		schema: assetCreateSchema,
		handleFetchCallback: useCallback((data: Asset) => {
			return {
				url: data.url,
				name: data.name,
				type: data.type,
				description: data.description,
			}
		}, []),
		transformData: async (data) => {
			let dimensions: string | null = null
			if (data.type.toLowerCase() === 'image') {
				dimensions = await getImageDimensions(data.url as string)
			}

			let extension = ''
			if (data.url) {
				const path = data.url.split('?')[0].split('#')[0]
				const lastDotIndex = path.lastIndexOf('.')
				extension =
					lastDotIndex > 0 && lastDotIndex < path.length - 1
						? path.substring(lastDotIndex + 1).toLowerCase()
						: ''
			}

			const req: CreateAssetRequest = {
				url: data.url,
				name: data.name,
				type: data.type,
				description: data.description,
				extension: extension,
				dimensions: dimensions,
			}
			return req
		},
	})

	return (
		<EditItemLayout
			permission={PRODUCT_PERMISSIONS.CHANGE}
			item={asset as Asset}
			title='Edit Asset'
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

export default EditAssetPage
