import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { PhotoIcon } from '@heroicons/react/24/outline'
import assetService from '@/lib/services/assets'
import assetAssociationService from '@/lib/services/assetAssociation'
import useProductStore from '@/stores/useProductStore'
import { Asset } from '@/types/asset'
import { FilterParams } from '@/types/filters'
import { StepComponentProps } from '@/types/wizard'
import AssetFormSection from './AssetFormSection'
import AssetRow from './AssetRow'

const ImageAssociationStep: React.FC<StepComponentProps> = ({
	setSubmitHandler,
}) => {
	const {
		assets,
		assetAssociations,
		isSubmitting,
		product,
		setAssets,
		setAssetAssociations,
		setIsCurrentStepValid,
		setIsSubmitting,
	} = useProductStore()

	useEffect(() => {
		// we do this because this step is optional
		setIsCurrentStepValid(true)
	}, [setIsCurrentStepValid])

	useEffect(() => {
		const fetchImages = async () => {
			try {
				const filters: FilterParams = {
					entity: 'Product',
					entity_id: product?.id,
				}
				const productImages = await assetAssociationService.fetch(
					1,
					200,
					'',
					'',
					filters,
				)
				setAssetAssociations(productImages.results)
				const imagePromises = productImages.results.map((p) =>
					assetService.get(p.asset),
				)
				const images = await Promise.all(imagePromises)
				setAssets(images)
			} catch (e: unknown) {
				console.error(e)
			}
		}
		fetchImages()
	}, [product, setAssets, setAssetAssociations])

	const handleRemove = async (asset: Asset) => {
		setIsSubmitting(true)
		const association = assetAssociations.find((a) => a.asset === asset.id)
		try {
			await assetAssociationService.delete(association?.id as number)
			const newAssocations = assetAssociations.filter(
				(a) => a.id !== (association?.id as number),
			)
			setAssetAssociations(newAssocations)
			await assetService.delete(asset.id)
			const newAssets = assets.filter((a) => a.id !== asset.id)
			setAssets(newAssets)
			toast.success('Image removed')
		} catch (e: unknown) {
			console.error(e)
		} finally {
			setIsSubmitting(false)
		}
	}

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			return true
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [setSubmitHandler])

	return (
		<div className='space-y-4'>
			{assets.length > 0 ? (
				<div className='p-5 border rounded-lg bg-gray-50'>
					<h3 className='text-lg font-semibold text-gray-800 mb-4'>
						Linked Images
					</h3>
					<div className='space-y-3'>
						{assets.map((a) => (
							<AssetRow
								key={a.id}
								asset={a}
								isSubmitting={isSubmitting}
								onRemove={handleRemove}
							/>
						))}
					</div>
				</div>
			) : (
				<div className='p-5 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center'>
					<PhotoIcon className='mx-auto h-12 w-12 text-gray-400' />
					<h3 className='mt-2 text-md font-medium text-gray-900'>
						No Saved Images
					</h3>
					<p className='mt-1 text-sm text-gray-500'>
						Images are optional. Use the **New Asset Entry** form below and
						click Save Image to link your first image, or click **Skip Images
						and Finish** to complete the product without assets.
					</p>
				</div>
			)}
			<h2 className='text-xl font-bold text-gray-800 mb-4'>Provide Images</h2>
			<AssetFormSection />
		</div>
	)
}

export default ImageAssociationStep
