import React, { useState, useEffect, useRef } from 'react'
import TextInput from '@/components/ui/form/TextInput'
import { OptionType } from '@/types/form'

interface AutocompleteInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		'onChange' | 'value' | 'onSelect'
	> {
	id: string
	label: string
	/**
	 * The function to call when the user types.
	 * Should return a promise that resolves to a list of options.
	 */
	onSearch: (query: string) => Promise<OptionType[]>
	/**
	 * Callback when an option is selected.
	 * Returns the value (ID) of the selected option.
	 */
	onSelect: (value: string | number | null) => void
	/**
	 * The initial display text to show in the input.
	 * Useful if the form is loaded with a pre-selected value.
	 */
	initialDisplayValue?: string
	/**
	 * Debounce time in milliseconds. Defaults to 300.
	 */
	debounceTime?: number
	/**
	 * Minimum characters required to trigger search. Defaults to 2.
	 */
	minChars?: number
	/**
	 * Message to display when no results are found.
	 */
	noResultsMessage?: string
	/**
	 * Error message to display below the input.
	 */
	errorMessage?: string
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
	id,
	label,
	onSearch,
	onSelect,
	initialDisplayValue = '',
	debounceTime = 300,
	minChars = 2,
	noResultsMessage = 'No results found',
	errorMessage,
	className,
	...props
}) => {
	const [inputValue, setInputValue] = useState(initialDisplayValue)
	const [options, setOptions] = useState<OptionType[]>([])
	const [loading, setLoading] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
	const [hasSearched, setHasSearched] = useState(false)

	const inputRef = useRef<HTMLInputElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const dropdownRef = useRef<HTMLUListElement>(null)
	const debounceTimer = useRef<NodeJS.Timeout | null>(null)

	// Handle outside click to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Calculate position
	useEffect(() => {
		if (isOpen && inputRef.current) {
			const rect = inputRef.current.getBoundingClientRect()
			const spaceBelow = window.innerHeight - rect.bottom
			const spaceAbove = rect.top
			const dropdownHeight = 200 // Approximate max height

			if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
				setPosition('top')
			} else {
				setPosition('bottom')
			}
		}
	}, [isOpen])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setInputValue(value)
		setHasSearched(false)

		// Clear previous selection if user types?
		// The prompt says "visual value that gets set is a text value while the real value being set will be some Id".
		// If they type, they are changing the value.
		// We might want to notify parent that value is cleared/invalid?
		// For now, we just let them type.

		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current)
		}

		if (value.length >= minChars) {
			setLoading(true)
			setIsOpen(true)
			debounceTimer.current = setTimeout(async () => {
				try {
					const results = await onSearch(value)
					setOptions(results)
					setHasSearched(true)
				} catch (error) {
					console.error('Search failed', error)
					setOptions([])
				} finally {
					setLoading(false)
				}
			}, debounceTime)
		} else {
			setOptions([])
			setIsOpen(false)
			setLoading(false)
		}
	}

	const handleOptionSelect = (option: OptionType) => {
		setInputValue(option.label)
		onSelect(option.value)
		setIsOpen(false)
	}

	return (
		<div className={`relative ${className || ''}`} ref={containerRef}>
			<TextInput
				id={id}
				label={label}
				ref={inputRef}
				value={inputValue}
				onChange={handleInputChange}
				autoComplete='off'
				className={errorMessage ? 'border-red-500' : ''}
				{...props}
			/>
			{errorMessage && (
				<p className='text-red-500 text-xs italic mt-1 absolute bottom-[-1.25rem]'>
					{errorMessage}
				</p>
			)}

			{isOpen && (inputValue.length >= minChars || loading) && (
				<ul
					ref={dropdownRef}
					className={`absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${
						position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
					}`}
					style={{}}
				>
					{loading ? (
						<li className='px-4 py-2 text-gray-500'>Loading...</li>
					) : options.length > 0 ? (
						options.map((option) => (
							<li
								key={option.value}
								onClick={() => handleOptionSelect(option)}
								className='px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-700'
							>
								{option.label}
							</li>
						))
					) : hasSearched ? (
						<li className='px-4 py-2 text-gray-500'>{noResultsMessage}</li>
					) : null}
				</ul>
			)}
		</div>
	)
}

export default AutocompleteInput
