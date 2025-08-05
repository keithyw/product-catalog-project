'use client'

import React, { useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import WizardLayout from '@/components/layout/WizardLayout'
import PageTitle from '@/components/ui/PageTitle'
import { BRANDS_URL } from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { WizardStepType } from '@/types/wizard'
import PromptStep from '@/app/ai-tools/steps/PromptStep'
import ReviewStep from './steps/ReviewStep'

const wizardSteps: WizardStepType[] = [
	{ id: 'prompt', title: 'Generate Prompt', component: PromptStep },
	{ id: 'review', title: 'Review Data', component: ReviewStep },
]

const GeneratePage: React.FC = () => {
	const router = useRouter()
	const {
		currentStep,
		isCurrentStepValid,
		isSubmitting,
		error,
		setCurrentStep,
		// setIsCurrentStepValid,
		// setIsSubmitting,
		setError,
		clearDraft,
	} = useAIToolsStore()

	const entityType = useAIToolsStore((state) => state.entityType)

	const currentStepHandler = useRef<(() => Promise<boolean>) | null>(null)

	const setStepHandler = (handler: (() => Promise<boolean>) | null) => {
		currentStepHandler.current = handler
	}

	const handleNext = async () => {
		setError('')
		if (currentStepHandler.current) {
			const success = await currentStepHandler.current()
			if (success) {
				const idx = wizardSteps.findIndex(
					(step) => step.id === wizardSteps[currentStep - 1].id,
				)
				const nextIdx = idx + 1
				if (nextIdx < wizardSteps.length) {
					toast.success('Prompt successfully submitted')
					setCurrentStep(nextIdx + 1)
				} else {
					clearDraft()
					toast.success(`${entityType} has been uploaded succcessfully!`)
					router.push(BRANDS_URL)
				}
			} else {
				toast.error('errors: ' + error)
			}
		} else {
			toast.error('Handler not implemented')
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
		return wizardSteps.map((step, idx) => ({
			...step,
			isCompleted: idx < currentStep - 1,
		}))
	}, [currentStep])

	const CurrentStep = wizardSteps[currentStep - 1].component

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.CHANGE}>
			<div className='min-h-screen bg-gray-50'>
				<header className='bg-white shadow-sm py-4 px-6 flex justify-between items-centered'>
					<PageTitle>Data Generator</PageTitle>
				</header>
				<main className='container mx-auto py-8 px-4 sm:px-6 lg:px-8'>
					<WizardLayout
						title={`Generate Data`}
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
		</PermissionGuard>
	)
}

export default GeneratePage
