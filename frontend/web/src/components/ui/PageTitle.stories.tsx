import type { Meta, StoryObj } from '@storybook/nextjs'
import PageTitle from '@/components/ui/PageTitle'

const meta: Meta<typeof PageTitle> = {
	title: 'UI/PageTitle',
	component: PageTitle,
	tags: ['autodocs'],
	argTypes: {
		children: {
			control: 'text',
			description: 'The title text to display',
		},
		className: {
			control: 'text',
			description: 'Additional Tailwind CSS classes for styling',
		},
	},
}

export default meta

type Story = StoryObj<typeof PageTitle>

export const Default: Story = {
	args: {
		children: 'page title',
		className: '',
	},
}

export const CustomClass: Story = {
	args: {
		children: 'Custom Styled Title',
		className: 'text-blue-600 text-3xl font-bold',
	},
}
