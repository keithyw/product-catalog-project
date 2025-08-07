'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import TextareaInput from '@/components/ui/form/TextareaInput'
import {
	ENTITY_BRAND,
	ENTITY_CATEGORY,
	ENTITY_PRODUCT_ATTIBUTE,
} from '@/lib/constants'
import aiToolsService, { AIServiceException } from '@/lib/services/aiTools'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { OptionType } from '@/types/form'
import { StepComponentProps } from '@/types/wizard'
import { SimpleCategory } from '@/types/ai'

const PromptStep: React.FC<StepComponentProps> = ({ setSubmitHandler }) => {
	const {
		prompt,
		entityType,
		isCurrentStepValid,
		isSubmitting,
		setPrompt,
		setEntityType,
		setBrands,
		setCategories,
		setError,
		setIsCurrentStepValid,
		setIsSubmitting,
	} = useAIToolsStore()

	const entityTypeOptions: OptionType[] = useMemo(
		() => [
			{ value: ENTITY_BRAND, label: 'Brands' },
			{ value: ENTITY_CATEGORY, label: 'Categories' },
			{ value: ENTITY_PRODUCT_ATTIBUTE, label: 'Product Attributes' },
		],
		[],
	)

	const assignIdsToCategories = useCallback(
		(
			categories: SimpleCategory[],
			counter = { value: 0 },
		): SimpleCategory[] => {
			return categories.map((category) => {
				const updatedCategory = { ...category, id: counter.value++ }
				if (category.children && category.children.length > 0) {
					updatedCategory.children = assignIdsToCategories(
						category.children,
						counter,
					)
				}
				return updatedCategory
			})
		},
		[],
	)

	useEffect(() => {
		setIsCurrentStepValid(prompt.trim().length > 6)
	}, [prompt, setIsCurrentStepValid])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			let isValid = false
			let res = null
			setIsSubmitting(true)
			setIsCurrentStepValid(isValid)
			try {
				switch (entityType) {
					case ENTITY_BRAND:
						res = await aiToolsService.generateBrands(prompt)
						setBrands(
							res?.data && res.data.length > 0
								? res.data.map((b, bidx) => ({
										...b,
										id: bidx + 1,
									}))
								: [],
						)
						break
					case ENTITY_CATEGORY:
						res = await aiToolsService.generateCategories(prompt)
						setCategories(
							res?.data && res.data.length > 0
								? assignIdsToCategories(res.data)
								: [],
						)
						break
				}
				isValid = res?.data && res.data.length > 0 ? true : false
				setIsCurrentStepValid(isValid)
			} catch (e: unknown) {
				setIsCurrentStepValid(false)
				if (e instanceof AIServiceException) {
					console.error('AIServiceException ' + e.message)
					setError(e.message)
				} else if (e instanceof Error) {
					console.error('generic error ', e.message)
					setError(e.message)
				}
			} finally {
				setIsSubmitting(false)
			}
			return isValid
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [
		assignIdsToCategories,
		entityType,
		prompt,
		isCurrentStepValid,
		setBrands,
		setCategories,
		setError,
		setIsCurrentStepValid,
		setIsSubmitting,
		setSubmitHandler,
	])

	return (
		<div className='space-y-6 p-4'>
			<SelectDropdown
				id='entityType'
				name='entityType'
				label='Choose a type of data to generate'
				options={entityTypeOptions}
				selectedValue={entityType}
				onSelect={(v) => setEntityType(v as string)}
				placeholder='Select a data type'
				disabled={isSubmitting}
			/>
			<TextareaInput
				id='prompt'
				label='Generate content for: '
				placeholder='e.g., "Generate a list of 5 popular 80s toy robot brands, including their names and a brief description for each.'
				value={prompt}
				rows={6}
				className='min-h-[120px] resize-y'
				onChange={(e) => setPrompt(e.target.value)}
				disabled={isSubmitting || !entityType}
			/>
			{!entityType && (
				<p className='text-sm text-red-500'>
					Please select a data type to enable prompt
				</p>
			)}
		</div>
	)
}

export default PromptStep
