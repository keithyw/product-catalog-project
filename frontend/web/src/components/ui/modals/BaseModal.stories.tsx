import type { Meta, StoryObj } from '@storybook/nextjs'
import BaseModal from '@/components/ui/modals/BaseModal'
import React from 'react'

const meta: Meta<typeof BaseModal> = {
	title: 'UI/BaseModal',
	component: BaseModal,
	tags: ['autodocs'],
	argTypes: {
		isOpen: { control: 'boolean' },
		onClose: { action: 'closed' },
		children: { control: 'text' },
		initialFocusRef: { control: false },
		panelClassName: { control: 'text' },
	},
	parameters: {
		layout: 'centered',
	},
	decorators: [
		(Story, context) => {
			const [isOpen, setIsOpen] = React.useState(context.args.isOpen)

			React.useEffect(() => {
				setIsOpen(context.args.isOpen)
			}, [context.args.isOpen])

			const handleClose = () => {
				setIsOpen(false)
				context.args.onClose()
			}

			return (
				<div>
					<button
						onClick={() => setIsOpen(true)}
						className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
					>
						Open Modal
					</button>
					<Story args={{ ...context.args, isOpen, onClose: handleClose }} />
				</div>
			)
		},
	],
}

export default meta

type Story = StoryObj<typeof BaseModal>

export const Default: Story = {
	// Use the 'render' function to fully control how the component is rendered in the story.
	// The 'args' object here contains all the props defined in 'meta.argTypes',
	// including the 'onClose' prop that our decorator wired up.
	render: (args) => (
		<BaseModal {...args}>
			<div className='p-4'>
				<h2 className='text-xl font-bold mb-2'>Base Modal Title</h2>
				<p>
					This is the content of the base modal. It can contain any React
					children.
				</p>
				<div className='mt-4 flex justify-end'>
					<button
						className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
						onClick={args.onClose} // Directly use the onClose prop from the story's args
					>
						Close
					</button>
				</div>
			</div>
		</BaseModal>
	),
	args: {
		isOpen: false, // Initial state for the Storybook controls
		panelClassName: '',
	},
}

export const CustomPanelStyling: Story = {
	render: (args) => (
		<BaseModal {...args}>
			<div className='p-4'>
				<h2 className='text-xl font-bold mb-2'>Styled Base Modal</h2>
				<p>This modal has custom panel styling applied via `panelClassName`.</p>
				<div className='mt-4 flex justify-end'>
					<button
						className='px-4 py-2 bg-white text-purple-700 rounded hover:bg-gray-100'
						onClick={args.onClose} // Directly use the onClose prop from the story's args
					>
						Close Styled
					</button>
				</div>
			</div>
		</BaseModal>
	),
	args: {
		...Default.args, // Inherit isOpen: false
		panelClassName:
			'max-w-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
	},
}
