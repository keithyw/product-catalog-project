'use client'

import React, { useCallback, useMemo } from 'react'
import { isArray } from 'lodash'
import AIReviewStep from '@/components/ui/wizard-steps/AIReviewStep'
import {
	ENTITY_BRAND,
	ENTITY_CATEGORY,
	ENTITY_PRODUCT_ATTRIBUTE,
} from '@/lib/constants'
import brandService from '@/lib/services/brand'
import categoryService from '@/lib/services/category'
import productAttributeService from '@/lib/services/productAttribute'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { SimpleBrand, SimpleCategory, SimpleProductAttribute } from '@/types/ai'
import { CreateBrandRequest } from '@/types/brand'
import { SimpleCategoryRequest } from '@/types/category'
import {
	CreateProductAttributeRequest,
	CreateProductAttributeSetRequest,
	ProductAttribute,
} from '@/types/product'
import {
	BRAND_COLUMNS,
	CATEGORY_COLUMNS,
	PRODUCT_ATTRIBUTE_COLUMNS,
} from '@/types/table-columns/aiGenerationColumns'
import { StepComponentProps } from '@/types/wizard'

const ReviewStep = ({ setSubmitHandler }: StepComponentProps) => {
	const {
		brands,
		categories,
		productAttributes,
		productAttributeSetName,
		entityType,
	} = useAIToolsStore()

	const removeCategoryAndChildren = useCallback(
		(categories: SimpleCategory[], id: number): SimpleCategory[] => {
			return categories
				.filter((cat) => cat.id !== id)
				.map((cat) => {
					if (cat.children) {
						cat.children = removeCategoryAndChildren(cat.children, id)
					}
					return cat
				})
		},
		[],
	)

	const convertCategoriesToRequest = useCallback(
		(categories: SimpleCategory[]): SimpleCategoryRequest[] => {
			return categories.map((cat) => {
				return {
					name: cat.name,
					description: cat.description,
					category_system_id: 3, // temp until we can get a category system id
					nested_children_data: convertCategoriesToRequest(cat.children || []),
					is_ai_generated: false,
					verification_status: 'PENDING',
				}
			})
		},
		[],
	)

	const entityMap = useMemo(() => {
		return {
			columns: {
				[ENTITY_BRAND]: BRAND_COLUMNS,
				[ENTITY_CATEGORY]: CATEGORY_COLUMNS,
				[ENTITY_PRODUCT_ATTRIBUTE]: PRODUCT_ATTRIBUTE_COLUMNS,
			},
			data: {
				[ENTITY_BRAND]: brands,
				[ENTITY_CATEGORY]: categories,
				[ENTITY_PRODUCT_ATTRIBUTE]: productAttributes,
			},
			filters: {
				[ENTITY_BRAND]: (items: SimpleBrand[], id: number) =>
					items.filter((item) => item.id !== id),
				[ENTITY_CATEGORY]: (items: SimpleCategory[], id: number) =>
					removeCategoryAndChildren(items, id),
				removeCategoryAndChildren,
				[ENTITY_PRODUCT_ATTRIBUTE]: (
					items: SimpleProductAttribute[],
					id: number,
				) => items.filter((item) => item.id !== id),
			},
			bulkSave: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				[ENTITY_BRAND]: async (items: SimpleBrand[]): Promise<any> => {
					if (isArray(items) && items.length > 0) {
						const req: CreateBrandRequest[] = items.map((b) => {
							return {
								name: b.name,
								description: b.description,
							}
						})
						return await brandService.bulk(req)
					}
					return null
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				[ENTITY_CATEGORY]: async (items: SimpleCategory[]): Promise<any> => {
					if (isArray(items) && items.length > 0) {
						const data: SimpleCategoryRequest[] =
							convertCategoriesToRequest(categories)
						return await categoryService.bulk(data)
					}
					return null
				},
				[ENTITY_PRODUCT_ATTRIBUTE]: async (
					items: SimpleProductAttribute[],
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				): Promise<any> => {
					if (isArray(items) && items.length > 0) {
						const data: CreateProductAttributeRequest[] = items.map((attr) => {
							return {
								name: attr.name,
								display_name: attr.display_name || null,
								description: attr.description,
								sample_values: attr.sample_values,
								type: attr.type,
								is_required: attr.is_required,
								default_value: attr.default_value,
								options: attr.options,
								validation_rules: attr.validation_rules,
							}
						})
						const res = await productAttributeService.bulk(data)
						if (res.length > 0) {
							const req: CreateProductAttributeSetRequest = {
								name: productAttributeSetName,
								attributes: res.map((r: ProductAttribute) => r.id as number),
								is_ai_generated: true,
								verification_status: 'PENDING',
							}
							await productAttributeSetService.create(req)
						}
						return res
					}
					return null
				},
			},
		}
	}, [
		brands,
		categories,
		productAttributes,
		productAttributeSetName,
		convertCategoriesToRequest,
		removeCategoryAndChildren,
	])
	return (
		<>
			{entityType === ENTITY_BRAND && (
				<AIReviewStep<SimpleBrand>
					columns={entityMap.columns[entityType]}
					data={entityMap.data[entityType]}
					isNested={false}
					filterFn={entityMap.filters[entityType]}
					onSave={() =>
						entityMap.bulkSave[entityType](entityMap.data[entityType])
					}
					setSubmitHandler={setSubmitHandler}
				/>
			)}
			{entityType === ENTITY_CATEGORY && (
				<AIReviewStep<SimpleCategory>
					columns={entityMap.columns[entityType]}
					data={entityMap.data[entityType]}
					isNested={true}
					filterFn={entityMap.filters[entityType]}
					onSave={() =>
						entityMap.bulkSave[entityType](entityMap.data[entityType])
					}
					setSubmitHandler={setSubmitHandler}
				/>
			)}
			{entityType === ENTITY_PRODUCT_ATTRIBUTE && (
				<AIReviewStep<SimpleProductAttribute>
					columns={entityMap.columns[entityType]}
					data={entityMap.data[entityType]}
					isNested={false}
					filterFn={entityMap.filters[entityType]}
					onSave={() =>
						entityMap.bulkSave[entityType](entityMap.data[entityType])
					}
					setSubmitHandler={setSubmitHandler}
				/>
			)}
		</>
	)
}

export default ReviewStep
