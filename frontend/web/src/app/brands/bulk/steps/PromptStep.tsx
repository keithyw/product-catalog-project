import React, { useEffect, useState } from 'react'
import SpinnerSection from '@/components/ui/SpinnerSection'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import brandService from '@/lib/services/brand'
import categoryService from '@/lib/services/category'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { OptionType } from '@/types/form'
import { StepComponentProps } from '@/types/wizard'

const PromptStep = ({ setSubmitHandler }: StepComponentProps) => {
	const [isLoading, setIsLoading] = useState(false)
	const [categories, setCategories] = useState<OptionType[]>([])
	const [productTypes, setProductTypes] = useState<OptionType[]>([])
	const [category, setCategory] = useState<number | null>(null)
	const [productAttributeSet, setProductAttributeSet] = useState<number | null>(
		null,
	)

	const { setBrands, setIsCurrentStepValid, setIsSubmitting } =
		useAIToolsStore()

	useEffect(() => {
		if (category && productAttributeSet) {
			setIsCurrentStepValid(true)
		}
	}, [category, productAttributeSet, setIsCurrentStepValid])

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			try {
				const [categories, productTypes] = await Promise.all([
					categoryService.fetch(1, 1000),
					productAttributeSetService.fetch(1, 200),
				])
				setCategories(
					categories.results.map((c) => ({
						value: c.id,
						label: c.name,
					})),
				)
				setProductTypes(
					productTypes.results.map((p) => ({
						value: p.id,
						label: p.name,
					})),
				)
			} catch (e: unknown) {
				console.error(e)
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			setIsSubmitting(true)
			try {
				const res = await brandService.generate(
					category as number,
					productAttributeSet as number,
				)
				setBrands(
					res.length > 0
						? res.map((b, idx) => ({
								...b,
								id: (idx + 1) as number,
							}))
						: [],
				)
				return true
			} catch (e: unknown) {
				console.error(e)
				return false
			} finally {
				setIsSubmitting(false)
				return true
			}
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [
		category,
		productAttributeSet,
		setBrands,
		setIsSubmitting,
		setSubmitHandler,
	])

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading data...' />
	}

	return (
		<div className='space-y-4'>
			<p className='text-gray-900 '>
				Select a product type and category to provide hints for the AI to find
				brands.
			</p>
			<SelectDropdown
				id='productAttributeSet'
				name='productAttributeSet'
				label='Choose a product type'
				options={productTypes}
				selectedValue={productAttributeSet}
				onSelect={(v) => setProductAttributeSet(v as number)}
			/>
			<SelectDropdown
				id='category'
				name='category'
				label='Choose a category'
				options={categories}
				selectedValue={category}
				onSelect={(v) => setCategory(v as number)}
			/>
		</div>
	)
}

export default PromptStep
