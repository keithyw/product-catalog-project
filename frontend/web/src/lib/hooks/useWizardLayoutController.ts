import { useEffect, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { UseBoundStore, StoreApi } from 'zustand'
import { WizardSlice } from '@/stores/wizardStoreSlice'
import { WizardStepType } from '@/types/wizard'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoreWithWizard = WizardSlice & Record<string, any>

interface useWizardLayoutControllerProps<T> {
	cancelUrl: string
	useStore: UseBoundStore<StoreApi<T>>
	successMessage: string
	wizardSteps: WizardStepType[]
}

export const useWizardLayoutController = <T extends StoreWithWizard>({
	cancelUrl,
	useStore,
	successMessage,
	wizardSteps,
}: useWizardLayoutControllerProps<T>) => {
	const router = useRouter()
	const { currentStep, setCurrentStep, reset } = useStore()

	useEffect(() => {
		reset()
	}, [reset])

	const currentStepHandler = useRef<(() => Promise<boolean>) | null>(null)

	const setStepHandler = (handler: (() => Promise<boolean>) | null) => {
		currentStepHandler.current = handler
	}

	const handleCancel = () => {
		reset()
		router.push(cancelUrl)
	}

	const handleNext = async () => {
		if (currentStepHandler.current) {
			const success = await currentStepHandler.current()
			if (success) {
				const idx = wizardSteps.findIndex(
					(step) => step.id === wizardSteps[currentStep - 1].id,
				)
				const nextIdx = idx + 1
				if (nextIdx < wizardSteps.length) {
					setCurrentStep(nextIdx + 1)
				} else {
					toast.success(successMessage)
					reset()
					router.push(cancelUrl)
				}
			} else {
				toast.error('Please correct the errors in the current step')
			}
		} else {
			toast.error('Current step has issues')
		}
	}

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const stepsForLayout = useMemo(() => {
		return wizardSteps.map((step, idx) => ({
			...step,
			isCompleted: idx < currentStep - 1,
		}))
	}, [wizardSteps, currentStep])

	const CurrentStepComponent = wizardSteps[currentStep - 1].component

	return {
		handleCancel,
		handleNext,
		handlePrevious,
		router,
		setStepHandler,
		stepsForLayout,
		CurrentStepComponent,
	}
}
