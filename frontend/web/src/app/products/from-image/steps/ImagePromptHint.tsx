import React, { useMemo } from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { ProductAttribute } from '@/types/product'

interface ImagePromptHintProps {
	onHandleSubmit: () => void
}

const ImagePromptHint = ({ onHandleSubmit }: ImagePromptHintProps) => {
	const productAttributeSet = useAIToolsStore(
		(state) => state.productAttributeSet,
	)
	const setPrompt = useAIToolsStore((state) => state.setPrompt)

	const filteredAttributes = useMemo(() => {
		if (!productAttributeSet?.attributes_detail) return []
		return productAttributeSet?.attributes_detail.filter((a) =>
			[
				'text',
				'textarea',
				'number',
				'select',
				'multiselect',
				'boolean',
			].includes(a.type),
		) as ProductAttribute[]
	}, [productAttributeSet])

	const formattedPrompt = useMemo(() => {
		const attributes = filteredAttributes.map((a) => `"${a.name}"`).join(', ')
		const promptTemplate = `Identify the "${productAttributeSet?.name as string}" product in this image by filling in the product information.

        Attempt to define the product's name, brand and following attributes ${attributes}.
        `
		return promptTemplate
	}, [filteredAttributes, productAttributeSet])

	const handleClearAndSubmit = () => {
		setPrompt(formattedPrompt)
		onHandleSubmit()
	}

	if (!productAttributeSet) {
		return <p className='text-red-500'>Product Attribute Set not selected</p>
	}

	return (
		<div>
			<DialogTitle
				as='h3'
				className='text-lg font-medium leading-6 text-gray-900'
			>
				Hint:
			</DialogTitle>
			<div className='mt-4'>
				<p>
					<span className='font-bold text-gray-900 mr-2'>
						Formatted Prompt:
					</span>
					<span className='text-gray-900'>{formattedPrompt}</span>
				</p>
			</div>
			<div className='mt-4 flex justify-end'>
				<Button actionType='submit' onClick={handleClearAndSubmit}>
					Done
				</Button>
			</div>
		</div>
	)
}

export default ImagePromptHint
