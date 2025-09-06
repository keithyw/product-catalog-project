import React, { useCallback, useEffect, useState } from 'react'
import Dropzone from 'react-dropzone'
import SpinnerSection from '@/components/ui/SpinnerSection'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import AIPromptStep from '@/components/ui/wizard-steps/AIPromptStep'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import productImageService from '@/lib/services/productImage'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { OptionType } from '@/types/form'
import { ProductAttributeSet } from '@/types/product'
import { StepComponentProps } from '@/types/wizard'
import ImagePromptHint from '@/app/products/from-image/steps/ImagePromptHint'

const ImagePromptStep = ({ setSubmitHandler }: StepComponentProps) => {
	const [isLoading, setIsLoading] = useState(false)
	const [files, setFiles] = useState<Blob[]>([])
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const [productAttributeSets, setProductAttributeSets] = useState<
		ProductAttributeSet[]
	>([])
	const [productAttributeSetOptions, setProductAttributeSetOptions] = useState<
		OptionType[]
	>([])

	const {
		prompt,
		productAttributeSet,
		isSubmitting,
		setHasPromptHint,
		setIsCurrentStepValid,
		setProducts,
		setProductAttributeSet,
	} = useAIToolsStore()

	useEffect(() => {
		setHasPromptHint(true)
	}, [setHasPromptHint])

	useEffect(() => {
		const fetchSets = async () => {
			setIsLoading(true)
			try {
				const res = await productAttributeSetService.fetch(1, 200)
				setProductAttributeSets(res.results)
				setProductAttributeSetOptions(
					[{ value: 0, label: 'Select an attribute set' }].concat(
						res.results
							.map((p) => ({ value: p.id, label: p.name }))
							.sort((a, b) =>
								a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
							),
					),
				)
			} catch (e) {
				if (e instanceof Error) {
					console.error(e.message)
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchSets()
	}, [])

	useEffect(() => {
		setIsCurrentStepValid(
			prompt.trim().length > 6 &&
				productAttributeSet !== null &&
				files.length > 0,
		)
	}, [files, prompt, productAttributeSet, setIsCurrentStepValid])

	useEffect(() => {
		URL.revokeObjectURL(previewImage as string)
	}, [previewImage])

	const handleImage = useCallback((acceptedFiles: Blob[]) => {
		setFiles(acceptedFiles)
		setPreviewImage(URL.createObjectURL(acceptedFiles[0]))
	}, [])

	const handleGenerate = useCallback(async (): Promise<boolean> => {
		const res = await productImageService.generate(
			productAttributeSet?.name as string,
			prompt,
			files[0],
		)
		console.log('res: ', res)
		setProducts([{ ...res.data, id: 1 }])
		return true
	}, [files, prompt, productAttributeSet, setProducts])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading attribute set...' />
	}

	return (
		<AIPromptStep
			setSubmitHandler={setSubmitHandler}
			promptHintComponent={ImagePromptHint}
			onGenerate={handleGenerate}
		>
			<SelectDropdown
				id='productAttributeSet'
				name='productAttributeSet'
				label='Choose a product attribute set'
				options={productAttributeSetOptions}
				selectedValue={String(productAttributeSet?.id) || null}
				onSelect={(v) =>
					setProductAttributeSet(
						productAttributeSets.find((p) => p.id === v) as ProductAttributeSet,
					)
				}
				disabled={isSubmitting}
			/>
			<Dropzone multiple={false} onDrop={(f) => handleImage(f)}>
				{({ getRootProps, getInputProps }) => (
					<div className='mt-2 rounded-lg shadow-md p-8'>
						<div {...getRootProps()}>
							<input {...getInputProps()} />
							<p className='font-bold text-gray-900'>
								Drag and Drop an Image for Analysis Here.
							</p>
						</div>
					</div>
				)}
			</Dropzone>
			{previewImage && (
				<aside className='flex flex-row flex-wrap mt-4'>
					<div className='inline-flex rounded-sm border-gray-200 mb-2 mr-2 w-25 h-25 p-1 box-border'>
						<div className='flex min-w-0 overflow-hidden'>
							<img
								alt='preview image'
								src={previewImage as string}
								className='block w-auto h-full'
								onLoad={() => URL.revokeObjectURL(previewImage)}
							/>
						</div>
					</div>
				</aside>
			)}
		</AIPromptStep>
	)
}

export default ImagePromptStep
