import React, { useState } from 'react'
import { Meta, StoryObj } from '@storybook/nextjs'
import WizardLayout from './WizardLayout' // Adjust import path as needed

// Mock components for the wizard steps
const MockStep1: React.FC = () => (
	<div className='p-4 bg-blue-50 rounded-md text-center text-blue-800'>
		This is the content for Step 1: Core Details.
	</div>
)
const MockStep2: React.FC = () => (
	<div className='p-4 bg-green-50 rounded-md text-center text-green-800'>
		This is the content for Step 2: Attribute Template.
	</div>
)
const MockStep3: React.FC = () => (
	<div className='p-4 bg-purple-50 rounded-md text-center text-purple-800'>
		This is the content for Step 3: Dynamic Attributes.
	</div>
)
const MockStep4: React.FC = () => (
	<div className='p-4 bg-yellow-50 rounded-md text-center text-yellow-800'>
		This is the content for Step 4: Review & Publish.
	</div>
)

// Define the steps for our stories (no 'component' needed here anymore)
const mockSteps = [
	{ id: 'step1', title: 'Core Details' },
	{ id: 'step2', title: 'Attribute Template' },
	{ id: 'step3', title: 'Dynamic Attributes' },
	{ id: 'step4', title: 'Review & Publish' },
]

// Map step IDs to their corresponding mock components
const stepComponents: { [key: string]: React.ComponentType } = {
	step1: MockStep1,
	step2: MockStep2,
	step3: MockStep3,
	step4: MockStep4,
}

const meta: Meta<typeof WizardLayout> = {
	title: 'Layout/WizardLayout',
	component: WizardLayout,
	parameters: {
		layout: 'fullscreen', // Use fullscreen layout for better visualization
	},
	argTypes: {
		title: { control: 'text' },
		currentStepId: {
			control: 'select',
			options: mockSteps.map((step) => step.id),
		},
		isSubmitting: { control: 'boolean' },
		canGoNext: { control: 'boolean' },
		canGoPrevious: { control: 'boolean' },
		// onNext, onPrevious, onCancel are actions, not directly controllable via args
		onNext: { action: 'next clicked' },
		onPrevious: { action: 'previous clicked' },
		onCancel: { action: 'cancel clicked' },
		children: { control: false }, // Children are controlled by the render function
	},
	tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof WizardLayout>

// Common render function to avoid duplication and ensure `steps` is always defined
const renderWizardLayout: Story['render'] = (args) => {
	const [currentStepIndex, setCurrentStepIndex] = useState(
		mockSteps.findIndex((step) => step.id === args.currentStepId) !== -1
			? mockSteps.findIndex((step) => step.id === args.currentStepId)
			: 0, // Default to first step if arg not found
	)

	const handleNext = () => {
		if (currentStepIndex < mockSteps.length - 1) {
			setCurrentStepIndex((prev) => prev + 1)
			args.onNext() // Trigger the action for Storybook logs
		}
	}

	const handlePrevious = () => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex((prev) => prev - 1)
			args.onPrevious() // Trigger the action for Storybook logs
		}
	}

	const handleCancel = () => {
		args.onCancel() // Trigger the action for Storybook logs
		// Using a simple console log instead of alert for better Storybook compatibility
		console.log('Cancel action triggered!')
	}

	// Update steps with completion status for sidebar visualization
	const stepsWithStatus = mockSteps.map((step, index) => ({
		...step,
		isCompleted: index < currentStepIndex, // Mark steps before current as completed
		isDisabled: index > currentStepIndex, // Disable future steps
	}))

	// Get the component for the current step
	const CurrentStepComponent =
		stepComponents[stepsWithStatus[currentStepIndex].id]

	return (
		<WizardLayout
			{...args}
			steps={stepsWithStatus}
			currentStepId={stepsWithStatus[currentStepIndex].id}
			onNext={handleNext}
			onPrevious={handlePrevious}
			onCancel={handleCancel}
			canGoNext={currentStepIndex < mockSteps.length - 1} // Enable Next if not last step
			canGoPrevious={currentStepIndex > 0} // Enable Previous if not first step
		>
			{/* Render the current step component as children */}
			{CurrentStepComponent ? (
				<CurrentStepComponent />
			) : (
				<p>Step content not found.</p>
			)}
		</WizardLayout>
	)
}

// Default story with interactive step navigation
export const Default: Story = {
	render: renderWizardLayout, // Use the common render function
	args: {
		title: 'Product Creation Wizard',
		currentStepId: 'step1', // Start at step 1
		isSubmitting: false,
		canGoNext: true,
		canGoPrevious: false,
	},
}

// Story showing a wizard in a submitting state
export const SubmittingState: Story = {
	render: renderWizardLayout, // Use the common render function
	args: {
		...Default.args,
		title: 'Product Creation Wizard (Submitting)',
		isSubmitting: true,
		currentStepId: 'step2', // Example: Submitting from step 2
		canGoNext: false, // Typically cannot go next while submitting
		canGoPrevious: false, // Cannot go previous while submitting
	},
}

// Story showing a wizard with a completed step
export const Step2Completed: Story = {
	render: renderWizardLayout, // Use the common render function
	args: {
		...Default.args,
		title: 'Product Creation Wizard (Step 2 Active, Step 1 Completed)',
		currentStepId: 'step2',
	},
}

// Story showing the last step
export const LastStep: Story = {
	render: renderWizardLayout, // Use the common render function
	args: {
		...Default.args,
		title: 'Product Creation Wizard (Last Step)',
		currentStepId: mockSteps[mockSteps.length - 1].id,
	},
}
