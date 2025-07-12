import type { Meta, StoryObj } from '@storybook/nextjs'
import CardContainer from '@/components/ui/CardContainer'

const meta: Meta<typeof CardContainer> = {
	title: 'UI/CardContainer',
	component: CardContainer,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
	},
}

export default meta

type Story = StoryObj<typeof CardContainer>

export const Default: Story = {
	args: {
		children: (
			<div>
				<h2 className='text-xl font-bold mb-2'>Some Card Stuff</h2>
				<p>Generic card junk</p>
				<button className='mt-4 bg-blue-500 text-white px-4 py-2 rounded'>
					I am card
				</button>
			</div>
		),
	},
}

export const WideCard: Story = {
	args: {
		children: (
			<div>
				<h2 className='text-xl font-bold mb-2'>Wide Peepo Card Happy</h2>
				<p>Wide peepo happy card thingy</p>
			</div>
		),
		className: 'max-w-xl',
	},
}

export const ComplexContent: Story = {
	args: {
		children: (
			<form className='space-y-4'>
				<h2 className='text-2xl font-bold mb-4 text-center'>
					Login Form Example
				</h2>
				<div>
					<label
						htmlFor='username'
						className='block text-sm font-medium text-gray-700'
					>
						Username
					</label>
					<input
						type='text'
						id='username'
						className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
						placeholder='Your username'
					/>
				</div>
				<div>
					<label
						htmlFor='password'
						className='block text-sm font-medium text-gray-700'
					>
						Password
					</label>
					<input
						type='password'
						id='password'
						className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
						placeholder='Your password'
					/>
				</div>
				<button
					type='submit'
					className='w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700'
				>
					Sign In
				</button>
			</form>
		),
		className: 'max-w-md p-10', // Add more padding for form
	},
}
