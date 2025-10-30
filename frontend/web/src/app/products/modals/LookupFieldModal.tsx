import React, { useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/form/Button'
import ModalButtonActionSection from '@/components/ui/modals/ModalButtonActionSection'
import BaseModal from '@/components/ui/modals/BaseModal'
import { ProductAttribute } from '@/types/product'

interface LookupFieldModalProps {
	attributes: ProductAttribute[]
	isOpen: boolean
	onClose: () => void
	onUpdateLookupField: (field: ProductAttribute[]) => void
}

const LookupFieldModal = ({
	attributes,
	isOpen,
	onUpdateLookupField,
	onClose,
}: LookupFieldModalProps) => {
	const [lookupField, setLookupField] = useState<ProductAttribute[]>([])

	const selectItem = (item: ProductAttribute) => {
		setLookupField((prevField) => [...prevField, item])
	}

	const removeItem = (item: ProductAttribute) => {
		setLookupField((f) => f.filter((i) => i.id !== item.id))
	}

	const availableAttributes = attributes
		.filter((b) => !lookupField.some((selected) => selected.id === b.id))
		.sort((a, b) => a.name.localeCompare(b.name))

	const onSave = () => {
		console.log('lookup')
		console.log(lookupField)
		onUpdateLookupField(lookupField)
		onClose()
	}

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<DialogTitle
					as='h2'
					className='text-lg font-medium font-semibold leading-6 text-gray-900'
				>
					Create A Lookup Field
				</DialogTitle>
				<div className='text-sm text-gray-500'>
					<p>
						Choose Attributes to Create A Lookup Field for AI Product Searches.
						If nothing is chosen, the product name will act as the default
						search field.
					</p>
					{lookupField.length > 0 ? (
						<div className='overflow-y-auto'>
							<p className='font-semibold py-4'>Lookup Field:</p>
							<div className='flex flex-wrap gap-2'>
								{lookupField.map((f) => (
									<Chip key={f.id} chipType='primary'>
										{f.name}
										<button
											type='button'
											onClick={() => removeItem(f)}
											className='ml-1 text-blue-600 hover:text-blue-900 focus:outline-none'
										>
											<XMarkIcon className='h-3 w-3' />
										</button>
									</Chip>
								))}
							</div>
						</div>
					) : (
						<p className='text-indigo-500 italic py-2'>
							No Attributes Chosen for Lookup Field
						</p>
					)}
				</div>
				<div className='max-h-80 overflow-y-auto'>
					<div className='space-y-3'>
						{availableAttributes.length > 0 &&
							availableAttributes.map((item) => (
								<div
									key={item.id}
									className='flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors'
								>
									<span className='text-lg font-medium text-gray-700'>
										{item.name}
									</span>
									<Button actionType='neutral' onClick={() => selectItem(item)}>
										<PlusIcon className='w-4 h-4 mr-2' />
									</Button>
								</div>
							))}
					</div>
				</div>
				<ModalButtonActionSection>
					<Button actionType='submit' onClick={onSave}>
						Save
					</Button>
					<Button actionType='neutral' onClick={onClose}>
						Cancel
					</Button>
				</ModalButtonActionSection>
			</div>
		</BaseModal>
	)
}

export default LookupFieldModal
