import { Meta, StoryObj } from '@storybook/nextjs'
import TextInput from '@/components/ui/TextInput'

const meta: Meta<typeof TextInput> = {
	title: 'UI/TextInput',
	component: TextInput,
	tags: ['autodocs'],
	argTypes: {
		id: {
			control: 'text',
			description: 'Unique identifier for the input field',
		},
		label: {
			control: 'text',
			description: 'Label for the input field',
		},
		className: {
			control: 'text',
			description: 'Additional Tailwind CSS classes for styling',
			defaultValue: '',
		},
	},
}

export default meta

type Story = StoryObj<typeof TextInput>

export const Default: Story = {
	args: {
		id: 'default-input',
		label: 'Default Input',
		value: '',
		required: false,
		className: '',
	},
}

export const WithValue: Story = {
	args: {
		id: 'with-value-input',
		label: 'Input with Value',
		required: false,
		className: '',
	},
}

export const CustomClass: Story = {
	args: {
		id: 'custom-class-input',
		label: 'Input with Custom Class',
		required: false,
		className: 'border-blue-500 focus:border-blue-700',
	},
}
