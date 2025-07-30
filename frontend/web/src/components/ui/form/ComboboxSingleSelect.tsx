import React, { Fragment, useMemo, useState } from 'react'
import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Transition,
} from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { OptionType } from '@/types/form'

interface ComboboxSingleSelectProps {
	id: string
	label: string
	options: OptionType[]
	selectedValue: string | number | null
	onSelect: (value: string | number | null) => void
	placeholder?: string
	className?: string
	disabled?: boolean
	errorMessage?: string
	readOnly?: boolean
}

const ComboboxSingleSelect: React.FC<ComboboxSingleSelectProps> = ({
	id,
	label,
	options,
	selectedValue,
	onSelect,
	placeholder = 'Select an option',
	className = '',
	disabled,
	errorMessage,
	readOnly,
}) => {
	const [query, setQuery] = useState('')

	const filteredOptions = useMemo(() => {
		if (query === '') {
			return options
		}
		const lowerCaseQuery = query.toLowerCase()
		return options.filter((o) => o.label.toLowerCase().includes(lowerCaseQuery))
	}, [query, options])

	const displayValue = useMemo(() => {
		return selectedValue
			? options.find((o) => o.value === selectedValue)?.label || ''
			: ''
	}, [options, selectedValue])

	return (
		<div className={`mb-4 ${className}`}>
			<label
				htmlFor={id}
				className='block text-gray-700 text-sm font-bold mb-2'
			>
				{label}
			</label>
			<Combobox
				value={selectedValue as string}
				onChange={onSelect}
				disabled={disabled || readOnly}
			>
				{() => (
					<div className='relative'>
						<div
							className={`
                        relative
                        w-full
                        cursor-default
                        overflow-hidden
                        rounded-lg
                        bg-white
                        text-left
                        shadow-md
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-white/75
                        focus-visible:ring-offset-2
                        focus-visible:ring-offset-blue-300
                        sm:text-sm
                        border
                        ${errorMessage ? 'border-red-500' : 'border-gray-300'}
                        ${disabled || readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}
                    `}
						>
							<ComboboxInput
								id={id}
								className={`
                                w-full
                                border-none
                                py-1.5
                                pl-3
                                pr-10
                                text-sm
                                leading-5
                                text-gray-900
                                focus:ring-0
                                ${disabled || readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}
                            `}
								displayValue={() => displayValue}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={placeholder}
								disabled={disabled || readOnly}
							/>
							<ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
								<ChevronUpDownIcon
									className='h-5 w-5 text-gray-400'
									aria-hidden='true'
								/>
							</ComboboxButton>
						</div>
						<Transition
							as={Fragment}
							leave='transition ease-in duration-100'
							leaveFrom='opacity-100'
							leaveTo='opacity-0'
							afterLeave={() => setQuery('')}
						>
							<ComboboxOptions>
								{filteredOptions.length === 0 && query !== '' ? (
									<div className='relative cursor-default select-none px-4 py-2 text-gray-700'>
										Nothing found
									</div>
								) : (
									filteredOptions.map((o) => (
										<ComboboxOption
											key={o.value}
											value={o.value}
											className={({ active }) => `
                                                    relative
                                                    cursor-default
                                                    select-none
                                                    py-2
                                                    pl-10
                                                    pr-4
                                                    ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
										>
											{({ selected, active }) => (
												<>
													<span
														className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
													>
														{o.label}
													</span>
													{selected ? (
														<span
															className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-gray-900'}`}
														>
															<CheckIcon
																className='h-5 w-5'
																aria-hidden='true'
															/>
														</span>
													) : null}
												</>
											)}
										</ComboboxOption>
									))
								)}
							</ComboboxOptions>
						</Transition>
					</div>
				)}
			</Combobox>
			{errorMessage && (
				<p className='text-red-500 text-xs italic mt-1'>{errorMessage}</p>
			)}
		</div>
	)
}

export default ComboboxSingleSelect
