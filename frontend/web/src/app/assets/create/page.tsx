'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import Button from '@/components/ui/form/Button'
import FileUploadInput from '@/components/ui/form/FileUploadInput'
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

const urlField: FormField<AssetCreateFormData> = {
	name: 'url',
	label: 'URL',
	placeholder: 'Enter URL',
	required: true,
}

const CreateAssetPage = () => {
	const router = useRouter()
	const [mode, setMode] = useState<'url' | 'file'>('url')
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
		control,
		watch,
	} = useForm<AssetCreateFormData>({
		resolver: zodResolver(assetCreateSchema),
		defaultValues: {
			url: '',
			name: '',
			type: '',
			description: '',
		},
	})

	const watchedFile = watch('file')

	const onSubmit = async (data: AssetCreateFormData) => {
		let dimensions: string | null = null
		try {
			const req: CreateAssetRequest = {
				name: data.name,
				type: data.type,
				description: data.description,
			}
			if (mode === 'url' && data.url) {
				if (data.type.toLowerCase() === 'image') {
					dimensions = await getImageDimensions(data.url)
				}
				const path = data.url.split('?')[0].split('#')[0]
				const lastDotIndex = path.lastIndexOf('.')
				const extension =
					lastDotIndex > 0 && lastDotIndex < path.length - 1
						? path.substring(lastDotIndex + 1).toLowerCase()
						: ''
				Object.assign(req, {
					url: data.url,
					extension: extension,
					dimensions: dimensions,
				})
				await assetService.create(req)
			} else if (mode === 'file' && data.file) {
				await assetService.createWithFile({
					...req,
					file: data.file,
				})
			} else {
				return setError('url', {
					message: 'Must provide either a URL or a File.',
				})
			}
			toast.success(`Asset ${req.name} created successfully!`)
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
				<div className='flex justify-end space-x-2 mb-4'>
					<Button
						actionType={mode === 'url' ? 'view' : 'edit'}
						type='button'
						onClick={() => setMode('url')}
					>
						Use URL
					</Button>
					<Button
						actionType={mode === 'file' ? 'view' : 'edit'}
						type='button'
						onClick={() => setMode('file')}
					>
						Upload File
					</Button>
				</div>
				{mode === 'url' ? (
					<FormInput
						field={urlField}
						register={register}
						control={control}
						errorMessage={errors[urlField.name]?.message as string}
					/>
				) : (
					<Controller
						name='file'
						control={control}
						render={({ field: { onChange } }) => (
							<FileUploadInput
								label='Asset File'
								onChange={(file) => onChange(file)}
								currentFile={watchedFile as File | null}
							/>
						)}
					/>
				)}
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
