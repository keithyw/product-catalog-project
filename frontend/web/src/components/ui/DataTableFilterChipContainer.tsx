import React from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/form/Button'
import { FilterOption } from '@/types/filters'

interface DataTableFilterChipContainerProps {
	tags: FilterOption[]
	onRemove: (t: FilterOption) => void
	onClear: () => void
}

const DataTableFilterChipContainer = ({
	tags,
	onRemove,
	onClear,
}: DataTableFilterChipContainerProps) => {
	return (
		<div>
			{tags.length > 0 && (
				<div className='flex flex-wrap items-center space-x-4'>
					{tags.map((t) => (
						<Chip key={t.key} chipType='primary'>
							{t.label}
							<button
								type='button'
								onClick={() => onRemove(t)}
								className='ml-1 text-blue-600 hover:text-blue-900 focus:outline-none'
							>
								<XMarkIcon className='h-3 w-3' />
							</button>
						</Chip>
					))}
					<Button
						actionType='dataTableControl'
						onClick={onClear}
						className='text-sm py-1 !px-3'
					>
						Clear Filters
					</Button>
				</div>
			)}
		</div>
	)
}

export default DataTableFilterChipContainer
