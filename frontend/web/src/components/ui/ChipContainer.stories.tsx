import type { Meta, StoryObj } from '@storybook/nextjs'
import ChipContainer from './ChipContainer'

const meta: Meta<typeof ChipContainer> = {
	title: 'UI/ChipContainer',
	component: ChipContainer,
	tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ChipContainer>

const mockData = [
	{ id: 1, name: 'Item 1' },
	{ id: 2, name: 'Item 2' },
	{ id: 3, name: 'Item 3' },
]

export const Default: Story = {
	args: {
		itemName: 'items',
		fieldName: 'name',
		isLoadingData: false,
		data: mockData,
		errors: '',
		onRemove: (item) => console.log('Remove', item),
	},
}

export const Empty: Story = {
	args: {
		itemName: 'items',
		fieldName: 'name',
		isLoadingData: false,
		data: [],
		errors: '',
		onRemove: (item) => console.log('Remove', item),
	},
}

export const WithError: Story = {
	args: {
		itemName: 'items',
		fieldName: 'name',
		isLoadingData: false,
		data: [],
		errors: 'Something went wrong',
		onRemove: (item) => console.log('Remove', item),
	},
}

export const Loading: Story = {
	args: {
		itemName: 'items',
		fieldName: 'name',
		isLoadingData: true,
		data: [],
		errors: '',
		onRemove: (item) => console.log('Remove', item),
	},
}
