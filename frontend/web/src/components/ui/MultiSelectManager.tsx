import React, { useState } from 'react'
import ChipContainer from '@/components/ui/ChipContainer'
import Button from '@/components/ui/form/Button'
import MultiSelectModal from '@/components/ui/modals/MultiSelectModal'
import { SelectableItem } from '@/types/base'

interface MultiSelectManagerProps<T> {
	title: string
	itemName: string
	fieldName: string
	data: T[]
	isLoadingData: boolean
	selectedData: T[]
	loadingErrors: string
	onRemoveItem: (item: T) => void
	onSelectItem: (item: T) => void
}

const MultiSelectManager = <T extends SelectableItem>({
	title,
	itemName,
	fieldName,
	data,
	isLoadingData,
	selectedData,
	loadingErrors,
	onRemoveItem,
	onSelectItem,
}: MultiSelectManagerProps<T>) => {
	const [isModalOpen, setIsModalOpen] = useState(false)

	const onOpenModal = (e: React.MouseEvent) => {
		e.preventDefault()
		setIsModalOpen(true)
	}

	const onClose = () => {
		setIsModalOpen(false)
	}

	return (
		<div className='mt-4'>
			<h3 className='text-lg font-semibold text-gray-900 capitalize'>
				{title}
			</h3>
			<div className='relative mt-1'>
				<ChipContainer
					itemName={itemName}
					fieldName={fieldName}
					isLoadingData={isLoadingData}
					data={selectedData}
					errors={loadingErrors}
					onRemove={onRemoveItem}
				/>
			</div>
			<div className='items-center space-x-2 mt-2'>
				<Button
					actionType='neutral'
					onClick={onOpenModal}
					disabled={isLoadingData || !!loadingErrors}
				>
					<span className='capitalize'>Add {itemName}</span>
				</Button>
			</div>
			<MultiSelectModal
				title={`add ${itemName} here`}
				isOpen={isModalOpen}
				onClose={onClose}
				allItems={data}
				selectedItems={selectedData}
				onSelectItem={onSelectItem}
			/>
		</div>
	)
}

export default MultiSelectManager
