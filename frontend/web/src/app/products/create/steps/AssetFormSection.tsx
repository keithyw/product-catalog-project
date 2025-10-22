import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '@/components/ui/form/FormInput'
import SubmitButton from '@/components/ui/form/SubmitButton'
import assetService from '@/lib/services/assets'
import assetAssociationService from '@/lib/services/assetAssociation'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { getImageDimensions, getExtension } from '@/lib/utils/image'
import useProductStore from '@/stores/useProductStore'
import { imageCreateSchema, ImageCreateFormData } from '@/schemas/assetSchema'
import {
	CreateAssetRequest,
	CreateAssetAssociationRequest,
} from '@/types/asset'
import { FormField } from '@/types/form'

const fields: FormField<ImageCreateFormData>[] = [
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
		name: 'description',
		label: 'Description',
		placeholder: 'Enter description',
		required: false,
		type: 'textarea',
	},
]

const AssetFormSection = () => {
	const {
		assets,
		assetAssociations,
		product,
		setAssets,
		setAssetAssociations,
		setIsSubmitting,
	} = useProductStore()
	const {
		register,
		formState: { errors, isSubmitting },
		handleSubmit,
		reset,
		setError,
		control,
	} = useForm<ImageCreateFormData>({
		resolver: zodResolver(imageCreateSchema),
		defaultValues: {
			url: '',
			name: '',
			description: '',
		},
	})

	const onSubmit = async (data: ImageCreateFormData) => {
		setIsSubmitting(true)
		try {
			const dimensions = await getImageDimensions(data.url)
			const extension = getExtension(data.url)
			const req: CreateAssetRequest = {
				url: data.url,
				name: data.name,
				type: 'image',
				description: data.description,
				extension: extension,
				dimensions: dimensions,
			}
			const asset = await assetService.create(req)
			const newAssets = assets
			newAssets.push(asset)
			setAssets(newAssets)
			const associationReq: CreateAssetAssociationRequest = {
				asset: asset.id,
				entity: 'Product',
				entity_id: parseInt(product?.id as string),
			}
			const association = await assetAssociationService.create(associationReq)
			const newAssociations = assetAssociations
			newAssociations.push(association)
			setAssetAssociations(newAssociations)
			reset()
			toast.success(`Image Created`)
		} catch (e: unknown) {
			handleFormErrors<ImageCreateFormData>(e, setError, 'Failed saving image')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='p-4 border border-gray-200 rounded-lg shadow-sm bg-white'>
			<div className='flex items-start space-x-4'>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					{fields.map((f, idx) => (
						<FormInput
							key={idx}
							field={f}
							register={register}
							control={control}
							errorMessage={errors[f.name]?.message as string}
						/>
					))}
					<SubmitButton disabled={isSubmitting}>
						{isSubmitting ? 'Saving' : 'Save'}
					</SubmitButton>
				</form>
			</div>
		</div>
	)
}

export default AssetFormSection
