import React, { useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/form/Button'
import SearchInput from '@/components/ui/form/SearchInput'
import BaseModal from '@/components/ui/modals/BaseModal'
import { SelectableItem } from '@/types/base'

interface MultiSelectModalProps<T> {
	title: string
	isOpen: boolean
	onClose: () => void
	allItems: T[]
	selectedItems: T[]
	onSelectItem: (item: T) => void
}

const MultiSelectModal = <T extends SelectableItem>({
	title,
	isOpen,
	onClose,
	allItems,
	selectedItems,
	onSelectItem,
}: MultiSelectModalProps<T>) => {
	const [query, setQuery] = useState('')

	const filteredItems = allItems
		.filter(
			(b) =>
				b.name.toLowerCase().includes(query.toLowerCase()) &&
				!selectedItems.some((selected) => selected.id === b.id),
		)
		.sort((a, b) => a.name.localeCompare(b.name))

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<DialogTitle
					as='h2'
					className='text-lg font-medium font-semibold leading-6 text-gray-900 capitalize'
				>
					{title}
				</DialogTitle>
				<div className='p-6'>
					<div className='relative mb-6'>
						<SearchInput
							value={query}
							onChange={setQuery}
							background=''
							className='text-gray-900'
						/>
					</div>
					<div className='space-y-3 mb-4'>
						<h3 className='text-gray-900 font-bold'>Selects Items from Here</h3>
					</div>
					<div className='max-h-80 overflow-y-auto'>
						<div className='space-y-3'>
							{filteredItems.length > 0 ? (
								filteredItems.map((item) => (
									<div
										key={item.id}
										className='flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors'
									>
										<span className='text-lg font-medium text-gray-700'>
											{item.name}
										</span>
										<Button
											actionType='neutral'
											onClick={() => onSelectItem(item)}
										>
											<PlusIcon className='w-4 h-4 mr-2' />
										</Button>
									</div>
								))
							) : (
								<p className='text-gray-500'>No items found</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</BaseModal>
	)
}

export default MultiSelectModal
