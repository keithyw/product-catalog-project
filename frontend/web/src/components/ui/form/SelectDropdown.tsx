import React, { forwardRef } from 'react'
import { Select } from '@headlessui/react'
import { OptionType } from '@/types/form'

interface SelectDropdownProps {
	id?: string
	name?: string
	label: string
	options: OptionType[]
	selectedValue: number | string | null
	onBlur?: React.FocusEventHandler<HTMLSelectElement>
	onSelect: (value: number | string | null) => void
	disabled?: boolean
	placeholder?: string
}

const SelectDropdown = forwardRef<HTMLSelectElement, SelectDropdownProps>(
	(
		{
			id,
			name,
			label,
			options,
			selectedValue,
			onBlur,
			onSelect,
			disabled = false,
			placeholder = 'Select an option',
		},
		ref,
	) => {
		const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
			const v = event.target.value
			let newVal: number | string | null
			if (v === '') {
				newVal = null
			} else if (options.length > 0 && typeof options[0].value === 'number') {
				newVal = parseInt(v)
				if (isNaN(newVal)) {
					newVal = null
				}
			} else {
				newVal = v
			}
			onSelect(newVal)
		}

		return (
			<div className='mb-4'>
				<label
					htmlFor={id}
					className='block text-gray-700 text-sm font-bold mb-2'
				>
					{label}
				</label>
				<div className='relative'>
					<Select
						id={id}
						name={name}
						value={
							selectedValue !== null && selectedValue !== undefined
								? selectedValue
								: ''
						}
						onChange={handleChange}
						onBlur={onBlur}
						ref={ref}
						disabled={disabled}
						className='
                            block
                            w-full
                            roudned-md
                            border-gray-300
                            shadow-sm
                            focus:border-blue-500
                            focus:ring-blue-500
                            sm:text-sm
                            py-2
                            pl-3
                            pr-10
                            disabled:bg-gray-500
                            disabled:cursor-not-allowed
                            text-gray-700
                        '
					>
						<option value='' disabled>
							{placeholder}
						</option>
						{options.length === 0 ? (
							<option value='' disabled>
								No options available
							</option>
						) : (
							options.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))
						)}
					</Select>
				</div>
			</div>
		)
	},
)

SelectDropdown.displayName = 'SelectDropdown'

export default SelectDropdown
