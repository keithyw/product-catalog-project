import { StateCreator } from 'zustand'

export interface WizardSlice {
	currentStep: number
	isCurrentStepValid: boolean
	isSubmitting: boolean
	error: string | null
	setCurrentStep: (step: number) => void
	setIsCurrentStepValid: (isValid: boolean) => void
	setIsSubmitting: (isSubmitting: boolean) => void
	setError: (error: string | null) => void
	reset: () => void
}

export const createWizardSlice: StateCreator<
	WizardSlice,
	[],
	[],
	WizardSlice
> = (set) => ({
	currentStep: 1,
	isCurrentStepValid: false,
	isSubmitting: false,
	error: null,
	setCurrentStep: (step) => set({ currentStep: step }),
	setIsCurrentStepValid: (isValid) => set({ isCurrentStepValid: isValid }),
	setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
	setError: (error) => set({ error }),
	reset: () =>
		set({
			currentStep: 1,
			error: null,
			isSubmitting: false,
			isCurrentStepValid: false,
		}),
})
