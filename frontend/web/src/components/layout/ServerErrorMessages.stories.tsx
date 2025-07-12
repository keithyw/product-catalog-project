import { Meta, StoryObj } from '@storybook/nextjs'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'

const meta: Meta<typeof ServerErrorMessages> = {
	title: 'Layout/ServerErrorMessages',
	component: ServerErrorMessages,
	tags: ['autodocs'],
	argTypes: {
		errorMessages: {
			control: 'text',
			description: 'Error messages to display',
			defaultValue: 'errors',
		},
	},
}

export default meta

type Story = StoryObj<typeof ServerErrorMessages>

export const Default: Story = {
	args: {
		errorMessages: 'error messages',
	},
}

export const NoErrors: Story = {
	args: {
		errorMessages: '',
	},
}
