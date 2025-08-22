'use client'

import React, { useCallback, useEffect, useState } from 'react'
import SpinnerSection from '@/components/ui/SpinnerSection'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import AIPromptStep from '@/components/ui/wizard-steps/AIPromptStep'
import productService from '@/lib/services/product'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { OptionType } from '@/types/form'
import { ProductAttributeSet } from '@/types/product'
import { StepComponentProps } from '@/types/wizard'
import ProductPromptHint from '@/app/products/ai-tools/steps/ProductPromptHint'

const ProductPromptStep = ({ setSubmitHandler }: StepComponentProps) => {
	const [isLoading, setIsLoading] = useState(true)
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
		setProductAttributeSet,
		setProducts,
	} = useAIToolsStore()

	useEffect(() => {
		setHasPromptHint(true)
	}, [setHasPromptHint])

	useEffect(() => {
		const fetchProductAttributeSets = async () => {
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
		fetchProductAttributeSets()
	}, [])

	useEffect(() => {
		setIsCurrentStepValid(
			prompt.trim().length > 6 && productAttributeSet !== null,
		)
	}, [prompt, productAttributeSet, setIsCurrentStepValid])

	const handleGenerate = useCallback(async (): Promise<boolean> => {
		const res = await productService.generate(
			productAttributeSet?.name as string,
			prompt,
		)
		console.log('res from ai:', res)
		setProducts(
			res.data.length > 0
				? res.data.map((p, idx) => ({
						...p,
						id: idx + 1,
					}))
				: [],
		)
		return true
	}, [productAttributeSet, prompt, setProducts])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading attribute set...' />
	}

	return (
		<AIPromptStep
			setSubmitHandler={setSubmitHandler}
			promptHintComponent={ProductPromptHint}
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
		</AIPromptStep>
	)
}

export default ProductPromptStep
