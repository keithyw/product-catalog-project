import type { Meta, StoryObj } from '@storybook/react'
import AutocompleteInput from './AutocompleteInput'
import { OptionType } from '@/types/form'

const meta: Meta<typeof AutocompleteInput> = {
	title: 'UI/Form/AutocompleteInput',
	component: AutocompleteInput,
	tags: ['autodocs'],
	argTypes: {
		onSearch: { action: 'searched' },
		onSelect: { action: 'selected' },
	},
}

export default meta
type Story = StoryObj<typeof AutocompleteInput>

const mockOptions: OptionType[] = [
	{ value: 1, label: 'Apple' },
	{ value: 2, label: 'Banana' },
	{ value: 3, label: 'Cherry' },
	{ value: 4, label: 'Date' },
	{ value: 5, label: 'Elderberry' },
]

const mockSearch = async (query: string): Promise<OptionType[]> => {
	await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
	return mockOptions.filter((option) =>
		option.label.toLowerCase().includes(query.toLowerCase()),
	)
}

export const Default: Story = {
	args: {
		id: 'fruit-search',
		label: 'Search Fruits',
		onSearch: mockSearch,
		placeholder: 'Type to search...',
	},
}

export const WithInitialValue: Story = {
	args: {
		id: 'fruit-search-initial',
		label: 'Search Fruits (Pre-filled)',
		onSearch: mockSearch,
		initialDisplayValue: 'Banana',
	},
}

export const NoResults: Story = {
	args: {
		id: 'fruit-search-empty',
		label: 'Search Fruits (No Results)',
		onSearch: async () => {
			await new Promise((resolve) => setTimeout(resolve, 500))
			return []
		},
		placeholder: 'Type anything...',
	},
}
