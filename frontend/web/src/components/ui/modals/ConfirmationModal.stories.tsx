import type { Meta, StoryObj } from '@storybook/nextjs'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal' // Adjust path if necessary
import React from 'react'

const meta: Meta<typeof ConfirmationModal> = {
	title: 'UI/ConfirmationModal',
	component: ConfirmationModal,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		isOpen: { control: 'boolean' },
		onClose: { action: 'closed' },
		onConfirm: { action: 'confirmed' },
		title: { control: 'text' },
		message: { control: 'text' },
		confirmButtonText: { control: 'text' },
		cancelButtonText: { control: 'text' },
		confirmButtonClass: { control: 'text' },
		cancelButtonClass: { control: 'text' },
	},
	// Use a decorator to control the modal's open state and simulate actions
	decorators: [
		(Story, context) => {
			const [isOpen, setIsOpen] = React.useState(context.args.isOpen)
			const [isSimulatingConfirm, setIsSimulatingConfirm] =
				React.useState(false)

			React.useEffect(() => {
				setIsOpen(context.args.isOpen)
			}, [context.args.isOpen])

			const handleClose = () => {
				setIsOpen(false)
				context.args.onClose()
			}

			const handleConfirm = async () => {
				setIsSimulatingConfirm(true)
				// Simulate an async operation
				await new Promise((resolve) => setTimeout(resolve, 1500))
				setIsSimulatingConfirm(false)
				setIsOpen(false) // Close after simulation
				context.args.onConfirm() // Trigger Storybook action
			}

			return (
				<div>
					<button
						onClick={() => setIsOpen(true)}
						className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
					>
						Open Confirmation Modal
					</button>
					<Story
						args={{
							...context.args,
							isOpen,
							onClose: handleClose,
							onConfirm: handleConfirm,
							// Update button text/class for loading state simulation
							confirmButtonText: isSimulatingConfirm
								? 'Processing...'
								: context.args.confirmButtonText,
							confirmButtonClass: isSimulatingConfirm
								? 'bg-blue-400 cursor-not-allowed'
								: context.args.confirmButtonClass,
						}}
					/>
				</div>
			)
		},
	],
}

export default meta
type Story = StoryObj<typeof ConfirmationModal>

export const Default: Story = {
	args: {
		isOpen: false, // Start closed, use button to open
		title: 'Confirm Action',
		message:
			'Are you sure you want to proceed with this action? It cannot be undone.',
		confirmButtonText: 'Confirm',
		cancelButtonText: 'Cancel',
		confirmButtonClass:
			'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
		cancelButtonClass: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
	},
}

export const DestructiveAction: Story = {
	args: {
		...Default.args,
		title: 'Delete Item',
		message:
			'This will permanently delete the selected item. Are you absolutely sure?',
		confirmButtonText: 'Delete Forever',
		confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
	},
}

export const CustomLabels: Story = {
	args: {
		...Default.args,
		title: 'Are you ready?',
		message: 'Click "Go!" to start the process or "Stop!" to cancel.',
		confirmButtonText: 'Go!',
		cancelButtonText: 'Stop!',
		confirmButtonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
		cancelButtonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
	},
}
