import React, { useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import ToggleSwitch from '@/components/ui/form/ToggleSwitch'
import BaseModal from '@/components/ui/modals/BaseModal'
import { FilterParams } from '@/types/filters'
import { OptionType } from '@/types/form'

const statusOptions: OptionType[] = [
	{ value: 'PENDING', label: 'Pending Verification' },
	{ value: 'VERIFIED', label: 'Verified' },
	{ value: 'FAILED', label: 'Failed Verification' },
	{ value: 'EXEMPT', label: 'Does not require verification' },
]

interface FilterModalProps {
	isOpen: boolean
	onApply: (params: FilterParams) => void
	onClose: () => void
}
const FilterModal = ({ isOpen, onApply, onClose }: FilterModalProps) => {
	const [filters, setFilters] = useState({
		is_ai_generated: false,
		verification_status: '',
	})
	const handleApplyFilters = () => {
		const params: FilterParams = {}
		Object.entries(filters).forEach(([k, v]) => {
			if (typeof v === 'boolean' && v === true) {
				params[k] = v
			}
			if (typeof v === 'string' && v.length > 0) {
				params[k] = v
			}
		})
		onApply(params)
		onClose()
	}
	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<DialogTitle
					as='h2'
					className='text-lg font-medium font-semibold text-gray-900 leading-6'
				>
					Filters
				</DialogTitle>
				<div className='flex items-center space-x-2'>
					<ToggleSwitch
						id='is_ai_'
						checked={filters.is_ai_generated}
						onChange={(isChecked) =>
							setFilters((f) => ({ ...f, is_ai_generated: isChecked }))
						}
						label='Show Only AI Generated Products'
					/>
				</div>
				<div className='flex items-center space-x-2'>
					<SelectDropdown
						id='verificationStatus'
						name='verificationStatus'
						label='Verification Status'
						options={statusOptions}
						selectedValue={filters.verification_status}
						onSelect={(v) =>
							setFilters((f) => ({ ...f, verification_status: v as string }))
						}
						placeholder='Select a status'
					/>
				</div>
				<div className='mt-6 flex justify-end space-x-3'>
					<Button actionType='neutral' onClick={onClose}>
						Cancel
					</Button>
					<Button actionType='submit' onClick={handleApplyFilters}>
						Apply Filters
					</Button>
				</div>
			</div>
		</BaseModal>
	)
}

export default FilterModal
