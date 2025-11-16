import React from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import Button from '@/components/ui/form/Button'
import { OptionType } from '@/types/form'

interface AvailableListProps {
	items: OptionType[]
	onClick: (itemId: string) => void
}

const AvailableList = ({ items, onClick }: AvailableListProps) => {
	return (
		<div className='space-y-2 max-h-full overflow-y-auto'>
			{items.map((i) => (
				<div
					key={i.value}
					className='flex items-center justify-between p-3 border-gray-200 bg-white rounded-lg shadow-sm hover:bg-indigo-50 transition duration-150'
				>
					<div className='min-w-0 pr-4'>
						<p className='text-sm font-medium text-gray-900 truncate'>
							{i.label}
						</p>
					</div>
					<Button
						actionType='submit'
						type='button'
						onClick={() => onClick(i.value as string)}
					>
						<PlusIcon className='h-4 w-4' aria-hidden='true' />
					</Button>
				</div>
			))}
		</div>
	)
}

interface DualListSelectorProps {
	addTitle: string
	removeTitle: string
	addItems: OptionType[]
	removeItems: OptionType[]
	onAdd: (itemId: string) => void
	onRemove: (itemId: string) => void
}
const DualListSelector = ({
	addTitle,
	removeTitle,
	addItems,
	removeItems,
	onAdd,
	onRemove,
}: DualListSelectorProps) => {
	return (
		<div className='grid grid-cols-2 gap-8 h-full'>
			<div className='flex flex-col h-full overflow-y-auto'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>{addTitle}</h3>
				<AvailableList items={addItems} onClick={onAdd} />
			</div>
			<div className='flex flex-col h-full overflow-y-auto'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>
					{removeTitle}
				</h3>
				<AvailableList items={removeItems} onClick={onRemove} />
			</div>
		</div>
	)
}

export default DualListSelector
