'use client'

import React, { useState, useEffect } from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import TextInput from '@/components/ui/form/TextInput'
import TextareaInput from '@/components/ui/form/TextareaInput'
import useAIToolsStore from '@/stores/useAIToolsStore'

interface ProductAttributePromptHintProps {
	onHandleSubmit: () => void
}

const ProductAttributePromptHint: React.FC<ProductAttributePromptHintProps> = ({
	onHandleSubmit,
}) => {
	// const [localPrompt, setLocalPrompt] = useState('')
	const [exampleAttributes, setExampleAttributes] = useState('')
	const [validationHint, setValidationHint] = useState('')
	const [multiselectHint, setMultiselectHint] = useState('')
	const { productAttributeSetName, setPrompt, setProductAttributeSetName } =
		useAIToolsStore()

	// Effect to generate the prompt string whenever local state changes
	useEffect(() => {
		// Start with a base prompt
		let generatedPrompt =
			`Generate a detailed list of product attributes for a ${productAttributeSetName || '[product_type]'}. ` +
			`The attributes should include the display name, sample values to provide hints to the AI, a unique snake_case code, a data type (e.g., text, number, boolean, multiselect), and specify if each is required.`

		// Add example attributes if provided
		if (exampleAttributes) {
			generatedPrompt += ` Suggest attributes like ${exampleAttributes}.`
		}

		// Add validation rules hint if provided
		if (validationHint) {
			generatedPrompt += ` ${validationHint}.`
		}

		// Add multiselect options hint if provided
		if (multiselectHint) {
			generatedPrompt += ` ${multiselectHint}.`
		}

		// Set the prompt in the global store
		setPrompt(generatedPrompt.trim())
	}, [
		productAttributeSetName,
		exampleAttributes,
		validationHint,
		multiselectHint,
		setPrompt,
	])

	const handleClearAndSubmit = () => {
		onHandleSubmit()
	}

	return (
		<div>
			<DialogTitle
				as='h3'
				className='text-lg font-medium leading-6 text-gray-900'
			>
				Hint: Build a detailed prompt for product attributes.
			</DialogTitle>
			<div className='mt-4 space-y-4'>
				<TextInput
					id='productType'
					label='Product Type'
					placeholder='e.g., "song", "computer monitor arm"'
					value={productAttributeSetName}
					onChange={(e) => setProductAttributeSetName(e.target.value)}
				/>
				<TextInput
					id='exampleAttributes'
					label='Example Attributes (comma separated)'
					placeholder='e.g., "song title", "artist name", "genre"'
					value={exampleAttributes}
					onChange={(e) => setExampleAttributes(e.target.value)}
				/>
				<TextareaInput
					id='validationHint'
					label='Validation Rules Hint'
					rows={3}
					placeholder='e.g., "For the `song_length` attribute, provide a validation rule for a minimum and maximum number of seconds."'
					value={validationHint}
					onChange={(e) => setValidationHint(e.target.value)}
				/>
				<TextareaInput
					id='multiselectHint'
					label='Multiselect Options Hint'
					rows={3}
					placeholder='e.g., "For the `genre` attribute, provide a multiselect with options like Pop, Rock, and Hip-Hop."'
					value={multiselectHint}
					onChange={(e) => setMultiselectHint(e.target.value)}
				/>
			</div>
			<div className='mt-4'>
				<p className='mb-2 py-4'>
					<span className='font-bold text-gray-900 mr-2'>
						Formatted Prompt:
					</span>
					<span className='text-gray-600'>
						{useAIToolsStore.getState().prompt}
					</span>
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

export default ProductAttributePromptHint
