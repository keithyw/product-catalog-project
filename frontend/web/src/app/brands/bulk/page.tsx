'use client'

import React from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import WizardLayout from '@/components/layout/WizardLayout'
import { BRAND_PERMISSIONS, BRANDS_URL } from '@/lib/constants'
import { useWizardLayoutController } from '@/lib/hooks/useWizardLayoutController'
// import useBrandStore from '@/stores/useBrandStore'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { WizardStepType } from '@/types/wizard'
import PromptStep from './steps/PromptStep'
import ReviewStep from './steps/ReviewStep'

const steps: WizardStepType[] = [
	{
		id: 'bulk-brand-prompt',
		title: 'Bulk Brand Prompt Generation',
		component: PromptStep,
	},
	{
		id: 'bulk-brand-review',
		title: 'Bulk Brand Review',
		component: ReviewStep,
	},
]

const BulkBrandCreationPage = () => {
	const { currentStep, isCurrentStepValid, isSubmitting } = useAIToolsStore()

	const {
		handleCancel,
		handleNext,
		handlePrevious,
		setStepHandler,
		stepsForLayout,
		CurrentStepComponent,
	} = useWizardLayoutController({
		cancelUrl: BRANDS_URL,
		useStore: useAIToolsStore,
		successMessage: '',
		wizardSteps: steps,
	})

	return (
		<PermissionGuard requiredPermission={BRAND_PERMISSIONS.ADD}>
			<WizardLayout
				title='Bulk Brand Creation'
				steps={stepsForLayout}
				currentStepId={steps[currentStep - 1].id}
				onNext={handleNext}
				onPrevious={handlePrevious}
				onCancel={handleCancel}
				isSubmitting={isSubmitting}
				canGoNext={isCurrentStepValid}
				canGoPrevious={currentStep > 1}
			>
				<CurrentStepComponent setSubmitHandler={setStepHandler} />
			</WizardLayout>
		</PermissionGuard>
	)
}

export default BulkBrandCreationPage
