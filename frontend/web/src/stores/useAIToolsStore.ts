import { create } from 'zustand'
import { SimpleBrand } from '@/types/ai'

interface AIToolsStore {
	prompt: string
	entityType: string
	brands: SimpleBrand[]
	currentStep: number
	isCurrentStepValid: boolean
	isSubmitting: boolean
	error: string
	setPrompt(prompt: string): void
	setEntityType(type: string): void
	setBrands(brands: SimpleBrand[]): void
	setCurrentStep(step: number): void
	setIsCurrentStepValid(isValid: boolean): void
	setIsSubmitting(submitting: boolean): void
	setError(error: string): void
	clearDraft: () => void
}

const useAIToolsStore = create<AIToolsStore>((set) => ({
	prompt: '',
	entityType: '',
	brands: [],
	currentStep: 1,
	isCurrentStepValid: false,
	isSubmitting: false,
	error: '',
	setPrompt: (prompt: string) => set({ prompt: prompt }),
	setEntityType: (type: string) => set({ entityType: type }),
	setBrands: (b: Omit<SimpleBrand, 'id'>[]) => set({ brands: b }),
	setCurrentStep: (step: number) => set({ currentStep: step }),
	setIsCurrentStepValid: (isValid: boolean) =>
		set({ isCurrentStepValid: isValid }),
	setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
	setError: (error: string) => set({ error: error }),
	clearDraft: () => set({ currentStep: 1 }),
}))

export default useAIToolsStore
