import React, { Fragment, useMemo, useState } from 'react'
import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Transition,
} from '@headlessui/react'
import {
	CheckIcon,
	ChevronUpDownIcon,
	XMarkIcon,
} from '@heroicons/react/20/solid'
import { OptionType } from '@/types/form'

interface ComboboxMultiSelectProps {
	id: string
	label: string
	options: OptionType[]
	selectedValues: (string | number)[]
	onSelect: (values: (string | number)[]) => void
	placeholder?: string
	className?: string
	disabled?: boolean
	errorMessage?: string
}

const ComboboxMultiSelect: React.FC<ComboboxMultiSelectProps> = ({
	id,
	label,
	options,
	selectedValues,
	onSelect,
	placeholder = 'Select options',
	className = '',
	disabled,
	errorMessage,
}) => {
	const [query, setQuery] = useState('')

	const filteredOptions = useMemo(() => {
		if (query === '') return options
		const lowerCaseQuery = query.toLowerCase()
		return options.filter((o) => o.label.toLowerCase().includes(lowerCaseQuery))
	}, [options, query])

	const handleChange = (newSelected: (string | number)[]) => {
		onSelect(newSelected)
	}

	const handleRemoveTag = (v: string | number) => {
		const newSelectedValues = selectedValues.filter((val) => val !== v)
		onSelect(newSelectedValues)
	}

	const selectedLabels = useMemo(() => {
		return selectedValues.map(
			(v) => options.find((o) => o.value === v)?.label || String(v),
		)
	}, [options, selectedValues])

	return (
		<div className={`mb-4 ${className}`}>
			<label
				htmlFor={id}
				className='block text-gray-700 text-sm font-bold mb-2'
			>
				{label}
			</label>
			<Combobox
				multiple
				value={selectedValues}
				onChange={handleChange}
				disabled={disabled}
			>
				<div className='relative mt-1'>
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
                                    ${disabled ? 'bg-gray-500 cursor-not-allowed' : ''}                                
                                `}
					>
						<div className='flex flex-wrap gap-2 p-2 min-h-[38px]'>
							{selectedLabels.length > 0 ? (
								selectedLabels.map((label) => {
									const v =
										options.find((o) => o.label === label)?.value || label
									return (
										<span
											key={label}
											className='flex items-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full'
										>
											{label}
											<button
												type='button'
												onClick={() => handleRemoveTag(v)}
												className='ml-1 text-blue-600 hover:text-blue-900 focus:outline-none'
												disabled={disabled}
											>
												<XMarkIcon className='h-3 w-3' />
											</button>
										</span>
									)
								})
							) : (
								<span className='text-gray-500 text-sm py-0.5 px-1'>
									{placeholder}
								</span>
							)}
							<ComboboxInput
								id={id}
								displayValue={() => query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={selectedLabels.length === 0 ? placeholder : ''}
								disabled={disabled}
							/>
						</div>
						<ComboboxButton>
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
						<ComboboxOptions className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm'>
							{filteredOptions.length === 0 && query !== '' ? (
								<div className='relative cursor-default select-none px-4 py-2 text-gray-700'>
									Nothing found.
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
                                                ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}
                                            `}
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
														className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}
													>
														<CheckIcon className='h-5 w-5' aria-hidden='true' />
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
			</Combobox>
			{errorMessage && (
				<p className='text-red-500 text-xs italic mt-1'>{errorMessage}</p>
			)}
		</div>
	)
}

export default ComboboxMultiSelect
