'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
import ImportDataTable from '@/components/ui/tables/ImportDataTable'
import NestedImportDataTable from '@/components/ui/tables/NestImportDataTable'
import PageTitle from '@/components/ui/PageTitle'
import { ENTITY_BRAND, ENTITY_CATEGORY } from '@/lib/constants'
import brandService from '@/lib/services/brand'
import categoryService from '@/lib/services/category'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { SimpleBrand, SimpleCategory } from '@/types/ai'
import { CreateBrandRequest } from '@/types/brand'
import { SimpleCategoryRequest } from '@/types/category'
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

const ReviewStep: React.FC<StepComponentProps> = ({ setSubmitHandler }) => {
	const {
		brands,
		categories,
		entityType,
		setBrands,
		setCategories,
		setError,
		setIsCurrentStepValid,
		setIsSubmitting,
	} = useAIToolsStore()

	const cols = useMemo(() => BRAND_COLUMNS, [])
	const catCols = useMemo(() => CATEGORY_COLUMNS, [])

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
			default:
				setIsCurrentStepValid(false)
		}
	}, [brands, categories, entityType, setIsCurrentStepValid])

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
	}

	const onDataBrandChange = (updatedData: SimpleBrand[]) => {
		setBrands(updatedData)
	}
	const onDataCategoryChange = (updatedData: SimpleCategory[]) => {
		setCategories(updatedData)
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
		</div>
	)
}

export default ReviewStep
