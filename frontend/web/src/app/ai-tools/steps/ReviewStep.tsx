'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
import ImportDataTable from '@/components/ui/tables/ImportDataTable'
import NestedImportDataTable from '@/components/ui/tables/NestImportDataTable'
import PageTitle from '@/components/ui/PageTitle'
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
import { TableColumn } from '@/types/table'
import { StepComponentProps } from '@/types/wizard'

const BRAND_COLUMNS: TableColumn<SimpleBrand>[] = [
	{
		header: 'ID',
		accessor: 'id',
	},
	{
		header: 'Name',
		accessor: 'name',
		isEditable: true,
		inputType: 'text',
	},
	{
		header: 'Description',
		accessor: 'description',
		isEditable: true,
		inputType: 'textarea',
	},
]

const CATEGORY_COLUMNS: TableColumn<SimpleCategory>[] = [
	{
		header: 'ID',
		accessor: 'id',
	},
	{
		header: 'Name',
		accessor: 'name',
		isEditable: true,
		inputType: 'text',
	},
	{
		header: 'Description',
		accessor: 'description',
		isEditable: true,
		inputType: 'textarea',
	},
]

const PRODUCT_ATTRIBUTE_COLUMNS: TableColumn<SimpleProductAttribute>[] = [
	{
		header: 'ID',
		accessor: 'id',
	},
	{
		header: 'Name',
		accessor: 'name',
		isEditable: true,
		inputType: 'text',
	},
	{
		header: 'Display Name',
		accessor: 'display_name',
		isEditable: true,
		inputType: 'text',
	},
	{
		header: 'Description',
		accessor: 'description',
		isEditable: true,
		inputType: 'textarea',
	},
	{
		header: 'Type',
		accessor: 'type',
		isEditable: true,
		inputType: 'select',
		selectOptions: [
			{ value: 'text', label: 'Text' },
			{ value: 'textarea', label: 'Textarea' },
			{ value: 'number', label: 'Number' },
			{ value: 'boolean', label: 'Boolean' },
			{ value: 'select', label: 'Select' },
			{ value: 'multiselect', label: 'Multiselect' },
			{ value: 'date', label: 'Date' },
			{ value: 'datetime', label: 'Datetime' },
			{ value: 'json', label: 'JSON' },
		],
	},
	{
		header: 'Required',
		accessor: 'is_required',
		isEditable: true,
		inputType: 'checkbox',
	},
	{
		header: 'Default Value',
		accessor: 'default_value',
		isEditable: true,
		inputType: 'text',
	},
	{
		header: 'Options',
		accessor: 'options',
		// isEditable: true,
		inputType: 'textarea',
		isObject: true,
	},
	{
		header: 'Validation Rules',
		accessor: 'validation_rules',
		isEditable: false,
		// inputType: 'textarea',
		isObject: true,
	},
]

const ReviewStep: React.FC<StepComponentProps> = ({ setSubmitHandler }) => {
	const {
		brands,
		categories,
		productAttributes,
		productAttributeSetName,
		entityType,
		setBrands,
		setCategories,
		setProductAttributes,
		setError,
		setIsCurrentStepValid,
		setIsSubmitting,
	} = useAIToolsStore()

	const cols = useMemo(() => BRAND_COLUMNS, [])
	const catCols = useMemo(() => CATEGORY_COLUMNS, [])
	const prodAttrCols = useMemo(() => PRODUCT_ATTRIBUTE_COLUMNS, [])

	const convertCategoriesToRequest = useCallback(
		(categories: SimpleCategory[]): SimpleCategoryRequest[] => {
			return categories.map((cat) => {
				return {
					name: cat.name,
					description: cat.description,
					category_system_id: 3, // temp until we can get a category system id
					nested_children_data: convertCategoriesToRequest(cat.children || []),
				}
			})
		},
		[],
	)

	useEffect(() => {
		switch (entityType) {
			case ENTITY_BRAND:
				setIsCurrentStepValid(Array.isArray(brands) && brands.length > 0)
				break
			case ENTITY_CATEGORY:
				setIsCurrentStepValid(
					Array.isArray(categories) && categories.length > 0,
				)
				break
			case ENTITY_PRODUCT_ATTRIBUTE:
				setIsCurrentStepValid(
					Array.isArray(productAttributes) && productAttributes.length > 0, // Assuming product attributes are handled similarly to brands for now
				)
				break
			default:
				setIsCurrentStepValid(false)
		}
	}, [brands, categories, productAttributes, entityType, setIsCurrentStepValid])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			let isValid = false
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let res: any = null
			// let isValid = Array.isArray(brands) && brands.length > 0
			setIsSubmitting(true)
			try {
				switch (entityType) {
					case ENTITY_BRAND:
						// isValid = Array.isArray(brands) && brands.length > 0
						if (Array.isArray(brands) && brands.length > 0) {
							const data: CreateBrandRequest[] = brands.map((b) => {
								return {
									name: b.name,
									description: b.description,
								}
							})
							res = await brandService.bulk(data)
						}
						break
					case ENTITY_CATEGORY:
						if (Array.isArray(categories) && categories.length > 0) {
							const data: SimpleCategoryRequest[] =
								convertCategoriesToRequest(categories)
							res = await categoryService.bulk(data)
						}
						break
					case ENTITY_PRODUCT_ATTRIBUTE:
						if (
							Array.isArray(productAttributes) &&
							productAttributes.length > 0
						) {
							const data: CreateProductAttributeRequest[] =
								productAttributes.map((attr) => {
									return {
										name: attr.name,
										description: attr.description,
										type: attr.type,
										is_required: attr.is_required,
										default_value: attr.default_value,
										options: attr.options,
										validation_rules: attr.validation_rules,
									}
								})
							res = await productAttributeService.bulk(data)
							if (res.created_product_attributes.length > 0) {
								const req: CreateProductAttributeSetRequest = {
									name: productAttributeSetName,
									attributes: res.created_product_attributes.map(
										(r: ProductAttribute) => r.id,
									),
								}
								await productAttributeSetService.create(req)
							}
						}
						break
				}

				if (res && res.errors) {
					isValid = false
					setError(res.errors)
				} else {
					isValid = true
				}
			} catch (e: unknown) {
				isValid = false
				if (e instanceof Error) {
					setError(e.message)
				}
			} finally {
				setIsSubmitting(false)
			}
			setIsCurrentStepValid(isValid)
			return isValid
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [
		brands,
		categories,
		productAttributes,
		convertCategoriesToRequest,
		entityType,
		setError,
		setIsCurrentStepValid,
		setIsSubmitting,
		setSubmitHandler,
	])

	const removeCategoryAndChildren = (
		categories: SimpleCategory[],
		id: number,
	): SimpleCategory[] => {
		return categories
			.filter((cat) => cat.id !== id)
			.map((cat) => {
				if (cat.children) {
					cat.children = removeCategoryAndChildren(cat.children, id)
				}
				return cat
			})
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleRemoveRow = (row: any) => {
		if (brands) {
			const updatedBrands = brands.filter((i) => i.id !== row)
			setBrands(updatedBrands)
		}
		if (categories) {
			const updatedCategories = removeCategoryAndChildren(categories, row)
			setCategories(updatedCategories)
		}
		if (productAttributes) {
			const updatedProductAttributes = productAttributes.filter(
				(i) => i.id !== row,
			)
			setProductAttributes(updatedProductAttributes)
		}
	}

	const onDataBrandChange = (updatedData: SimpleBrand[]) => {
		setBrands(updatedData)
	}
	const onDataCategoryChange = (updatedData: SimpleCategory[]) => {
		setCategories(updatedData)
	}

	const onDataProductAttributeChange = (
		updatedData: SimpleProductAttribute[],
	) => {
		setProductAttributes(updatedData)
	}

	return (
		<div className='space-y-4 p-4'>
			<PageTitle>Review Data</PageTitle>
			<p className='text-sm text-gray-500 mb-4'>
				Review the AI-generated brand data below. You can make edits or remove
				items before importing.
			</p>

			{entityType === ENTITY_BRAND && (
				<ImportDataTable
					data={brands}
					columns={cols}
					rowKey='id'
					onDataChange={onDataBrandChange}
					onRemoveRow={handleRemoveRow}
					canRemoveRow={true}
				/>
			)}
			{entityType === ENTITY_CATEGORY && (
				<NestedImportDataTable
					data={categories}
					columns={catCols}
					rowKey='id'
					onDataChange={onDataCategoryChange}
					onRemoveRow={handleRemoveRow}
					canRemoveRow={true}
				/>
			)}
			{entityType === ENTITY_PRODUCT_ATTRIBUTE && (
				<ImportDataTable
					data={productAttributes}
					columns={prodAttrCols}
					rowKey='id'
					onDataChange={onDataProductAttributeChange}
					onRemoveRow={handleRemoveRow}
					canRemoveRow={true}
				/>
			)}
		</div>
	)
}

export default ReviewStep
