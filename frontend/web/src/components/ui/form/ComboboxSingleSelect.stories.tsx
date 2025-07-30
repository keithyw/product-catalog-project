import React, { useState } from 'react'
import { Meta, StoryObj } from '@storybook/nextjs'
import ComboboxSingleSelect from './ComboboxSingleSelect'
import { OptionType } from '@/types/form'

// Mock data for options
const mockOptions: OptionType[] = [
	{ value: 1, label: 'Apple' },
	{ value: 2, label: 'Banana' },
	{ value: 3, label: 'Cherry' },
	{ value: 4, label: 'Date' },
	{ value: 5, label: 'Elderberry' },
	{ value: 6, label: 'Fig' },
	{ value: 7, label: 'Grape' },
	{ value: 8, label: 'Honeydew' },
	{ value: 9, label: 'Kiwi' },
	{ value: 10, label: 'Lemon' },
]

const meta: Meta<typeof ComboboxSingleSelect> = {
	title: 'UI/Form/ComboboxSingleSelect',
	component: ComboboxSingleSelect,
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		id: { control: 'text' },
		label: { control: 'text' },
		options: { control: 'object' },
		selectedValue: {
			control: 'select',
			options: [null, ...mockOptions.map((o) => o.value)],
		},
		onSelect: { action: 'option selected' },
		placeholder: { control: 'text' },
		className: { control: 'text' },
		disabled: { control: 'boolean' },
		errorMessage: { control: 'text' },
		readOnly: { control: 'boolean' },
	},
	tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof ComboboxSingleSelect>

// Default story with interactive selection
export const Default: Story = {
	render: (args) => {
		const [selected, setSelected] = useState<string | number | null>(
			args.selectedValue || null,
		)

		const handleSelect = (value: string | number | null) => {
			setSelected(value)
			args.onSelect(value) // Log the action in Storybook
		}

		return (
			<div className='w-80'>
				{' '}
				{/* Provide a fixed width for consistent rendering */}
				<ComboboxSingleSelect
					{...args}
					selectedValue={selected}
					onSelect={handleSelect}
				/>
			</div>
		)
	},
	args: {
		id: 'fruit-select-default',
		label: 'Select a Fruit',
		options: mockOptions,
		selectedValue: null,
		placeholder: 'Choose a fruit...',
	},
}

// Story with a pre-selected value
export const WithSelectedValue: Story = {
	...Default,
	args: {
		...Default.args,
		id: 'fruit-select-selected',
		selectedValue: 3, // Cherry
	},
}

// Story with a long list of options (to test scroll)
export const LongList: Story = {
	...Default,
	args: {
		...Default.args,
		id: 'fruit-select-long',
		options: Array.from({ length: 50 }, (_, i) => ({
			value: i + 1,
			label: `Option ${i + 1}`,
		})),
		label: 'Select a Long Option',
		placeholder: 'Search through many options...',
	},
}

// Story in a disabled state
export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		id: 'fruit-select-disabled',
		disabled: true,
		selectedValue: 2, // Banana
	},
}

// Story in a read-only state
export const ReadOnly: Story = {
	...Default,
	args: {
		...Default.args,
		id: 'fruit-select-readonly',
		readOnly: true,
		selectedValue: 4, // Date
	},
}

// Story with an error message
export const WithError: Story = {
	...Default,
	args: {
		...Default.args,
		id: 'fruit-select-error',
		errorMessage: 'This field is required.',
	},
}

// Story with no options available
export const NoOptions: Story = {
	...Default,
	args: {
		...Default.args,
		id: 'fruit-select-no-options',
		options: [],
		placeholder: 'No options available.',
	},
}

// Story with no options matching the query
export const NoMatchingOptions: Story = {
	render: (args) => {
		const [selected, setSelected] = useState<string | number | null>(null)

		const handleSelect = (value: string | number | null) => {
			setSelected(value)
			args.onSelect(value)
		}

		return (
			<div className='w-80'>
				<ComboboxSingleSelect
					{...args}
					selectedValue={selected}
					onSelect={handleSelect}
				/>
			</div>
		)
	},
	args: {
		...Default.args,
		id: 'fruit-select-no-match',
		options: mockOptions,
		placeholder: 'Type "xyz" to see "Nothing found."',
	},
}
