'use client'

import React, { ComponentType, useCallback, useEffect } from 'react'
import TextInput from '@/components/ui/form/TextInput'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import AIPromptStep from '@/components/ui/wizard-steps/AIPromptStep'
import {
	ENTITY_BRAND,
	ENTITY_CATEGORY,
	ENTITY_PRODUCT_ATTRIBUTE,
} from '@/lib/constants'
import aiToolsService from '@/lib/services/aiTools'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { OptionType } from '@/types/form'
import { StepComponentProps } from '@/types/wizard'
import { SimpleBrand, SimpleCategory, SimpleProductAttribute } from '@/types/ai'
import BrandPromptHint from '@/app/ai-tools/steps/BrandPromptHint'
import CategoryPromptHint from '@/app/ai-tools/steps/CategoryPromptHint'
import ProductAttributePromptHint from '@/app/ai-tools/steps/ProductAttributePromptHint'

const entityTypeOptions: OptionType[] = [
	{ value: ENTITY_BRAND, label: 'Brands' },
	{ value: ENTITY_CATEGORY, label: 'Categories' },
	{ value: ENTITY_PRODUCT_ATTRIBUTE, label: 'Product Attributes' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const entityPromptHints: Record<string, ComponentType<any>> = {
	[ENTITY_BRAND]: BrandPromptHint,
	[ENTITY_CATEGORY]: CategoryPromptHint,
	[ENTITY_PRODUCT_ATTRIBUTE]: ProductAttributePromptHint,
}

const PromptStep = ({ setSubmitHandler }: StepComponentProps) => {
	const {
		entityType,
		isSubmitting,
		prompt,
		setBrands,
		setCategories,
		setEntityType,
		setProductAttributes,
		setProductAttributeSetName,
		setHasPromptHint,
		setIsCurrentStepValid,
		setIsPromptDisabled,
	} = useAIToolsStore()
	const productAttributeSetName = useAIToolsStore(
		(state) => state.productAttributeSetName,
	)
	const PromptHintComponent = entityPromptHints[entityType]

	useEffect(() => {
		setHasPromptHint(true)
		setIsPromptDisabled(entityType === '' ? true : false)
	}, [setIsPromptDisabled, setHasPromptHint, entityType])

	useEffect(() => {
		if (entityType === ENTITY_PRODUCT_ATTRIBUTE) {
			setIsCurrentStepValid(
				productAttributeSetName.trim().length > 2 && prompt.trim().length > 6,
			)
		} else {
			setIsCurrentStepValid(prompt.trim().length > 6)
		}
	}, [prompt, entityType, setIsCurrentStepValid, productAttributeSetName])

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

	const handleGenerate = useCallback(async (): Promise<boolean> => {
		const res = await aiToolsService.generateByType(prompt, entityType)
		switch (entityType) {
			case ENTITY_BRAND:
				const brands = res?.data as SimpleBrand[]
				setBrands(
					brands.length > 0
						? brands.map((b, bidx) => ({
								...b,
								id: bidx + 1,
							}))
						: [],
				)
				break
			case ENTITY_CATEGORY:
				const categories = res?.data as SimpleCategory[]
				setCategories(
					categories.length > 0 ? assignIdsToCategories(categories) : [],
				)
				break
			case ENTITY_PRODUCT_ATTRIBUTE:
				const productAttributes = res?.data as SimpleProductAttribute[]
				setProductAttributes(
					productAttributes.length > 0
						? productAttributes.map((p, pidx) => ({
								...p,
								id: pidx + 1,
								name: [productAttributeSetName, p.name].join(' - '),
								display_name: p.name,
							}))
						: [],
				)
				break
		}
		return true
	}, [
		assignIdsToCategories,
		entityType,
		productAttributeSetName,
		prompt,
		setBrands,
		setCategories,
		setProductAttributes,
	])

	return (
		<AIPromptStep
			setSubmitHandler={setSubmitHandler}
			promptHintComponent={PromptHintComponent}
			onGenerate={handleGenerate}
		>
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
			{entityType === ENTITY_PRODUCT_ATTRIBUTE && (
				<TextInput
					id='productAttributeName'
					label='Product Attribute Set Name'
					placeholder='A product type like book, song, etc.'
					required={true}
					value={productAttributeSetName}
					onChange={(e) => setProductAttributeSetName(e.target.value)}
					disabled={isSubmitting}
				/>
			)}
		</AIPromptStep>
	)
}

export default PromptStep
