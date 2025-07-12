import type { Meta, StoryObj } from '@storybook/nextjs'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const meta: Meta<typeof LoadingSpinner> = {
	title: 'UI/LoadingSpinner',
	component: LoadingSpinner,
	tags: ['autodocs'],
	argTypes: {
		message: {
			control: 'text',
			description: 'Optional message to display below the spinner',
		},
		size: {
			control: { type: 'select' },
			options: ['sm', 'md', 'lg'],
			description: 'Size of the spinner',
		},
		className: {
			control: 'text',
			description: 'Additional Tailwind CSS classes for the container',
		},
	},
	parameters: {
		backgrounds: {
			values: [
				{ name: 'light', value: '#ffffff' },
				{ name: 'dark', value: '#000000' },
			],
		},
	},
}

export default meta

type Story = StoryObj<typeof LoadingSpinner>

export const Default: Story = {
	args: {
		message: 'Loading data…',
		size: 'md',
	},
}

export const SmallSpinner: Story = {
	args: {
		size: 'sm',
		message: 'Small fetch',
	},
}

export const LargerSpinner: Story = {
	args: {
		size: 'lg',
		message: 'Large fetch',
	},
}

export const NoMessage: Story = {
	args: {
		size: 'md',
		message: '',
	},
}

export const CustomClass: Story = {
	args: {
		size: 'md',
		message: 'Custom styles',
		className: 'bg-gray-100 p-6 rounded-lg shadow-lg color-gray-800',
	},
}
