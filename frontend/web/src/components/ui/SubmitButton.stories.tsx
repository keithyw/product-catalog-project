import { Meta, StoryObj } from '@storybook/nextjs'
import SubmitButton from '@/components/ui/SubmitButton'

const meta: Meta<typeof SubmitButton> = {
	title: 'UI/SubmitButton',
	component: SubmitButton,
	tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof SubmitButton>

export const Default: Story = {
	args: {
		children: 'Save Item',
	},
}

export const CustomClass: Story = {
	args: {
		children: 'Save Item',
		className: 'bg-green-500 hover:bg-green-600',
	},
}
