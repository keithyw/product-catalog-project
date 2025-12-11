import type { Meta, StoryObj } from '@storybook/nextjs'
import DualListSelector from './DualListSelector'
import { OptionType } from '@/types/form'

const meta: Meta<typeof DualListSelector> = {
	title: 'UI/DualListSelector',
	component: DualListSelector,
	parameters: {
		layout: 'padded',
	},
	decorators: [
		(Story) => (
			<div className='h-[500px] w-full'>
				<Story />
			</div>
		),
	],
	tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DualListSelector>

const mockAvailableItems: OptionType[] = [
	{ label: 'Modifier A', value: 'mod_a' },
	{ label: 'Modifier B', value: 'mod_b' },
	{ label: 'Modifier C', value: 'mod_c' },
	{ label: 'Modifier D', value: 'mod_d' },
	{ label: 'Modifier E', value: 'mod_e' },
]

const mockSelectedItems: OptionType[] = [
	{ label: 'Modifier X', value: 'mod_x' },
	{ label: 'Modifier Y', value: 'mod_y' },
]

export const Default: Story = {
	args: {
		addTitle: 'Available Modifiers',
		removeTitle: 'Applied Modifiers',
		addItems: mockAvailableItems,
		removeItems: mockSelectedItems,
		onAdd: (id) => console.log('Add item:', id),
		onRemove: (id) => console.log('Remove item:', id),
	},
}

export const Empty: Story = {
	args: {
		addTitle: 'Available Modifiers',
		removeTitle: 'Applied Modifiers',
		addItems: [],
		removeItems: [],
		onAdd: (id) => console.log('Add item:', id),
		onRemove: (id) => console.log('Remove item:', id),
	},
}

export const ManyItems: Story = {
	args: {
		addTitle: 'Available Modifiers',
		removeTitle: 'Applied Modifiers',
		addItems: Array.from({ length: 20 }, (_, i) => ({
			label: `Modifier ${i + 1}`,
			value: `mod_${i + 1}`,
		})),
		removeItems: Array.from({ length: 10 }, (_, i) => ({
			label: `Selected Modifier ${i + 1}`,
			value: `selected_mod_${i + 1}`,
		})),
		onAdd: (id) => console.log('Add item:', id),
		onRemove: (id) => console.log('Remove item:', id),
	},
}
