import React from 'react'
import AssetPreview from '@/components/ui/AssetPreview'

export interface DetailSectionRow {
	label: string
	value: string
	isAsset?: boolean
	type?: string
}

interface DetailSectionProps {
	rows: DetailSectionRow[]
}

const DetailSection: React.FC<DetailSectionProps> = ({ rows }) => {
	return (
		<div className='border-t border-gray-200 px-4 py-5 sm:p-0'>
			<dl className='sm-divide-y sm:divide-gray-200'>
				{rows.map((row, idx) => (
					<div
						key={idx}
						className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'
					>
						<dt className='text-sm font-medium text-gray-500'>{row.label}</dt>
						<dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 overflow-x-hidden whitespace-nowrap'>
							{row?.isAsset ? (
								<AssetPreview
									url={row.value}
									type={row?.type || 'image'}
									alt={row.label || 'Asset preview'}
								/>
							) : row.value ? (
								row.value
							) : (
								''
							)}
						</dd>
					</div>
				))}
			</dl>
		</div>
	)
}

export default DetailSection
