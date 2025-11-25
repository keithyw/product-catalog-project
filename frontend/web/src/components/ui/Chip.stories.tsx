import type { Meta, StoryObj } from '@storybook/nextjs'
import Chip from './Chip'

const meta: Meta<typeof Chip> = {
	title: 'UI/Chip',
	component: Chip,
	tags: ['autodocs'],
	argTypes: {
		chipType: {
			control: 'select',
			options: ['primary', 'secondary', 'success', 'danger', 'warning'],
		},
		isActive: {
			control: 'boolean',
		},
	},
}

export default meta
type Story = StoryObj<typeof Chip>

export const Primary: Story = {
	args: {
		chipType: 'primary',
		children: 'Primary Chip',
	},
}

export const Secondary: Story = {
	args: {
		chipType: 'secondary',
		children: 'Secondary Chip',
	},
}

export const Success: Story = {
	args: {
		chipType: 'success',
		children: 'Success Chip',
	},
}

export const Danger: Story = {
	args: {
		chipType: 'danger',
		children: 'Danger Chip',
	},
}

export const Warning: Story = {
	args: {
		chipType: 'warning',
		children: 'Warning Chip',
	},
}

export const Active: Story = {
	args: {
		chipType: 'primary',
		isActive: true,
		children: 'Active Chip',
	},
}
