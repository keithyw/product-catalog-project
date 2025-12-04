'use client'

import React, { useMemo } from 'react'
import { isArray } from 'lodash'
import AIReviewStep from '@/components/ui/wizard-steps/AIReviewStep'
import brandService from '@/lib/services/brand'
import useAIToolsStore from '@/stores/useAIToolsStore'
// import useBrandStore from '@/stores/useBrandStore'
import { Brand, CreateBrandRequest } from '@/types/brand'
import { TableColumn } from '@/types/table'
import { StepComponentProps } from '@/types/wizard'

const COLS: TableColumn<Brand>[] = [
	{
		header: 'Name',
		accessor: 'name',
		sortable: true,
	},
	{
		header: 'Description',
		accessor: 'description',
		sortable: false,
	},
	{
		header: 'Logo URL',
		accessor: 'logo_url',
		sortable: false,
	},
	{
		header: 'Website',
		accessor: 'website_url',
		sortable: false,
	},
]

const BulkBrandReviewStep = ({ setSubmitHandler }: StepComponentProps) => {
	const { brands } = useAIToolsStore()

	const cols = useMemo(() => COLS, [])

	const filter = useMemo(
		() => (items: Brand[], id: number) => {
			return items.filter((item) => item.id !== id)
		},
		[],
	)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const save = async (items: Brand[]): Promise<any> => {
		if (isArray(items) && items.length > 0) {
			const req: CreateBrandRequest[] = items.map((b) => {
				return {
					name: b.name,
					description: b.description,
					logo_url: b.logo_url || null,
					website_url: b.website_url || null,
				}
			})
			return await brandService.bulk(req)
		}
		return null
	}

	// const filter = useMemo((items: Brand[], id: number) => items.filter((item) => item.id !== id), [])

	return (
		<>
			<AIReviewStep<Brand>
				columns={cols}
				data={brands}
				isNested={false}
				filterFn={filter}
				onSave={() => save(brands)}
				setSubmitHandler={setSubmitHandler}
			/>
		</>
	)
}

export default BulkBrandReviewStep
