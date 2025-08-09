import React, { useEffect, useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import TextInput from '@/components/ui/form/TextInput'
import BaseModal from '@/components/ui/modals/BaseModal'
import { OptionType } from '@/types/form'

interface OptionsEditorModalProps {
	isOpen: boolean
	options: OptionType[]
	onClose: () => void
	onSave: (options: OptionType[]) => void
}

const OptionsEditorModal: React.FC<OptionsEditorModalProps> = ({
	isOpen,
	options,
	onClose,
	onSave,
}) => {
	const [localOptions, setLocalOptions] = useState<OptionType[]>(options || [])
	const [newKey, setNewKey] = useState('')
	const [newValue, setNewValue] = useState('')

	const handleAddOption = () => {
		if (newKey && newValue) {
			setLocalOptions([...localOptions, { label: newKey, value: newValue }])
			setNewKey('')
			setNewValue('')
		}
	}

	const handleUpdateOption = (idx: number, label: string, value: string) => {
		const updatedOptions = [...localOptions]
		updatedOptions[idx] = { label, value }
		setLocalOptions(updatedOptions)
	}

	const handleRemoveOption = (idx: number) => {
		setLocalOptions(localOptions.filter((_, i) => i !== idx))
	}

	const handleSave = () => {
		onSave(localOptions)
		onClose()
	}

	useEffect(() => {
		setLocalOptions(options || [])
	}, [options])

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<DialogTitle
					as='h2'
					className='text-lg font-medium font-semibold text-gray-900 leading-6'
				>
					Edit Options
				</DialogTitle>
				{localOptions.map((opt: OptionType, idx: number) => (
					<div key={idx} className='flex items-center space-x-2'>
						<TextInput
							id={opt.label}
							label='Label'
							value={opt.label}
							placeholder='Label'
							className='flex-1'
							onChange={(e) =>
								handleUpdateOption(idx, e.target.value, opt.value as string)
							}
						/>
						<TextInput
							id={opt.value as string}
							label='Value'
							value={opt.value}
							placeholder='Value'
							className='flex-1'
							onChange={(e) =>
								handleUpdateOption(idx, opt.label, e.target.value)
							}
						/>
						<Button
							actionType='danger'
							className='mt-2'
							onClick={() => handleRemoveOption(idx)}
						>
							Remove
						</Button>
					</div>
				))}
				<div className='flex items-center space-x-2'>
					<TextInput
						id='new_key'
						label='New Label'
						value={newKey}
						placeholder='New Label'
						className='flex-1'
						onChange={(e) => setNewKey(e.target.value)}
					/>
					<TextInput
						id='new_value'
						label='New Value'
						value={newValue}
						placeholder='New Value'
						className='flex-1'
						onChange={(e) => setNewValue(e.target.value)}
					/>
					<Button
						actionType='submit'
						className='mt-2'
						onClick={() => handleAddOption()}
					>
						Add
					</Button>
				</div>
				<div className='mt-6 flex justify-end space-x-3'>
					<Button actionType='neutral' onClick={onClose}>
						Cancel
					</Button>
					<Button actionType='submit' onClick={handleSave}>
						Save
					</Button>
				</div>
			</div>
		</BaseModal>
	)
}

export default OptionsEditorModal
