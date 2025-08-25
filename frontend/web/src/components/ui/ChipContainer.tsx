import React from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import Chip from '@/components/ui/Chip'

interface ChipContainerProps<T> {
	itemName: string
	fieldName: string
	isLoadingData: boolean
	data: T[]
	errors: string
	onRemove: (item: T) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChipContainer = <T extends Record<string, any>>({
	itemName,
	fieldName,
	isLoadingData,
	data,
	errors,
	onRemove,
}: ChipContainerProps<T>) => {
	return (
		<div className='relative w-full curosor-default border shadow-md rounded-lg'>
			<div className='flex flex-wrap gap-2 p-2'>
				{!isLoadingData && data.length > 0 ? (
					data.map((i, idx) => (
						<Chip key={idx} chipType='primary'>
							{i[fieldName]}
							<button
								type='button'
								onClick={() => onRemove(i)}
								className='ml-1 text-blue-600 hover:text-blue-900 focus:outline-none'
							>
								<XMarkIcon className='h-3 w-3' />
							</button>
						</Chip>
					))
				) : (
					<p className='text-gray-500'>
						No <span className='capitalize'>{itemName}</span> selected. Click
						<span className='capitalize font-bold'> Add {itemName}</span> to
						select.
					</p>
				)}
				{errors && <p className='text-red-500'>{errors}</p>}
			</div>
		</div>
	)
}

export default ChipContainer
