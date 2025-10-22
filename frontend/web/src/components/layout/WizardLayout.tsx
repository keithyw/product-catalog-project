import React from 'react'
import {
	CheckIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from '@heroicons/react/24/solid'
import Button from '@/components/ui/form/Button'

interface WizardStep {
	id: string
	title: string
	isCompleted?: boolean
	isDisabled?: boolean
}

interface WizardLayoutProps {
	title: string
	finalButtonText?: string
	steps: WizardStep[]
	currentStepId: string
	onNext: () => void
	onPrevious: () => void
	onCancel: () => void
	isSubmitting?: boolean
	canGoNext?: boolean
	canGoPrevious?: boolean
	error?: string | null
	children: React.ReactNode
}

const WizardLayout: React.FC<WizardLayoutProps> = ({
	title,
	finalButtonText = 'Finish',
	steps,
	currentStepId,
	onNext,
	onPrevious,
	onCancel,
	isSubmitting,
	canGoNext,
	canGoPrevious,
	error,
	children,
}) => {
	const currentStepIndex = steps.findIndex((step) => step.id === currentStepId)
	const isFirstStep = currentStepIndex === 0
	const isLastStep = currentStepIndex === steps.length - 1

	return (
		<div className='min-h-screen bg-gray-100 p-4 font-sans'>
			<div className='max-w-6xl mx-auto bg-white shadow-lg rounded-lg flex flex-col md:flex-row'>
				<div className='w-full flex flex-col md:w-1/4 bg-blue-700 text-white p-6 rounded-t-lg md:rounded-l-lg md:rounded-tr-none'>
					<h2 className='text-2xl font-bold mb-6'>{title}</h2>
					<nav>
						<ul className='space-y-3'>
							{steps.map((step, idx) => (
								<li key={step.id}>
									<div
										className={`
                                            flex
                                            items-center
                                            p-3
                                            rounded-md
                                            transition-colors
                                            duration-200
                                            ${step.id === currentStepId ? 'bg-blue-800 font-semibold' : 'hover:bg-blue-600 cursor-pointer'}
                                            ${step.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
									>
										<span className='mr-3'>{idx + 1}</span>
										<span className='flex-grow'>{step.title}</span>
										{step.isCompleted && (
											<CheckIcon
												className='h-5 w-5 ml-auto text-green-300 flex-shrink-0'
												aria-hidden='true'
											/>
										)}
									</div>
								</li>
							))}
						</ul>
					</nav>
				</div>
				<div className='flex-1 p-8 flex flex-col min-w-0'>
					<h1 className='text-3xl font-bold text-gray-800 mb-6'>{title}</h1>
					<div className='flex-grow'>{children}</div>
					{error && (
						<div
							className='mt-4 p-3 bg-red-100 border border-red-00 text-red-700 rounded-md'
							role='alert'
						>
							<p className='font-bold'>Error:</p>
							<p>{error}</p>
						</div>
					)}
					<div className='mt-8 flex items-center'>
						<Button
							actionType='neutral'
							onClick={onPrevious}
							disabled={isFirstStep || !canGoPrevious}
							isLoading={isSubmitting}
							className='mr-auto'
						>
							<span className='flex items-center'>
								<ChevronLeftIcon
									className='-ml-1 mr-2 h-5 w-5'
									aria-hidden='true'
								/>
								Previous
							</span>
						</Button>
						<div className='flex space-x-3'>
							<Button
								actionType='neutral'
								onClick={onCancel}
								isLoading={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								actionType='submit'
								onClick={onNext}
								disabled={isSubmitting || !canGoNext}
								isLoading={isSubmitting}
							>
								<span className='flex items-center'>
									{isLastStep ? finalButtonText : 'Next'}
									{!isLastStep && (
										<ChevronRightIcon
											className='-mr-1 ml-2 h-5 w-5'
											aria-hidden='true'
										/>
									)}
								</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default WizardLayout
