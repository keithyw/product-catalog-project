'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/form/FormInput'
import { ASSETS_URL, PRODUCT_PERMISSIONS } from '@/lib/constants'
import assetService from '@/lib/services/assets'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { getImageDimensions } from '@/lib/utils/image'
import { assetCreateSchema, AssetCreateFormData } from '@/schemas/assetSchema'
import { CreateAssetRequest } from '@/types/asset'
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

const CreateAssetPage = () => {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
		control,
	} = useForm<AssetCreateFormData>({
		resolver: zodResolver(assetCreateSchema),
		defaultValues: {
			url: '',
			name: '',
			type: '',
			description: '',
		},
	})

	const onSubmit = async (data: AssetCreateFormData) => {
		try {
			// Get image dimensions if the asset type is 'image'.
			let dimensions: string | null = null
			if (data.type.toLowerCase() === 'image') {
				dimensions = await getImageDimensions(data.url)
			}

			const path = data.url.split('?')[0].split('#')[0]
			const lastDotIndex = path.lastIndexOf('.')
			const extension =
				lastDotIndex > 0 && lastDotIndex < path.length - 1
					? path.substring(lastDotIndex + 1).toLowerCase()
					: ''
			const req: CreateAssetRequest = {
				url: data.url,
				name: data.name,
				type: data.type,
				description: data.description,
				extension: extension,
				dimensions: dimensions,
			}
			const res = await assetService.create(req)
			toast.success(`Asset ${res.name} created successfully!`)
			reset()
			router.push(ASSETS_URL)
		} catch (e: unknown) {
			handleFormErrors<AssetCreateFormData>(
				e,
				setError,
				'Failed to create asset. Please review your input.',
			)
		}
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.ADD}>
			<CreateFormLayout
				title='Create New Asset'
				isSubmitting={isSubmitting}
				submitText='Create'
				submittingText='Creating...'
				handleSubmit={handleSubmit(onSubmit)}
			>
				{fields.map((f, idx) => (
					<FormInput
						key={idx}
						field={f}
						register={register}
						control={control}
						errorMessage={errors[f.name]?.message as string}
					/>
				))}
			</CreateFormLayout>
		</PermissionGuard>
	)
}

export default CreateAssetPage
