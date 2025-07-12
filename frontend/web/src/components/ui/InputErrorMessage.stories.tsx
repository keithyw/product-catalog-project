import { Meta, StoryObj } from '@storybook/nextjs'
import InputErrorMessage from '@/components/ui/InputErrorMessage'

const meta: Meta<typeof InputErrorMessage> = {
	title: 'UI/InputErrorMessage',
	component: InputErrorMessage,
	tags: ['autodocs'],
	argTypes: {
		errorMessage: {
			control: 'text',
			description: 'Error message to display',
			defaultValue: 'This field is required.',
		},
	},
}

export default meta

type Story = StoryObj<typeof InputErrorMessage>

export const Default: Story = {
	args: {
		errorMessage: 'This field is required.',
	},
}

export const NoErrorMessage: Story = {
	args: {
		errorMessage: '',
	},
}
