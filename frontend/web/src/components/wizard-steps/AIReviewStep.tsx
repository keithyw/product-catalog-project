import React, { useCallback, useEffect } from 'react'
import ImportDataTable from '@/components/ui/tables/ImportDataTable'
import NestedImportDataTable from '@/components/ui/tables/NestImportDataTable'
import PageTitle from '@/components/ui/PageTitle'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { TableColumn } from '@/types/table'
import { StepComponentProps } from '@/types/wizard'
import { isArray } from 'lodash'

interface AIReviewStepProps<T> extends StepComponentProps {
	columns: TableColumn<T>[]
	data: T[]
	isNested: boolean
	filterFn: (items: T[], id: number) => T[]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSave: () => Promise<any>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AIReviewStep = <T extends Record<string, any>>({
	setSubmitHandler,
	columns,
	data,
	isNested,
	filterFn,
	onSave,
}: AIReviewStepProps<T>) => {
	const {
		entityType,
		setEntityData,
		setError,
		setIsCurrentStepValid,
		setIsSubmitting,
	} = useAIToolsStore()

	useEffect(() => {
		setIsCurrentStepValid(Array.isArray(data) && data.length > 0)
	}, [data, setIsCurrentStepValid])

	const handleStepSubmit = useCallback(async (): Promise<boolean> => {
		let isValid = false
		setIsSubmitting(true)
		try {
			const res = await onSave()
			if (res && res.errors) {
				if (isArray(res.errors)) {
					const errorMessages = res.errors
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						.map((err: any) => err.non_field_errors)
						.join(', ')
					setError(errorMessages)
				} else {
					setError(res.errors)
				}
			} else {
				isValid = true
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				setError(e.message)
			}
		} finally {
			setIsSubmitting(false)
		}
		setIsCurrentStepValid(isValid)
		return isValid
	}, [onSave, setError, setIsCurrentStepValid, setIsSubmitting])

	useEffect(() => {
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [handleStepSubmit, setSubmitHandler])

	const onDataChange = (updatedData: T[]) => {
		setEntityData(updatedData, entityType)
	}

	const handleRemoveRow = useCallback(
		(row: number) => {
			const updatedData = filterFn(data, row)
			setEntityData(updatedData, entityType)
		},
		[data, entityType, filterFn, setEntityData],
	)

	return (
		<div className='space-y-4 p-4'>
			<PageTitle>Review Data</PageTitle>
			<p className='text-sm text-gray-500 mb-4'>
				Review the AI-generated data below. You can make edits or remove items
				before importing.
			</p>
			{isNested && (
				<NestedImportDataTable
					data={data}
					columns={columns}
					rowKey='id'
					onDataChange={onDataChange}
					onRemoveRow={handleRemoveRow}
					canRemoveRow={true}
				/>
			)}
			{!isNested && (
				<ImportDataTable
					data={data}
					columns={columns}
					rowKey='id'
					onDataChange={onDataChange}
					onRemoveRow={handleRemoveRow}
					canRemoveRow={true}
				/>
			)}
		</div>
	)
}

export default AIReviewStep
