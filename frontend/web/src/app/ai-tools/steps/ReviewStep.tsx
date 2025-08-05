'use client'

import React, { useEffect, useMemo } from 'react'
import ImportDataTable from '@/components/ui/ImportDataTable'
import PageTitle from '@/components/ui/PageTitle'
import brandService from '@/lib/services/brand'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { SimpleBrand } from '@/types/ai'
import { CreateBrandRequest } from '@/types/brand'
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

const ReviewStep: React.FC<StepComponentProps> = ({ setSubmitHandler }) => {
	const {
		brands,
		setBrands,
		setError,
		setIsCurrentStepValid,
		setIsSubmitting,
	} = useAIToolsStore()

	const cols = useMemo(() => BRAND_COLUMNS, [])

	useEffect(() => {
		setIsCurrentStepValid(Array.isArray(brands) && brands.length > 0)
	}, [brands, setIsCurrentStepValid])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			let isValid = Array.isArray(brands) && brands.length > 0
			setIsSubmitting(true)
			try {
				const data: CreateBrandRequest[] = brands.map((b) => {
					return {
						name: b.name,
						description: b.description,
					}
				})
				const res = await brandService.bulk(data)
				if (res.errors) {
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
		setError,
		setIsCurrentStepValid,
		setIsSubmitting,
		setSubmitHandler,
	])

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleRemoveRow = (row: any) => {
		if (brands) {
			const updatedBrands = brands.filter((i) => i.id !== row)
			setBrands(updatedBrands)
		}
	}

	const onDataChange = (updatedData: SimpleBrand[]) => {
		setBrands(updatedData)
	}

	return (
		<div className='space-y-4 p-4'>
			<PageTitle>Review Data</PageTitle>
			<p className='text-sm text-gray-500 mb-4'>
				Review the AI-generated brand data below. You can make edits or remove
				items before importing.
			</p>
			<ImportDataTable
				data={brands}
				columns={cols}
				rowKey='id'
				onDataChange={onDataChange}
				onRemoveRow={handleRemoveRow}
			/>
		</div>
	)
}

export default ReviewStep
