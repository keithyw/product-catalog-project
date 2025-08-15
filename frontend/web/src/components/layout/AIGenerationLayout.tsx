import React, { useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import WizardLayout from '@/components/layout/WizardLayout'
import PageTitle from '@/components/ui/PageTitle'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { WizardStepType } from '@/types/wizard'

interface AIGenerationLayoutProps {
	successUrl: string
	title: string
	wizardSteps: WizardStepType[]
}

const AIGenerationLayout = ({
	successUrl,
	title,
	wizardSteps,
}: AIGenerationLayoutProps) => {
	const router = useRouter()
	const {
		currentStep,
		isCurrentStepValid,
		isSubmitting,
		error,
		setCurrentStep,
		setError,
		clearDraft,
	} = useAIToolsStore()

	const currentStepHandler = useRef<(() => Promise<boolean>) | null>(null)

	const setStepHandler = (handler: (() => Promise<boolean>) | null) => {
		currentStepHandler.current = handler
	}

	const handleNext = async () => {
		setError('')
		if (!currentStepHandler.current) {
			toast.error('No step handler set')
			return
		}
		const success = await currentStepHandler.current()
		if (!success) {
			toast.error('errors: ' + error)
			return
		}
		const idx = wizardSteps.findIndex(
			(step) => step.id === wizardSteps[currentStep - 1].id,
		)
		const nextIdx = idx + 1
		if (nextIdx < wizardSteps.length) {
			toast.success('Prompt successfully submitted')
			setCurrentStep(nextIdx + 1)
		} else {
			clearDraft()
			toast.success('All steps completed')
			router.push(successUrl)
		}
	}

	const handlePrevious = () => {
		setError('')
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleCancel = () => {
		setError('')
		clearDraft()
	}

	const steps = useMemo(() => {
		return wizardSteps.map((step, i) => ({
			...step,
			isCompleted: i < currentStep - 1,
		}))
	}, [currentStep, wizardSteps])

	const CurrentStep = wizardSteps[currentStep - 1].component

	return (
		<div className='min-h-screen bg-gray-50'>
			<header className='bg-white shadow-sm py-4 px-6 flex justify-between items-center'>
				<PageTitle>{title}</PageTitle>
			</header>
			<main className='container mx-auto py-8 px-4 sm:px-6 lg:px-8'>
				<WizardLayout
					title={title}
					steps={steps}
					currentStepId={wizardSteps[currentStep - 1].id}
					onNext={handleNext}
					onPrevious={handlePrevious}
					onCancel={handleCancel}
					isSubmitting={isSubmitting}
					canGoNext={isCurrentStepValid}
					canGoPrevious={currentStep > 1}
					error={error}
				>
					<CurrentStep setSubmitHandler={setStepHandler} />
				</WizardLayout>
			</main>
		</div>
	)
}

export default AIGenerationLayout
