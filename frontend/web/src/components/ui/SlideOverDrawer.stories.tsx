import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import SlideOverDrawer from './SlideOverDrawer'
import Button from '@/components/ui/form/Button'

const meta: Meta<typeof SlideOverDrawer> = {
	title: 'UI/SlideOverDrawer',
	component: SlideOverDrawer,
	tags: ['autodocs'],
	parameters: {
		// Disables Chromatic's snapshotting for this story
		chromatic: { disableSnapshot: true },
	},
	// The `render` function is used to add state to the story
	// and a button to control the SlideOverDrawer's `isOpen` state.
	render: function Render(args) {
		const [isOpen, setIsOpen] = useState(false)

		return (
			<div className='p-4'>
				<Button actionType='view' onClick={() => setIsOpen(true)}>
					Open Drawer
				</Button>
				<SlideOverDrawer
					{...args}
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
				/>
			</div>
		)
	},
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		title: 'My Slide-Over Drawer',
		children: <p>This is the content of the slide-over drawer.</p>,
	},
}

export const WithLongContent: Story = {
	args: {
		title: 'Drawer with Scrolling Content',
		children: (
			<div>
				{Array.from({ length: 50 }).map((_, index) => (
					<p key={index} className='mb-2'>
						This is some long content to demonstrate the scrolling behavior of
						the drawer. Line {index + 1}.
					</p>
				))}
			</div>
		),
	},
}

export const WiderPanel: Story = {
	args: {
		title: 'A Wider Drawer',
		panelWidthClass: 'max-w-2xl',
		children: (
			<p>
				This drawer uses the <code>panelWidthClass</code> prop to make it wider
				than the default.
			</p>
		),
	},
}
