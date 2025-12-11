import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import TextInput from '@/components/ui/form/TextInput'
import brandService from '@/lib/services/brand'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { ProductAttribute } from '@/types/product'

type AttributeValueMap = {
	[key: string]: string
}

interface ProductPromptHintProps {
	onHandleSubmit: () => void
}

const ProductPromptHint = ({ onHandleSubmit }: ProductPromptHintProps) => {
	const [allowedBrands, setAllowedBrands] = useState('')
	const [productNames, setProductNames] = useState('')
	const productAttributeSet = useAIToolsStore(
		(state) => state.productAttributeSet,
	)
	const setPrompt = useAIToolsStore((state) => state.setPrompt)
	const [attributeValuesMap, setAttributeValuesMap] =
		useState<AttributeValueMap>({})

	const filteredAttributes = useMemo(() => {
		if (!productAttributeSet?.attributes_detail) return []
		const attributes = productAttributeSet?.attributes_detail.filter((a) =>
			[
				'text',
				'textarea',
				'number',
				'select',
				'multiselect',
				'boolean',
			].includes(a.type),
		) as ProductAttribute[]
		const displayOrderAttributes = attributes
			.filter((a) => a.display_order !== null && a.display_order !== undefined)
			.sort((a, b) => (a.display_order as number) - (b.display_order as number))
			.slice(0, 5)

		const res =
			displayOrderAttributes.length >= 5
				? displayOrderAttributes
				: [
						...displayOrderAttributes,
						...attributes
							.filter((a) => !displayOrderAttributes.includes(a))
							.slice(0, 5 - displayOrderAttributes.length),
					]
		return res
	}, [productAttributeSet])

	useEffect(() => {
		const fetchBrands = async () => {
			try {
				const res = await brandService.fetch(1, 200)
				if (
					productAttributeSet?.product_type_brands &&
					productAttributeSet.product_type_brands.length > 0
				) {
					setAllowedBrands(
						res.results
							.filter((b) =>
								productAttributeSet.product_type_brands?.includes(
									b.id as number,
								),
							)
							.map((b) => b.name)
							.join(', '),
					)
				}
			} catch (e) {
				if (e instanceof Error) {
					console.error(e)
				}
			}
		}
		fetchBrands()
	}, [productAttributeSet])

	useEffect(() => {
		const m: AttributeValueMap = {}
		if (filteredAttributes) {
			filteredAttributes.forEach((attr) => {
				m[String(attr.id)] = attr.sample_values || ''
			})
			setAttributeValuesMap(m)
		}
	}, [filteredAttributes])

	const handleAttributeChange =
		(id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target
			setAttributeValuesMap((m) => ({
				...m,
				[id]: value,
			}))
		}

	const formattedPrompt = useMemo(() => {
		const attributesString = filteredAttributes.map((a) => a.name).join(', ')
		const samples = Object.entries(attributeValuesMap)
			.map(([id, value]) => {
				const attr = filteredAttributes.find((a) => a.id.toString() === id)
				if (attr && value) {
					return `${attr.name} examples: ${value}`
				}
				return ''
			})
			.filter(Boolean)
			.join('\n')
		const promptTemplate = `Generate a JSON object containing an array of 10 product items for the product type "${productAttributeSet?.name}". Each item should have a "name", "brand", and an "attributes" object. The "attributes" object must contain the following keys: ${attributesString}.
        
        The values for the keys in the "attributes" object must be one of the following examples:
        ${samples}

        Brand suggestions: ${allowedBrands || 'any brand'}.

        Product name suggestions: ${productNames || 'any product name'}.

        Do not include any text before or after the JSON object. Just return the raw JSON.
        `

		return promptTemplate
	}, [
		allowedBrands,
		attributeValuesMap,
		filteredAttributes,
		productAttributeSet,
		productNames,
	])

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
				Hint: Fill in as many attributes to provide hints to AI
			</DialogTitle>
			<div className='mt-2'>
				<TextInput
					id='productNames'
					label='Product Name Samples'
					placeholder='e.g. Galaxy Note10+,World of Warcraft'
					value={productNames}
					onChange={(e) => setProductNames(e.target.value)}
				/>
			</div>
			<div className='mt-4'>
				<TextInput
					id='allowed_brands'
					label='Allowed Brands'
					value={allowedBrands}
					onChange={(e) => setAllowedBrands(e.target.value)}
				/>
			</div>
			<div className='mt-4'>
				{filteredAttributes &&
					filteredAttributes.map((attr, idx) => (
						<Fragment key={idx}>
							<TextInput
								id={attr.id.toString()}
								label={attr.display_name || attr.name}
								placeholder={attr.sample_values as string}
								value={attributeValuesMap[attr.id.toString()] || ''}
								onChange={handleAttributeChange(attr.id.toString())}
							/>
						</Fragment>
					))}
			</div>
			<div className='mt-4'>
				<p className='mb-2 py-4'>
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

export default ProductPromptHint
